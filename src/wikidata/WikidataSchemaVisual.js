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
import InputSchemaEntityByText from "../components/InputSchemaEntityByText";
import { mkPermalinkLong, params2Form } from "../Permalink";
import { SchemaEntities } from "../resources/schemaEntities";
import WikidataSchemaResults from "./WikidataSchemaResults";

function WikidataSchemaVisual(props) {
  const [permalink, setPermalink] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState(null);
  const [schemaEntity, setSchemaEntity] = useState([]);
  const [lastSchemaEntity, setLastSchemaEntity] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    if (props.location.search) {
      const queryParams = qs.parse(props.location.search);
      let params = paramsFromQueryParams(queryParams);
      if (params["id"]) {
        const schemaEntity = getSchemaEntity(params);
        if (schemaEntity) {
          setSchemaEntity(schemaEntity);
          setLastSchemaEntity(schemaEntity);
        } else setError("Required GET parameter 'ID'");
      }
    }
  }, [props.location.search]);

  useEffect(() => {
    if (schemaEntity) {
      if (schemaEntity.length > 0) {
        // Remove results / errors / permalink from previous query
        resetState();
        // Update history
        setUpHistory();
        fetchSchemaEntity(schemaEntity);
      }
    } else {
      setError(
        `No entity selected, SchemaEntity: ${JSON.stringify(schemaEntity)}`
      );
    }
  }, [schemaEntity]);

  function paramsFromQueryParams(params) {
    let newParams = {};
    if (params.id) newParams["id"] = params.id;
    if (params.lang) newParams["lang"] = params.lang;
    return newParams;
  }

  function getSchemaEntity(params) {
    const id = params["id"];
    const lang = params["lang"] ? params["lang"] : "en";
    const e = SchemaEntities.find((e) => e.id === id);
    if (e) {
      return mkSchemaEntity(e, lang);
    } else {
      setError(`Entity with id ${id} not found`);
    }
  }

  function mkSchemaEntity(e, lang) {
    if (e && e.labels) {
      const labelRecord = e.labels[lang] ? e.labels[lang] : e.labels["en"];
      return [
        {
          id: e.id,
          label: labelRecord.label,
          descr: labelRecord.descr,
          conceptUri: e.conceptUri,
          webUri: e.webUri,
          lang: lang,
        },
      ];
    } else return null;
  }

  const fetchSchemaEntity = async (e) => {
    setLoading(true);
    setProgressPercent(10);
    try {
      const entity = e[0];
      setProgressPercent(30);
      const schemaResult = await axios.get(entity.conceptUri);

      setProgressPercent(70);
      // Prepare params to call visualize schema
      let params = {};
      params["schemaURL"] = entity.conceptUri;
      params["schemaFormat"] = "ShExC";
      params["schemaEngine"] = "ShEx";
      const visual = await axios.post(
        API.schemaVisualize,
        params2Form(params),
        {
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
      setProgressPercent(90);
      setSchemaEntity(e);

      setSchema({
        id: entity.id,
        label: entity.label,
        description: entity.descr,
        webUri: entity.webUri,
        conceptUri: entity.conceptUri,
        shexContent: schemaResult.data,
      });

      setResult(visual.data);
      setPermalink(
        mkPermalinkLong(API.wikidataSchemaVisualRoute, {
          id: entity.id,
          lang: entity.lang,
        })
      );
      setProgressPercent(100);
    } catch (error) {
      setLoading(false);
      setError(
        `Error doing request SchemaEntity: ${JSON.stringify(schemaEntity)}: ${
          error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  function handleSubmit(e) {
    e.preventDefault();
    setSchemaEntity(selectedEntity);
  }

  function setUpHistory() {
    // Store the last search URL in the browser history to allow going back
    if (
      lastSchemaEntity &&
      schemaEntity &&
      lastSchemaEntity.length &&
      schemaEntity.length &&
      lastSchemaEntity[0].id.localeCompare(schemaEntity[0].id) !== 0
    ) {
      // eslint-disable-next-line no-restricted-globals
      history.pushState(
        null,
        document.title,
        mkPermalinkLong(API.wikidataSchemaVisualRoute, {
          id: lastSchemaEntity[0].id,
          lang: lastSchemaEntity[0].lang,
        })
      );
    }
    // Change current url for shareable links
    // eslint-disable-next-line no-restricted-globals
    history.replaceState(
      null,
      document.title,
      mkPermalinkLong(API.wikidataSchemaVisualRoute, {
        id: schemaEntity[0].id,
        lang: schemaEntity[0].lang,
      })
    );

    setLastSchemaEntity(schemaEntity);
  }

  function resetState() {
    setSchema(null);
    setPermalink(null);
    setError(null);
    setProgressPercent(0);
  }

  return (
    <Container>
      <h1>Visualize Wikidata Schema</h1>
      <InputSchemaEntityByText
        endpoint={API.wikidataContact.url}
        onChange={setSelectedEntity}
        entity={selectedEntity}
      />
      <Form onSubmit={handleSubmit} style={{ marginBottom: "10px" }}>
        <Button
          className={"btn-with-icon " + (loading ? "disabled" : "")}
          variant="primary"
          type="submit"
          disabled={loading}
        >
          Visualize schema
          <ReloadIcon className="white-icon" />
        </Button>
      </Form>
      {loading ? (
        <ProgressBar striped animated variant="info" now={progressPercent} />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : schema ? (
        <WikidataSchemaResults
          schema={schema}
          result={result}
          visual={true}
          permalink={permalink}
        />
      ) : null}
    </Container>
  );
}

export default WikidataSchemaVisual;
