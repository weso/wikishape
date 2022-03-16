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
import PageHeader from "../components/PageHeader";
import { mkPermalinkLong } from "../Permalink";
import {
  getQueryText,
  InitialQuery,
  mkQueryTabs,
  paramsFromStateQuery,
  updateStateQuery
} from "../query/Query";
import ResultSparqlQuery from "../results/ResultSparqlQuery";
import axios from "../utils/networking/axiosConfig";
import { mkError } from "../utils/ResponseError";
import { getItemRaw, validateUrl } from "../utils/Utils";

function WikibaseQuery(props) {
  const serverUrl = API.routes.server.wikibaseQuery;

  const [permalink, setPermalink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(InitialQuery);
  const [endpoint, setEndpoint] = useState(API.currentEndpoint());
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
        reqParams[API.queryParameters.wikibase.endpoint]
      ) {
        // Set state => UI
        setEndpoint(reqParams[API.queryParameters.wikibase.endpoint]);
        const finalQuery = updateStateQuery(reqParams, query) || query;
        setQuery(finalQuery);

        const newParams = mkParams(
          reqParams[API.queryParameters.wikibase.endpoint],
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
      [API.queryParameters.wikibase.endpoint]: pEndpoint,
      ...paramsFromStateQuery(pQuery),
    };
  }

  async function mkServerParams(pEndpoint = endpoint, pQuery = query) {
    return {
      [API.queryParameters.wikibase.endpoint]: pEndpoint,
      [API.queryParameters.wikibase.payload]: await getItemRaw(pQuery),
    };
  }

  async function postQuery() {
    setLoading(true);

    try {
      // Get the query text to be sent as payload
      const postData = await mkServerParams();
      if (!postData) throw API.texts.errorFetchingQuery;

      const { data: queryResponse } = await axios.post(serverUrl, postData);

      // If successful, set result and permalink
      setResult(queryResponse);

      setPermalink(mkPermalinkLong(API.routes.client.wikibaseQuery, params));
    } catch (err) {
      setError(mkError(err, serverUrl));
    } finally {
      setLoading(false);
    }
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

  // Place the current URL to the resulting items
  function handleResults(initialResults) {
    const data = initialResults.results.bindings;
    for (let i = 0; i < data.length; i++) {
      Object.keys(data[i]).forEach((key) => {
        let value = data[i][key].value;
        if (value && validateUrl(value)) {
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
      <PageHeader
        title={API.texts.pageHeaders.querySparql}
        details={API.texts.pageExplanations.querySparql}
      />

      <Row>
        <Col>
          <Form onSubmit={handleSubmit} onKeyDown={onKeyDown} onKeyUp={onKeyUp}>
            {mkQueryTabs(query, setQuery)}
            <div className="btn-spinner-container">
              <Button
                variant="primary"
                className={loading ? "disabled" : ""}
                type="submit"
                disabled={loading}
              >
                {API.texts.actionButtons.query}
              </Button>
              {loading && (
                <Spinner
                  className="loading-spinner"
                  animation="border"
                  variant="primary"
                />
              )}
            </div>
          </Form>

          {!loading ? (
            <div>
              {error ? (
                <Alert variant="danger">{error}</Alert>
              ) : result ? (
                <ResultSparqlQuery
                  result={result}
                  permalink={permalink}
                  disabled={
                    getQueryText(query).length + endpoint.length >
                    API.limits.byTextCharacterLimit
                      ? API.sources.byText
                      : query.activeSource === API.sources.byFile
                      ? API.sources.byFile
                      : false
                  }
                />
              ) : null}
            </div>
          ) : null}
        </Col>
      </Row>
    </Container>
  );
}

export default WikibaseQuery;
