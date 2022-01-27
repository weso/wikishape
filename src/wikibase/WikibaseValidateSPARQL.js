import axios from "axios";
import qs from "qs";
import React, { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import ProgressBar from "react-bootstrap/ProgressBar";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { ReloadIcon } from "react-open-iconic-svg";
import API from "../API";
import InputEntitiesByText from "../components/InputEntitiesByText";
import InputSchemaEntityByText from "../components/InputSchemaEntityByText";
import InputShapeLabel from "../components/InputShapeLabel";
import { mkPermalinkLong, params2Form } from "../Permalink";
import ResultValidate from "../results/ResultValidate";
import {
  InitialShex,
  mkShexTabs,
  paramsFromStateShex,
  updateStateShex
} from "../shex/Shex";
import { showQualify } from "../utils/Utils";

function WikibaseValidate(props) {
  // User selected entity and schema (either from wikidata schemas or custom shex)
  const [entity, setEntity] = useState(null);
  const [wikidataSchemaEntity, setWikidataSchemaEntity] = useState(null);
  const [userSchema, setUserSchema] = useState(InitialShex);
  const [schemaTab, setSchemaTab] = useState(API.tabs.wdSchema); // Source of user schema: wikidata or custom ShEx

  // Params to be formatted and sent to the server
  const [params, setParams] = useState(null);

  const [shapeList, setShapeList] = useState([]);
  const [shapeLabel, setShapeLabel] = useState(null);

  const [permalink, setPermalink] = useState(null);
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Progress bar controls
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");

  // Target API endpoint
  const urlServer = API.wikibaseValidate;

  // URL-based loading
  useEffect(() => {
    if (props.location?.search) {
      const urlParams = qs.parse(props.location.search);
      if (
        urlParams[API.queryParameters.entities] &&
        urlParams[API.queryParameters.schema.schema] &&
        urlParams[API.queryParameters.tab]
      ) {
        // Set tab, if possible
        const tab = urlParams[API.queryParameters.tab];
        const entity = JSON.parse(urlParams[API.queryParameters.entities]);
        setEntity([entity]);

        const finalSchema =
          updateStateShex(urlParams, userSchema) || userSchema;

        const params = mkParams(entity?.uri, tab, null, finalSchema);
        if (tab == API.tabs.shexSchema) {
          // If ShEx tab, set User Schema UI
          setUserSchema(finalSchema);
          params = mkParams(entity?.uri, tab, null, finalSchema);
        } else if (tab == API.tabs.wdSchema) {
          // If Wikidata schema tab, set Wikidata schema UI
          const wdEntity = JSON.parse(urlParams[API.queryParameters.entities]);
          setWikidataSchemaEntity(wdEntity);
          setShapeLabel(urlParams[API.queryParameters.schema.label]);
        } else setError("Unrecognized schema source");

        setParams(params);

        // Set params
        // Different behaviour according to the tab?
      } else setError("Could not parse URL parameters");
    }
  }, [props.location.search]);

  // On params changed, submit request
  useEffect(() => {
    if (params && !loading) {
      if (!params[API.queryParameters.payload]) setError("Entity not provided");
      else if (
        !(
          params[API.queryParameters.schema.schema] &&
          (params[API.queryParameters.schema.source] == API.sources.byFile
            ? params[API.queryParameters.schema.schema].name
            : true)
        )
      )
        setError("Schema not provided");
      else {
        resetState();
        postValidate();
      }
      window.scrollTo(0, 0);
    }
  }, [params]);

  const handleChangeEntities = (entities) => {
    const targetEntity = `<${entities[0].uri}>`;
    setEntity(targetEntity);
  };

  const handleChangeShapeLabel = (label) => {
    setShapeLabel(label);
    setResult(null);
  };

  const handleTabChange = (e) => {
    setSchemaTab(e);
  };

  // If the wikidata schema is changed, fetch the schema contents
  function handleWikidataSchemaChange(e) {
    if (Array.isArray(e)) {
      const schemaEntity = e[0];

      setLoading(true);
      setProgressPercent(50);
      setProgressLabel("Retrieving schema info...");

      // Query the API for the schema info
      const params = {
        [API.queryParameters.schema.schema]: schemaEntity.conceptUri,
        [API.queryParameters.schema.source]: API.sources.byUrl,
        [API.queryParameters.schema.format]: API.formats.shexc,
        [API.queryParameters.schema.engine]: API.engines.shex,
      };

      axios
        .post(API.schemaInfo, params2Form(params))
        .then((response) => response.data)
        .then(({ result: { prefixMap, shapes } }) => {
          const shapeList = shapes.map((sl) => showQualify(sl, prefixMap).str);
          const shapeLabel = Array.isArray(shapeList) ? shapeList[0] : "";

          setShapeList(shapeList);
          setShapeLabel(shapeLabel);
        })
        .catch((error) => {
          setError(error.message);
        })
        .finally(resetProgressBar);

      // Set wikidata schema entity
      setWikidataSchemaEntity(e[0]);
    }
  }

  const resetProgressBar = (newLoading = false) => {
    setLoading(newLoading);
    setProgressLabel("");
    setProgressPercent(0);
  };

  // Given a Wikidata Schema, generate the params for the server API
  function paramsFromWikidataSchema(schemaEntity = wikidataSchemaEntity) {
    return {
      [API.queryParameters.schema.schema]: schemaEntity.conceptUri,
      [API.queryParameters.schema.source]: API.sources.byUrl,
      [API.queryParameters.schema.format]: API.formats.shexc,
      [API.queryParameters.schema.engine]: API.formats.defaultShex,
    };
  }

  function handleSubmit(e) {
    e.preventDefault();
    setParams(mkParams());
  }

  // Create params to be sent to the server
  function mkParams(
    payload = entity.uri,
    pSchemaTab = schemaTab,
    wdSchema = wikidataSchemaEntity,
    uSchema = userSchema
  ) {
    const paramsSchema =
      pSchemaTab === API.tabs.wdSchema
        ? paramsFromWikidataSchema(wdSchema)
        : paramsFromStateShex(uSchema);

    return {
      [API.queryParameters.endpoint]:
        localStorage.getItem("url") || API.wikidataContact.url,
      [API.queryParameters.payload]: payload,
      ...paramsSchema,
    };
  }

  function postValidate() {
    // Make server params
    const reqParams = params2Form(params);

    setLoading(true);
    setProgressPercent(15);
    axios
      .post(urlServer, reqParams)
      .then((response) => {
        setProgressPercent(65);
        return response.data;
      })
      .then((data) => {
        setResult({ result }.result);
        // Create and set the permalink value on success
        setPermalink(
          mkPermalinkLong(API.routes.client.wikibaseValidate, {
            ...mkParams(),
            [API.queryParameters.tab]: schemaTab,
            [API.queryParameters.entities]: entity,
            [API.queryParameters.schema.label]: shapeLabel,
          })
        );
        setProgressPercent(100);
      })
      .catch(function(error) {
        setError(`Error validating ${entity}: ${error}`);
      })
      .finally(() => {
        resetProgressBar();
      });
  }

  // Shortcut to know if the user has selected a valid schema
  const isSchemaSelected = () => {
    return (
      (schemaTab == API.tabs.wdSchema && wikidataSchemaEntity) ||
      (schemaTab == API.tabs.shexSchema && userSchema)
    );
  };

  function resetState() {
    setResult(null);
    setPermalink(null);
    setError(null);
    resetProgressBar();
  }

  return (
    <Container>
      <h1>Validate Wikibase entity (through SPARQL query)</h1>
      <h4>
        Target Wikibase:{" "}
        <a target="_blank" rel="noopener noreferrer" href={API.currentUrl()}>
          {API.currentUrl()}
        </a>
      </h4>
      <Row>
        <Form onSubmit={handleSubmit}>
          <InputEntitiesByText
            onChange={handleChangeEntities}
            multiple={false}
            entities={entity}
          />
          <Tabs
            activeKey={schemaTab}
            transition={false}
            id="SchemaTabs"
            onSelect={handleTabChange}
          >
            <Tab eventKey={API.tabs.wdSchema} title="Wikidata schema">
              <InputSchemaEntityByText
                onChange={handleWikidataSchemaChange}
                entity={wikidataSchemaEntity}
              />
            </Tab>
            <Tab eventKey={API.tabs.shexSchema} title="ShEx">
              {mkShexTabs(userSchema, setUserSchema)}
            </Tab>
          </Tabs>
          <InputShapeLabel
            onChange={handleChangeShapeLabel}
            value={shapeLabel}
            shapeList={shapeList}
          />
          <Button
            className={"btn-with-icon " + (loading ? "disabled" : "")}
            variant="primary"
            type="submit"
            disabled={loading}
          >
            Validate entities
            <ReloadIcon className="white-icon" />
          </Button>
        </Form>
      </Row>
      {result || loading || error ? (
        <Row style={{ display: "block" }}>
          {loading ? (
            <ProgressBar
              style={{ width: "100%" }}
              striped
              animated
              variant="info"
              now={progressPercent}
              label={progressLabel}
            />
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : result ? (
            <ResultValidate result={result} permalink={permalink} />
          ) : null}
        </Row>
      ) : null}
    </Container>
  );
}

export default WikibaseValidate;
