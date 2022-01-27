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
import {
  getQueryRaw,
  InitialQuery,
  mkQueryTabs,
  paramsFromStateQuery,
  updateStateQuery
} from "../query/Query";
import ResultWikibaseQuery from "../results/ResultWikibaseQuery";
import { mkError } from "../utils/ResponseError";
import { validateURL } from "../utils/Utils";

function WikibaseQuery(props) {
  const serverUrl = API.routes.server.wikibaseQuery;

  const [permalink, setPermalink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(InitialQuery);
  const [endpoint, setEndpoint] = useState(API.currentEndpoint);
  const [result, setResult] = useState(null);
  const [controlPressed, setControlPressed] = useState(false);

  const [params, setParams] = useState(null);
  const [lastParams, setLastParams] = useState(null);

  const currentUrlHostname = API.currentUrl()
    .split(/\/\//)[1]
    .split("/")[0];

  useEffect(() => {
    if (props.location.search) {
      const reqParams = qs.parse(props.location.search);

      // Get the query and the endpoint
      if (
        reqParams[API.queryParameters.query.query] &&
        reqParams[API.queryParameters.endpoint]
      ) {
        // Set state => UI
        setEndpoint(reqParams[API.queryParameters.endpoint]);
        const finalQuery = updateStateQuery(reqParams, query) || query;
        setQuery(finalQuery);

        const newParams = mkParams(
          reqParams[API.queryParameters.endpoint],
          finalQuery
        );

        setParams(newParams);
        setLastParams(newParams);
      } else setError(API.texts.errorParsingUrl);
    }
  }, [props.location.search]);

  useEffect(() => {
    if (params) {
      if (params[API.queryParameters.query.query]) {
        resetState();
        setUpHistory();
        postQuery();
      } else setError(API.texts.noProvidedQuery);
    }
  }, [params]);

  const divStyle = {
    display: "flex",
    margin: "10px auto",
  };
  const spinnerStyle = {
    marginLeft: "10px",
    visibility: loading ? "visible" : "hidden",
  };

  function handleChange(queryText) {
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

  function handleSubmit(e) {
    e.preventDefault();
    setParams(mkParams());
  }

  function mkParams(pEndpoint = endpoint, pQuery = query) {
    return {
      [API.queryParameters.endpoint]: pEndpoint,
      ...paramsFromStateQuery(pQuery),
    };
  }

  function setUpHistory() {
    // Store the last query in the browser history
    if (
      params &&
      lastParams &&
      JSON.stringify(params) !== JSON.stringify(lastParams)
    ) {
      // eslint-disable-next-line no-restricted-globals
      history.pushState(
        null,
        document.title,
        mkPermalinkLong(API.routes.client.wikibaseQuery, lastParams)
      );
    }
    // Change url for shareable links
    // eslint-disable-next-line no-restricted-globals
    history.replaceState(
      null,
      document.title,
      mkPermalinkLong(API.routes.client.wikibaseQuery, params)
    );

    setLastParams(params);
  }

  async function postQuery() {
    setLoading(true);

    try {
      // Get the query text to be sent as payload
      const queryRaw = await getQueryRaw(query);
      if (!queryRaw) throw "Could not fetch the query data";

      console.info(queryRaw);

      const reqParams = {
        [API.queryParameters.endpoint]: endpoint,
        [API.queryParameters.payload]: queryRaw,
      };
      const { data: queryResult } = await axios.post(
        serverUrl,
        params2Form(reqParams)
      );

      // If successful, set result and permalink
      setResult(queryResult);

      setPermalink(mkPermalinkLong(API.routes.client.wikibaseQuery, params));
    } catch (err) {
      setError(mkError(err, serverUrl));
    } finally {
      setLoading(false);
    }

    // axios.post(serverUrl, params2Form(reqParams)).then(async (response) => {
    //   const { result: apiResponse } = response.data;
    //   const { head, results } = apiResponse;
    //   // Even if the request fails, the RdfShape server returns a 200 status with no data so the client
    //   // has to check if there is any result. Refactor the server to return a more accurate code.
    //   if (results) {
    //     if (results.bindings.length > 0) {
    //       setError(null);
    //       handleResults(apiResponse);
    //     } else {
    //       setError(API.texts.noResultsFound);
    //       setResult(null);
    //     }
    //   }
    // });
  }

  // Place the current URL to the resulting items
  function handleResults(initialResults) {
    const data = initialResults.results.bindings;
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
  }

  return (
    <Container fluid={true}>
      <h1>Query SPARQL endpoint</h1>
      <h4>
        Target endpoint:{" "}
        <a target="_blank" href={endpoint}>
          {endpoint}
        </a>
      </h4>
      <Row>
        <Col>
          <Form onSubmit={handleSubmit} onKeyDown={onKeyDown} onKeyUp={onKeyUp}>
            {mkQueryTabs(query, setQuery)}
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
                <ResultWikibaseQuery result={result} permalink={permalink} />
              ) : null}
            </div>
          ) : null}
        </Col>
      </Row>
    </Container>
  );
}

export default WikibaseQuery;
