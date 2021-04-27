import axios from "axios";
import qs from "query-string";
import React, { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import ProgressBar from "react-bootstrap/ProgressBar";
import { ReloadIcon } from "react-open-iconic-svg";
import API from "../API";
import InputEntitiesByText from "../components/InputEntitiesByText";
import { mkPermalinkLong } from "../Permalink";
import ResultOutgoing from "../results/ResultOutgoing";

function WikidataOutgoing(props) {
  const [entities, setEntities] = useState([]);
  const [lastEntities, setLastEntities] = useState([]);
  const [node, setNode] = useState("");
  const [endpoint, setEndpoint] = useState(API.currentEndpoint);
  const [permalink, setPermalink] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const ApiEndpoint = API.dataOutgoing;

  useEffect(() => {
    if (props.location.search) {
      const queryParams = qs.parse(props.location.search);
      if (queryParams.endpoint) {
        setEndpoint(queryParams.endpoint);
      }
      if (queryParams.entities) {
        let entitiesFromUrl = [];
        try {
          entitiesFromUrl = JSON.parse(queryParams.entities);
        } catch (e) {
          setError("Could not parse parameters from URL");
        }
        setEntities(entitiesFromUrl);
        setLastEntities(entitiesFromUrl);
        if (entitiesFromUrl.length) setNode(entitiesFromUrl[0].uri);
      }
    }
  }, [props.location.search]);

  useEffect(() => {
    if (node) {
      // Remove results / errors / permalink from previous query
      resetState();
      // Update history
      setUpHistory();
      getOutgoing();
    }
  }, [node]);

  function handleChange(es) {
    setEntities(es);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (entities && entities.length > 0) {
      setNode(entities[0].uri);
    } else {
      resetState();
      setError("No entity selected");
    }
  }

  function getOutgoing(cb) {
    setLoading(true);
    const params = {
      endpoint: endpoint,
      node: node,
    };
    setProgressPercent(30);
    axios
      .get(ApiEndpoint, {
        params: params,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        setProgressPercent(70);
        return response.data;
      })
      .then(async (data) => {
        setResult(data);
        setProgressPercent(80);
        setPermalink(
          mkPermalinkLong(API.wikidataOutgoingRoute, {
            ...params,
            entities: JSON.stringify(entities),
          })
        );
        setProgressPercent(90);
        if (cb) cb();
        setProgressPercent(100);
      })
      .catch((error) => {
        setError(`Error processing ${ApiEndpoint}: ${error.message}`);
      })
      .finally(() => setLoading(false));
  }

  function setUpHistory() {
    // Store the last search URL in the browser history to allow going back
    if (
      lastEntities &&
      entities &&
      JSON.stringify(lastEntities) !== JSON.stringify(entities)
    ) {
      // eslint-disable-next-line no-restricted-globals
      history.pushState(
        null,
        document.title,
        mkPermalinkLong(API.wikidataOutgoingRoute, {
          entities: JSON.stringify(lastEntities),
          endpoint: endpoint,
        })
      );
    }
    // Change current url for shareable links
    // eslint-disable-next-line no-restricted-globals
    history.replaceState(
      null,
      document.title,
      mkPermalinkLong(API.wikidataOutgoingRoute, {
        entities: JSON.stringify(entities),
        endpoint: endpoint,
      })
    );

    setLastEntities(entities);
  }

  function resetState() {
    setResult(null);
    setPermalink(null);
    setError(null);
    setEndpoint(API.currentEndpoint());
    setProgressPercent(0);
  }

  return (
    <Container>
      <h1>Outgoing arcs from Wikibase entity</h1>
      <h4>
        Target Wikibase:{" "}
        <a target="_blank" rel="noopener noreferrer" href={API.currentUrl()}>
          {API.currentUrl()}
        </a>
      </h4>
      <InputEntitiesByText
        onChange={handleChange}
        multiple={false}
        entities={entities}
      />
      <Form onSubmit={handleSubmit} style={{marginBottom: "10px"}}>
        <Button
          className={"btn-with-icon " + (loading ? "disabled" : "")}
          variant="primary"
          type="submit"
          disabled={loading}
        >
          Get outgoing arcs
          <ReloadIcon className="white-icon" />
        </Button>
      </Form>
      {loading ? (
        <ProgressBar striped animated variant="info" now={progressPercent} />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : result ? (
        <ResultOutgoing
          entities={entities}
          result={result}
          permalink={permalink}
        />
      ) : null}
    </Container>
  );
}

export default WikidataOutgoing;
