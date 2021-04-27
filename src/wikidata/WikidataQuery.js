import axios from "axios";
import qs from "query-string";
import React, { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import API from "../API";
import { mkPermalinkLong, params2Form } from "../Permalink";
import QueryForm from "../query/QueryForm";
import ResultEndpointQuery from "../results/ResultEndpointQuery";
import { validateURL } from "../utils/Utils";

const QUERY_URI = API.wikidataQuery;

function WikidataQuery(props) {
  const [permalink, setPermalink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [endpoint, setEndpoint] = useState(API.currentEndpoint);
  const [lastEndpoint, setLastEndpoint] = useState("");
  const [result, setResult] = useState(null);
  const [controlPressed, setControlPressed] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const currentUrlHostname = API.currentUrl()
    .split(/\/\//)[1]
    .split("/")[0];

  useEffect(() => {
    // The URL may contain the query and th endpoint encoded. If they are, fill in the text-box with the query
    // and override the user defined endpoint
    if (props.location.search) {
      resetState();
      const params = qs.parse(props.location.search);
      const queryParam = params.query;
      const endpointParam = params.endpoint;
      if (queryParam) {
        if (endpointParam) {
          setEndpoint(endpointParam);
        }
        setQuery(queryParam);
        const codeMirror = document.querySelector("#SPARQL-TextArea")
          .nextSibling.CodeMirror;
        if (codeMirror) codeMirror.setValue(queryParam);
      } else {
        setError(`Invalid request parameters. Use GET parameter 'query'`);
      }
    }
  }, [props.location.search]);

  const divStyle = {
    display: "flex",
    margin: "10px auto",
  };
  const spinnerStyle = {
    marginLeft: "10px",
    visibility: loading ? "visible" : "hidden",
  };

  function handleChange(queryText) {
    // const query = queryText.replace(/^PREFIX.*$/gim, '');
    const query = queryText.trim();
    setQuery(query);
  }

  // Used to query the server on "Control + Enter"
  function onKeyDown(event) {
    const key = event.which || event.keyCode;
    if (key === 17) setControlPressed(true);
    else if (key === 13 && controlPressed) handleSubmit(event);
  }

  function onKeyUp(event) {
    const key = event.which || event.keyCode;
    if (key === 17) setControlPressed(false);
  }

  function handleSubmit(event) {
    if (event) event.preventDefault();
    const formData = params2Form({
      query: query,
      endpoint: endpoint,
    });
    // Remove results / errors / permalink from previous query
    resetState();
    setUpHistory();
    resolveQuery(QUERY_URI, formData);
  }

  function setUpHistory() {
    // Store the last query in the browser history
    if (lastQuery && lastEndpoint) {
      if (
        query.localeCompare(lastQuery) !== 0 ||
        endpoint.localeCompare(lastEndpoint) !== 0
      ) {
        // eslint-disable-next-line no-restricted-globals
        history.pushState(
          null,
          document.title,
          mkPermalinkLong(API.wikidataQueryRoute, {
            query: lastQuery,
            endpoint: lastEndpoint,
          })
        );
      }
    }
    // Change url for shareable links
    // eslint-disable-next-line no-restricted-globals
    history.replaceState(
      null,
      document.title,
      mkPermalinkLong(API.wikidataQueryRoute, {
        query: query,
        endpoint: endpoint,
      })
    );

    setLastQuery(query);
    setLastEndpoint(endpoint);
  }

  function resolveQuery(url, formData) {
    setLoading(true);
    setProgressPercent(20);
    axios
      .post(url, formData, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then(async (response) => {
        setProgressPercent(75);
        const results = response.data.results;
        // TODO: Even if the request fails, the RdfShape server returns a 200 status with no data so the client
        // has to check if there is any result. Refactor the server to return a more accurate code.
        if (results) {
          if (results.bindings.length > 0) {
            setError(null);
            handleResults(response.data);
            setProgressPercent(90);
          }
        } else {
          setError(`Error on request: ${url}:  No results found`);
          setResult(null);
        }
        // Provide a permalink even if the request provided no results
        setPermalink(
          mkPermalinkLong(API.wikidataQueryRoute, {
            query: query,
            endpoint: endpoint,
          })
        );
        setProgressPercent(100);
      })
      .catch((error) => {
        setResult(null);
        setError(`Error on request: ${url}:  ${error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // Place the current URL to the resulting items
  function handleResults(initialResults) {
    let data = initialResults.results.bindings;
    for (let i = 0; i < data.length; i++) {
      Object.keys(data[i]).forEach((key) => {
        let value = data[i][key].value;
        if (value && validateURL(value)) {
          let path = value.split(/\/\//)[1].split(/\/(.+)/)[1];
          data[i][key].value = `${
            value.split(/\/\//)[0]
          }//${currentUrlHostname}/${path}`;
        }
      });
    }
    setResult(initialResults);
  }

  function resetState() {
    setResult(null);
    setPermalink(null);
    setError(null);
    setProgressPercent(0);
  }

  return (
    <Container fluid={true}>
      <h1>Query SPARQL endpoint:</h1>
      <h4>
        Target endpoint: <a href={endpoint}>{endpoint}</a>
      </h4>
      <Row>
        <Col>
          <Form onSubmit={handleSubmit} onKeyDown={onKeyDown} onKeyUp={onKeyUp}>
            <QueryForm
              onChange={handleChange}
              placeholder="select ?id ..."
              value={query}
            />
            <div style={divStyle}>
              <Button
                variant="primary"
                className={loading ? "disabled" : ""}
                type="submit"
                disabled={loading}
              >
                Resolve (Ctrl+Enter)
              </Button>
              <Spinner
                style={spinnerStyle}
                animation="border"
                variant="primary"
              />
            </div>
          </Form>

          {!loading ? (
            <div>
              {error ? (
                <Alert variant="danger">{error}</Alert>
              ) : result ? (
                <ResultEndpointQuery result={result} permalink={permalink} />
              ) : null}
            </div>
          ) : null}
        </Col>
      </Row>
    </Container>
  );
}

export default WikidataQuery;
