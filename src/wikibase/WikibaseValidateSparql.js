import qs from "query-string";
import React, { useEffect, useState } from "react";
import { Col } from "react-bootstrap";
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
import InputSchemaEntityByText from "../components/InputSchemaEntityByText";
import InputShapeLabel from "../components/InputShapeLabel";
import PageHeader from "../components/PageHeader";
import { mkPermalinkLong } from "../Permalink";
import {
  InitialQuery,
  mkQueryTabs,
  paramsFromStateQuery,
  updateStateQuery
} from "../query/Query";
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
import { getItemRaw, sanitizeQualify, showQualify } from "../utils/Utils";

function WikibaseValidateSparql(props) {
  // User selected entity and schema (either from wikidata schemas or custom shex)
  const [query, setQuery] = useState(InitialQuery);
  // This tool needs both the base Wikibase URL and its SPARQL endpoint
  const [endpoint, setEndpoint] = useState(API.currentUrl());
  const [sparqlEndpoint, setSparqlEndpoint] = useState(API.currentEndpoint());
  const [wikidataSchemaEntity, setWikidataSchemaEntity] = useState(null);
  const [userSchema, setUserSchema] = useState(InitialShex);
  const [schemaTab, setSchemaTab] = useState(API.tabs.wdSchema); // Source of user schema: wikidata or custom ShEx

  // Params to be formatted and sent to the server
  const [params, setParams] = useState(null);

  const [lastParams, setLastParams] = useState(null);

  const [shapeList, setShapeList] = useState([]);
  const [shapeLabel, setShapeLabel] = useState(null); // Used locally for the default results search

  const [permalink, setPermalink] = useState(null);
  const [result, setResult] = useState(null);

  const [loadingResult, setLoadingResult] = useState(false);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [error, setError] = useState(null);

  // Progress bar controls
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");

  // Target API endpoint
  const urlServerQuery = API.routes.server.wikibaseQuery;
  const urlServerValidate = API.routes.server.wikibaseValidate;

  // URL-based loading
  useEffect(() => {
    if (props.location?.search) {
      const urlParams = qs.parse(props.location.search);
      if (
        urlParams[API.queryParameters.query.query] &&
        urlParams[API.queryParameters.schema.schema]
      ) {
        const tab = urlParams[API.queryParameters.tab] || schemaTab;

        const finalQuery = updateStateQuery(urlParams, query) || query;
        setQuery(finalQuery);

        const finalSchema =
          updateStateShex(urlParams, userSchema) || userSchema;

        const pEndpoint =
          urlParams[API.queryParameters.wikibase.endpoint || endpoint];
        setEndpoint(pEndpoint);

        const pSparqlEndpoint =
          urlParams[
            API.queryParameters.wikibase.sparqlEndpoint || sparqlEndpoint
          ];
        setSparqlEndpoint(pSparqlEndpoint);

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
          finalQuery,
          tab,
          wdSchemaInUrl,
          finalSchema,
          pEndpoint,
          pSparqlEndpoint,
          pShapeLabel
        );

        setParams(newParams);
        setLastParams(newParams);
      } else setError(API.texts.errorParsingUrl);
    }
  }, [props.location.search]);

  // On params changed, submit request
  useEffect(() => {
    if (params && !loadingResult) {
      if (
        !(
          params[API.queryParameters.query.query] &&
          (params[API.queryParameters.query.source] == API.sources.byFile
            ? params[API.queryParameters.query.query].name
            : true)
        )
      )
        setError("Query not provided");
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
        setUpHistory();
        postValidate();
      }
    }
  }, [params]);

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
      setLoadingSchema(true);

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
            .map((it) => it.split("/").pop()); // Show only last part of shape name for friendly UI

          const shapeLabel = Array.isArray(shapeList) ? shapeList[0] : "";

          setShapeList(shapeList);
          setShapeLabel(shapeLabel);
        })
        .catch((error) => {
          setError(mkError(error.message, urlServerValidate));
        })
        .finally(setLoadingSchema(false));

      // Set wikidata schema entity
      setWikidataSchemaEntity(e[0]);
    }
  }

  const resetProgressBar = (newLoading = false) => {
    setLoadingResult(newLoading);
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
    pQuery = query,
    pSchemaTab = schemaTab,
    wdSchema = wikidataSchemaEntity,
    uSchema = userSchema,
    pEndpoint = endpoint,
    pSparqlEndpoint = sparqlEndpoint,
    pShapeLabel = shapeLabel
  ) {
    const paramsSchema =
      pSchemaTab === API.tabs.wdSchema
        ? paramsFromWikidataSchema(wdSchema)
        : paramsFromStateShex(uSchema);

    return {
      [API.queryParameters.wikibase.endpoint]: pEndpoint,
      [API.queryParameters.wikibase.sparqlEndpoint]: pSparqlEndpoint,
      [API.queryParameters.tab]: pSchemaTab,
      [API.queryParameters.schema.label]: pShapeLabel,
      ...paramsFromStateQuery(pQuery),
      ...paramsSchema,
    };
  }

  async function postValidate() {
    setLoadingResult(true);
    setProgressPercent(15);

    try {
      // Query the server to perform the SPARQL query and get the results back.
      // Send only the necessary parameters.
      const queryServerParams = {
        [API.queryParameters.wikibase.endpoint]:
          params[API.queryParameters.wikibase.sparqlEndpoint],
        [API.queryParameters.wikibase.payload]: await getItemRaw(query),
      };
      const {
        data: {
          result: { results },
        },
      } = await axios.post(urlServerQuery, queryServerParams);
      setProgressPercent(50);

      // Extract entities to be validated from query response.
      const queryResults = results.bindings;
      // Abort if no results
      if (!Array.isArray(queryResults) || queryResults.length == 0) {
        throw { message: "No results obtained from the SPARQL query" };
      }
      // Else extract entity URIs to be validated
      const entitiesToValidate = getValidationItemsFromQueryResults(
        queryResults
      );

      // Abort if no valid URIs pointing to entities to be validated were returned
      if (entitiesToValidate.length == 0) {
        throw {
          message: `The SPARQL query was successful but did not return any node item to be validated.
             Make your query return the entities you want to validate in one of the output variables.
            `,
        };
      }

      // Query the server for validation data.
      // Set the payload to the data retrieved from the query.
      // Add the schema as well
      const validateServerParams = {
        [API.queryParameters.wikibase.endpoint]:
          params[API.queryParameters.wikibase.endpoint],
        [API.queryParameters.wikibase.payload]: entitiesToValidate.join("|"),
        [API.queryParameters.schema.schema]: await mkServerSchemaParams(),
      };
      const { data: validationResponse } = await axios.post(
        urlServerValidate,
        validateServerParams
      );
      setProgressPercent(80);

      setResult(validationResponse);
      // Create and set the permalink value on success
      setPermalink(
        mkPermalinkLong(API.routes.client.wikibaseValidateSparql, params)
      );
    } catch (err) {
      setError(mkError(err, urlServerValidate));
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
        mkPermalinkLong(API.routes.client.wikibaseValidateSparql, lastParams)
      );
    }
    // Change current url for shareable links
    // eslint-disable-next-line no-restricted-globals
    history.replaceState(
      null,
      document.title,
      mkPermalinkLong(API.routes.client.wikibaseValidateSparql, params)
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

  // When validating the entities returned from a SPARQL query, the query may not return any valid
  // item for validation (i.e.: it may just return integer literals, etc.)
  // This function tries to sanitize the query results and search for the items to be validated
  // without bothering the user
  function getValidationItemsFromQueryResults(queryResults) {
    return queryResults
      .reduce((acc, currentResultObject) => {
        const newEntities = Object.keys(currentResultObject).map(
          (key) =>
            // Only select URIs for validationg, not literals, etc.
            currentResultObject[key]?.type === "uri" &&
            // Only select URIs beloging to the current target
            API.currentUrl().includes(
              new URL(currentResultObject[key].value).host
            ) &&
            currentResultObject[key].value
        );
        return [...acc, ...newEntities];
      }, [])
      .filter(Boolean); // Remove falsy leftovers
  }

  function resetState() {
    setResult(null);
    setPermalink(null);
    setError(null);
    resetProgressBar();
  }

  return (
    <Container fluid={true}>
      <PageHeader
        title={API.texts.pageHeaders.validateWbEntitiesSparql}
        details={API.texts.pageExplanations.validateWbEntitiesSparql}
      />

      <Row>
        <Col className={"half-col border-right"}>
          <Form onSubmit={handleSubmit}>
            {mkQueryTabs(query, setQuery)}
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
                {wikidataSchemaEntity &&
                  shapeList?.length != 0 &&
                  schemaTab === API.tabs.wdSchema && (
                    <InputShapeLabel
                      onChange={handleChangeShapeLabel}
                      value={shapeLabel}
                      shapeList={shapeList}
                    />
                  )}
              </Tab>
              <Tab eventKey={API.tabs.shexSchema} title="ShEx">
                {mkShexTabs(userSchema, setUserSchema, "")}
              </Tab>
            </Tabs>

            <Button
              className={
                "btn-with-icon " +
                (loadingResult || loadingSchema ? "disabled" : "")
              }
              variant="primary"
              type="submit"
              disabled={loadingResult || loadingSchema ? true : false}
            >
              {API.texts.actionButtons.validateEntities}
              <ReloadIcon className="white-icon" />
            </Button>
          </Form>
        </Col>

        <Col className={"half-col"}>
          {result || loadingResult || error ? (
            <>
              {loadingResult ? (
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
                <ResultValidate
                  result={result}
                  options={{
                    defaultSearch:
                      schemaTab === API.tabs.wdSchema ? shapeLabel : "",
                  }}
                  permalink={permalink}
                />
              ) : null}
            </>
          ) : null}
        </Col>
      </Row>
    </Container>
  );
}

export default WikibaseValidateSparql;
