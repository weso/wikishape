import axios from "axios";
import * as qs from "qs";
import React, { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import ProgressBar from "react-bootstrap/ProgressBar";
import Table from "react-bootstrap/Table";
import { ReloadIcon } from "react-open-iconic-svg";
import API from "../API";
import InputEntitiesByText from "../components/InputEntitiesByText";
import environmentConfiguration from "../EnvironmentConfig";
import { mkPermalinkLong } from "../Permalink";
import ResultDataExtract from "../results/ResultDataExtract";

function WikidataSheXer(props) {
  const [entities, setEntities] = useState([]);
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [lastEntities, setLastEntities] = useState([]);
  const [permalink, setPermalink] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  // Shexer web service location
  const url = environmentConfiguration.shexerHost;

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
        postExtract(sheXerParams(entities[0].uri));
      }
    } else {
      setError(
        `No entities selected, SchemaEntity: ${JSON.stringify(entities)}`
      );
    }
  }, [entities]);

  function sheXerParams(entity) {
    return {
      prefixes: {
        "http://wikiba.se/ontology#": "wikibase",
        "http://www.bigdata.com/rdf#": "bd",
        "http://www.wikidata.org/entity/": "wd",
        "http://www.wikidata.org/prop/direct/": "wdt",
        "http://www.wikidata.org/prop/direct-normalized/": "wdtn",
        "http://www.wikidata.org/entity/statement/": "wds",
        "http://www.wikidata.org/prop/": "p",
        "http://www.wikidata.org/reference/": "wdref",
        "http://www.wikidata.org/value/": "wdv",
        "http://www.wikidata.org/prop/statement/": "ps",
        "http://www.wikidata.org/prop/statement/value/": "psv",
        "http://www.wikidata.org/prop/statement/value-normalized/": "psn",
        "http://www.wikidata.org/prop/qualifier/": "pq",
        "http://www.wikidata.org/prop/qualifier/value/": "pqv",
        "http://www.wikidata.org/prop/qualifier/value-normalized/": "pqn",
        "http://www.wikidata.org/prop/reference/": "pr",
        "http://www.wikidata.org/prop/reference/value/": "prv",
        "http://www.wikidata.org/prop/reference/value-normalized/": "prn",
        "http://www.wikidata.org/prop/novalue/": "wdno",
      },
      shape_map:
        "SPARQL'SELECT DISTINCT ?virus WHERE {   VALUES ?virus {  wd:Q82069695  }  }'@<Virus>  ",
      endpoint: "https://query.wikidata.org/sparql",
      all_classes: false,
      query_depth: 2,
      threshold: 0,
      instantiation_prop: "http://www.wikidata.org/prop/direct/P31",
      disable_comments: true,
      shape_qualifiers_mode: true,
      namespaces_for_qualifiers: ["http://www.wikidata.org/prop/"],
    };
  }

  function handleChange(es) {
    setSelectedEntities(es);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setEntities(selectedEntities);
  }

  function postExtract(jsonData, cb) {
    setLoading(true);
    setProgressPercent(30);

    axios
      .post(url, jsonData, { headers: { "Content-type": "Application/json" } })
      .then((response) => {
        setProgressPercent(70);
        return response.data;
      })
      .then(async (data) => {
        setResult(data);
        if (cb) cb();
        setProgressPercent(90);
        setPermalink(
          mkPermalinkLong(API.wikidataSheXerRoute, {
            entities: JSON.stringify(entities),
          })
        );
        setProgressPercent(100);
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
      lastEntities.length &&
      entities.length &&
      lastEntities[0].uri.localeCompare(entities[0].uri) !== 0
    ) {
      // eslint-disable-next-line no-restricted-globals
      history.pushState(
        null,
        document.title,
        mkPermalinkLong(API.wikidataSheXerRoute, {
          entities: JSON.stringify(lastEntities),
        })
      );
    }
    // Change current url for shareable links
    // eslint-disable-next-line no-restricted-globals
    history.replaceState(
      null,
      document.title,
      mkPermalinkLong(API.wikidataSheXerRoute, {
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
      <h1>Extract schema from Wikibase entities (sheXer)</h1>
      <InputEntitiesByText
        endpoint={API.wikidataContact.url}
        onChange={handleChange}
        entities={entities}
      />
      <Table>
        <tbody>
          {entities.map((e) => (
            <tr key={e.id || e.uri}>
              <td>{e.label || "Unknown label"}</td>
              <td>
                {(
                  <a target="_blank" rel="noopener noreferrer" href={e.uri}>
                    {e.uri}
                  </a>
                ) || "Unknown URI"}
              </td>
              <td>{e.descr || "No description provided"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
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

export default WikidataSheXer;
