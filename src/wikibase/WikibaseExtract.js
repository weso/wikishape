import axios from "axios";
import * as qs from "qs";
import React, { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import ProgressBar from "react-bootstrap/ProgressBar";
import { ReloadIcon } from "react-open-iconic-svg";
import API from "../API";
import InputEntitiesByText from "../components/InputEntitiesByText";
import { mkPermalinkLong, params2Form } from "../Permalink";
import ResultDataExtract from "../results/ResultDataExtract";

function WikibaseExtract(props) {
  const [entities, setEntities] = useState([]);
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [lastEntities, setLastEntities] = useState([]);
  const [permalink, setPermalink] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const url = API.routes.server.wikibaseExtract;

  useEffect(() => {
    if (props.location.search) {
      const queryParams = qs.parse(props.location.search.substring(1));
      if (queryParams.entities) {
        let entitiesFromUrl = [];
        try {
          entitiesFromUrl = JSON.parse(queryParams.entities);
        } catch (e) {
          setError("Could not parse parameters from URL");
        }
        setSelectedEntities(entitiesFromUrl);
        setEntities(entitiesFromUrl);
        setLastEntities(entitiesFromUrl);
      }
    }
  }, [props.location.search]);

  useEffect(() => {
    if (entities) {
      if (entities.length && entities[0].uri) {
        // Remove results / errors / permalink from previous query
        resetState();
        // Update history
        setUpHistory();
        postExtract();
      }
    } else {
      setError(
        `No entities selected, SchemaEntity: ${JSON.stringify(entities)}`
      );
    }
  }, [entities]);

  function handleChange(es) {
    setSelectedEntities(es);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setEntities(selectedEntities);
  }

  function postExtract(cb) {
    setLoading(true);
    setProgressPercent(10);
    const params = {
      // Pending to process more than the first entity
      [API.queryParameters.endpoint]: API.wikidataContact.url,
      [API.queryParameters.payload]: entities[0].uri,
    };
    const formData = params2Form(params);
    setProgressPercent(30);
    axios
      .post(url, formData)
      .then((response) => {
        setProgressPercent(70);
        return response.data;
      })
      .then(async ({ result }) => {
        setResult(result);
        setProgressPercent(100);
        setPermalink(
          mkPermalinkLong(API.routes.client.wikibaseExtract, {
            entities: JSON.stringify(entities),
          })
        );
        if (cb) cb();
      })
      .catch(function(error) {
        const errorCause = error.response?.data?.error || error;
        setError(`Error response from ${url}: ${errorCause}`);
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
        mkPermalinkLong(API.routes.client.wikibaseExtract, {
          entities: JSON.stringify(lastEntities),
        })
      );
    }
    // Change current url for shareable links
    // eslint-disable-next-line no-restricted-globals
    history.replaceState(
      null,
      document.title,
      mkPermalinkLong(API.routes.client.wikibaseExtract, {
        entities: JSON.stringify(entities),
      })
    );

    setLastEntities(entities);
  }

  function resetState() {
    setResult(null);
    setPermalink(null);
    setError(null);
    setProgressPercent(0);
  }

  return (
    <Container>
      <h1>Extract schema from Wikidata entities</h1>
      {/* This functionality only works with wikidata so this typeahead will look for Wikidata entities
            even if another endpoint was configured
         */}
      <InputEntitiesByText
        endpoint={API.wikidataContact.url}
        onChange={handleChange}
        entities={entities}
      />

      <Form onSubmit={handleSubmit} style={{ marginBottom: "10px" }}>
        <Button
          className={"btn-with-icon " + (loading ? "disabled" : "")}
          variant="primary"
          type="submit"
          disabled={loading}
        >
          Extract schema
          <ReloadIcon className="white-icon" />
        </Button>
      </Form>
      {loading ? (
        <ProgressBar striped animated variant="info" now={progressPercent} />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : result ? (
        <ResultDataExtract
          result={result}
          entities={selectedEntities}
          permalink={permalink}
        />
      ) : null}
    </Container>
  );
}

export default WikibaseExtract;
