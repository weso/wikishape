import qs from "query-string";
import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import ProgressBar from "react-bootstrap/ProgressBar";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { ReloadIcon } from "react-open-iconic-svg";
import ExternalLinkIcon from "react-open-iconic-svg/dist/ExternalLinkIcon";
import API from "../API";
import InputEntitiesByText from "../components/InputEntitiesByText";
import InputSchemaEntityByText from "../components/InputSchemaEntityByText";
import InputShapeLabel from "../components/InputShapeLabel";
import PageHeader from "../components/PageHeader";
import { mkPermalinkLong } from "../Permalink";
import { SchemaEntities } from "../resources/schemaEntities";
import ResultValidate from "../results/ResultValidate";
import {
  InitialShex,
  mkShexServerParams,
  mkShexTabs,
  paramsFromStateShex,
  updateStateShex
} from "../shex/Shex";
import axios from "../utils/networking/axiosConfig";
import { mkError } from "../utils/ResponseError";
import { sanitizeQualify, showQualify } from "../utils/Utils";

function WikibaseValidate(props) {
  // User selected entity and schema (either from wikidata schemas or custom shex)
  const [entities, setEntities] = useState([]);
  const [endpoint, setEndpoint] = useState(API.currentUrl());
  const [wikidataSchemaEntity, setWikidataSchemaEntity] = useState(null);
  const [userSchema, setUserSchema] = useState(InitialShex);
  const [schemaTab, setSchemaTab] = useState(API.tabs.wdSchema); // Source of user schema: wikidata or custom ShEx

  // Params to be formatted and sent to the server
  const [params, setParams] = useState(null);

  const [lastParams, setLastParams] = useState(null);

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
  const urlServer = API.routes.server.wikibaseValidate;

  // URL-based loading
  useEffect(() => {
    if (props.location?.search) {
      const urlParams = qs.parse(props.location.search);
      if (
        urlParams[API.queryParameters.wikibase.payload] &&
        urlParams[API.queryParameters.schema.schema] &&
        urlParams[API.queryParameters.wikibase.endpoint]
      ) {
        const tab = urlParams[API.queryParameters.tab] || schemaTab;
        const pEntities = urlParams[API.queryParameters.wikibase.payload]
          .split("|")
          .map((ent) => ({
            uri: ent,
          }));
        setEntities(pEntities);

        const finalSchema =
          updateStateShex(urlParams, userSchema) || userSchema;

        const pEndpoint =
          urlParams[API.queryParameters.wikibase.endpoint || endpoint];
        setEndpoint(pEndpoint);

        const pShapeLabel =
          urlParams[API.queryParameters.schema.label || shapeLabel];
        setShapeLabel(pShapeLabel);

        const wdSchemaInUrl = SchemaEntities.find(
          (e) => e.conceptUri === finalSchema.url
        );

        if (wdSchemaInUrl) {
          // 1) If "finalSchema" is one of the Wikidata schemas, set the Wikidata schema tab,
          // and the wikidataSchemaEntity
          setWikidataSchemaEntity(wdSchemaInUrl);
          setSchemaTab(API.tabs.wdSchema);
        } else {
          // 2) Else, set the ShEx schema tab with the appropiate data in the "userSchema"
          setUserSchema(finalSchema);
          setSchemaTab(API.tabs.shexSchema);
        }

        // Set new params accordingly
        const newParams = mkParams(
          pEntities,
          tab,
          wdSchemaInUrl,
          finalSchema,
          pEndpoint,
          pShapeLabel
        );

        setParams(newParams);
        setLastParams(newParams);
      } else setError(API.texts.errorParsingUrl);
    }
  }, [props.location.search]);

  // On params changed, submit request
  useEffect(() => {
    if (params && !loading) {
      if (!params[API.queryParameters.wikibase.payload])
        setError(API.texts.noProvidedEntity);
      else if (
        !(
          params[API.queryParameters.schema.schema] &&
          (params[API.queryParameters.schema.source] == API.sources.byFile
            ? params[API.queryParameters.schema.schema].name
            : true)
        )
      )
        setError(API.texts.noProvidedSchema);
      else {
        resetState();
        setUpHistory();
        postValidate();
      }
    }
  }, [params]);

  const handleChangeEntities = (entities) => {
    setEntities(entities);
  };

  const handleChangeShapeLabel = (label) => {
    setShapeLabel(label);
  };

  const handleTabChange = (e) => {
    setSchemaTab(e);
  };

  // If the wikidata schema is changed, fetch the schema contents
  function handleWikidataSchemaChange(e) {
    if (Array.isArray(e) && e.length > 0) {
      const schemaEntity = e[0];
      resetState();
      setLoading(true);
      setProgressPercent(50);
      setProgressLabel("Retrieving schema info...");

      // Query the API for the schema info
      const params = {
        [API.queryParameters.schema.schema]: {
          [API.queryParameters.content]: schemaEntity.conceptUri,
          [API.queryParameters.source]: API.sources.byUrl,
          [API.queryParameters.format]: API.formats.shexc,
          [API.queryParameters.engine]: API.engines.shex,
        },
      };

      axios
        .post(API.routes.server.schemaInfo, params)
        .then((response) => response.data)
        .then(({ result: { prefixMap, shapes } }) => {
          const shapeList = shapes
            .map((sl) => showQualify(sl, prefixMap).str)
            .map((e) => sanitizeQualify(e))
            .map((it) => it.split("/").pop()); // Show only last part of shape name for friendly UI;
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
      [API.queryParameters.schema.schema]: schemaEntity?.conceptUri,
      [API.queryParameters.schema.source]: API.sources.byUrl,
      [API.queryParameters.schema.format]: API.formats.shexc,
      [API.queryParameters.schema.engine]: API.engines.defaultShex,
    };
  }

  async function mkServerSchemaParams(
    pSchema = schemaTab === API.tabs.wdSchema
      ? wikidataSchemaEntity
      : userSchema
  ) {
    // Make the schema differently for a Wikidata schema vs User manual schema
    return schemaTab === API.tabs.wdSchema
      ? {
          [API.queryParameters.content]: pSchema.conceptUri,
          [API.queryParameters.source]: API.sources.byUrl,
          [API.queryParameters.format]: API.formats.shexc,
          [API.queryParameters.engine]: API.engines.shex,
        }
      : {
          ...(await mkShexServerParams(pSchema)),
        };
  }

  function handleSubmit(e) {
    e.preventDefault();
    setParams(mkParams());
  }

  // Create params to be sent to the server
  function mkParams(
    pEntities = entities,
    pSchemaTab = schemaTab,
    wdSchema = wikidataSchemaEntity,
    uSchema = userSchema,
    pEndpoint = endpoint,
    pShapeLabel = shapeLabel
  ) {
    const paramsSchema =
      pSchemaTab === API.tabs.wdSchema
        ? paramsFromWikidataSchema(wdSchema)
        : paramsFromStateShex(uSchema);

    return {
      [API.queryParameters.wikibase.endpoint]: pEndpoint,
      [API.queryParameters.wikibase.payload]: pEntities
        .map((ent) => ent.uri)
        .join("|"), // List of entities joined by "|"
      [API.queryParameters.tab]: pSchemaTab,
      [API.queryParameters.schema.label]: pShapeLabel,
      ...paramsSchema,
    };
  }

  async function postValidate() {
    setLoading(true);
    setProgressPercent(15);

    try {
      const postParams = {
        [API.queryParameters.wikibase.endpoint]: endpoint,
        [API.queryParameters.wikibase.payload]: entities
          .map((ent) => ent.uri)
          .join("|"),
        [API.queryParameters.schema.schema]: await mkServerSchemaParams(),
      };
      setProgressPercent(30);
      const { data: serverResponse } = await axios.post(urlServer, postParams);

      setProgressPercent(70);
      setResult(serverResponse);
      // Create and set the permalink value on success
      setPermalink(mkPermalinkLong(API.routes.client.wikibaseValidate, params));
    } catch (err) {
      setError(mkError(err, urlServer));
    } finally {
      resetProgressBar();
    }
  }

  function setUpHistory() {
    // Store the last search URL in the browser history to allow going back
    if (
      lastParams &&
      params &&
      JSON.stringify(lastParams) !== JSON.stringify(params)
    ) {
      // eslint-disable-next-line no-restricted-globals
      history.pushState(
        null,
        document.title,
        mkPermalinkLong(API.routes.client.wikibaseValidate, lastParams)
      );
    }
    // Change current url for shareable links
    // eslint-disable-next-line no-restricted-globals
    history.replaceState(
      null,
      document.title,
      mkPermalinkLong(API.routes.client.wikibaseValidate, params)
    );

    setLastParams(params);
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
      <Row>
        <PageHeader
          title={API.texts.pageHeaders.validateWbEntities}
          details={API.texts.pageExplanations.validateWbEntities}
        />

        <Form className="width-100" onSubmit={handleSubmit}>
          <InputEntitiesByText
            onChange={handleChangeEntities}
            multiple={true}
            entities={entities}
          />
          {/* Table with the entities being validated. Information for the user */}
          <Table>
            <tbody>
              {entities.map(({ id, uri, label, descr: description }) => (
                <tr key={id || uri}>
                  {label && <td>{label}</td>}
                  <td>
                    {(
                      <a target="_blank" rel="noopener noreferrer" href={uri}>
                        {uri}
                        <ExternalLinkIcon />
                      </a>
                    ) || "Unknown URI"}
                  </td>
                  {description && (
                    <td>{description || "No description provided"}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
          <hr />
          <Tabs
            activeKey={schemaTab}
            id="SchemaTabs"
            onSelect={handleTabChange}
            mountOnEnter={true}
          >
            <Tab eventKey={API.tabs.wdSchema} title="Wikidata schema">
              <InputSchemaEntityByText
                onChange={handleWikidataSchemaChange}
                entity={wikidataSchemaEntity}
              />
            </Tab>
            <Tab eventKey={API.tabs.shexSchema} title="ShEx">
              {mkShexTabs(userSchema, setUserSchema, "")}
            </Tab>
          </Tabs>
          {wikidataSchemaEntity &&
            shapeList?.length != 0 &&
            schemaTab === API.tabs.wdSchema && (
              <InputShapeLabel
                onChange={handleChangeShapeLabel}
                value={shapeLabel}
                shapeList={shapeList}
              />
            )}
          <Button
            className={"btn-with-icon " + (loading ? "disabled" : "")}
            variant="primary"
            type="submit"
            disabled={loading}
          >
            {API.texts.actionButtons.validateEntities}
            <ReloadIcon className="white-icon" />
          </Button>
        </Form>
      </Row>
      {result || loading || error ? (
        <Row style={{ display: "block" }}>
          <br />
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
            <>
              <hr />
              <ResultValidate
                result={result}
                entities={entities}
                options={{
                  defaultSearch:
                    schemaTab === API.tabs.wdSchema ? shapeLabel : "",
                }}
                permalink={permalink}
              />
            </>
          ) : null}
        </Row>
      ) : null}
    </Container>
  );
}

export default WikibaseValidate;
