import qs from "query-string";
import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import ProgressBar from "react-bootstrap/ProgressBar";
import { ExternalLinkIcon, ReloadIcon } from "react-open-iconic-svg";
import API from "../API";
import InputSchemaEntityByText from "../components/InputSchemaEntityByText";
import PageHeader from "../components/PageHeader";
import { mkPermalinkLong } from "../Permalink";
import { SchemaEntities } from "../resources/schemaEntities";
import axios from "../utils/networking/axiosConfig";
import { mkError } from "../utils/ResponseError";
import { shexToXmi } from "../utils/xmiUtils/shumlexUtils";
import WikibaseSchemaResults from "./WikibaseSchemaResults";

function WikibaseSchemaInfo(props) {
  const urlServerInfo = API.routes.server.schemaInfo;
  const urlServerVisual = API.routes.server.schemaConvert;

  const [endpoint, setEndpoint] = useState(API.currentEndpoint());

  const [permalink, setPermalink] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [schemaEntities, setSchemaEntities] = useState([]);

  const [result, setResult] = useState(null);
  const [params, setParams] = useState(null);
  const [lastParams, setLastParams] = useState(null);

  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    if (props.location?.search) {
      const urlParams = qs.parse(props.location.search);
      if (urlParams[API.queryParameters.wikibase.endpoint]) {
        setEndpoint(urlParams[API.queryParameters.wikibase.endpoint]);
      }
      // If parameter ID is present: go, else error
      if (urlParams[API.queryParameters.id]) {
        const entity = getSchemaEntity(urlParams, setError);
        setSchemaEntities([entity]);

        const newParams = mkParams(entity);
        setParams(newParams);
        setLastParams(newParams);
      } else setError(API.texts.errorParsingUrl);
    }
  }, [props.location.search]);

  useEffect(() => {
    if (params) {
      if (params[API.queryParameters.id]) {
        resetState();
        setUpHistory();
        postInfo();
      } else setError(API.texts.noProvidedSchema);
    }
  }, [params]);

  async function postInfo() {
    setLoading(true);
    setProgressPercent(10);

    const baseParams = await mkServerParams();
    try {
      // 1. Schema info
      const infoParams = baseParams;
      const { data: resultInfo } = await axios.post(urlServerInfo, infoParams);
      setProgressPercent(40);
      // 2. Schema SVG
      const toSvgParams = {
        ...baseParams,
        [API.queryParameters.targetFormat]: API.formats.svg,
      };
      const { data: resultSvg } = await axios.post(
        urlServerVisual,
        toSvgParams
      );

      setProgressPercent(60);

      // 3. Schema UML
      const umlFromSchema = await shexToXmi(
        baseParams[API.queryParameters.schema.schema]
      );

      const newResult = {
        resultInfo,
        resultSvg,
        resultUml: umlFromSchema,
      };

      // Merge results from both info and convert and set the state
      setResult(newResult);

      // Create and set the permalink value on success
      setPermalink(
        mkPermalinkLong(API.routes.client.wikibaseSchemaInfo, {
          [API.queryParameters.schema.schema]: schemaEntities[0].id,
          [API.queryParameters.wikibase.lang]: schemaEntities[0].lang,
        })
      );
    } catch (error) {
      setError(mkError(error, urlServerInfo));
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setParams(mkParams());
  }

  // Make params for client usage
  function mkParams(pSchemaEntity = schemaEntities[0]) {
    if (pSchemaEntity) {
      return {
        [API.queryParameters.id]: pSchemaEntity.id,
        [API.queryParameters.wikibase.lang]: pSchemaEntity.lang,
      };
    }
  }

  // Make params to be sent to the server API endpoint to perform operations on the schema
  async function mkServerParams(pSchemaEntity = schemaEntities[0]) {
    return {
      [API.queryParameters.schema.schema]: {
        [API.queryParameters.content]: pSchemaEntity.conceptUri,
        [API.queryParameters.source]: API.sources.byUrl,
        [API.queryParameters.format]: API.formats.shexc,
        [API.queryParameters.engine]: API.engines.shex,
      },
    };
  }

  function setUpHistory() {
    // Store the last search URL in the browser history to allow going back
    if (
      params &&
      lastParams &&
      JSON.stringify(params) !== JSON.stringify(lastParams)
    ) {
      // eslint-disable-next-line no-restricted-globals
      history.pushState(
        null,
        document.title,
        mkPermalinkLong(API.routes.client.wikibaseSchemaInfo, {
          [API.queryParameters.id]: lastParams.id,
          [API.queryParameters.wikibase.lang]: lastParams.lang,
        })
      );
    }
    // Change current url for shareable links
    // eslint-disable-next-line no-restricted-globals
    history.replaceState(
      null,
      document.title,
      mkPermalinkLong(API.routes.client.wikibaseSchemaInfo, {
        [API.queryParameters.id]: params.id,
        [API.queryParameters.wikibase.lang]: params.lang,
      })
    );

    setLastParams(params);
  }

  function resetState() {
    setPermalink(null);
    setError(null);
    setProgressPercent(0);
  }

  return (
    <Container>
      <PageHeader
        title={API.texts.pageHeaders.schemaInfo}
        details={API.texts.pageExplanations.schemaInfo}
      />
      {/* Limited to wikidata until mediaWiki allows seaching for schemas */}
      {/* <h4>
        Target Wikibase:{" "}
        <a target="_blank" rel="noopener noreferrer" href={API.currentUrl()}>
          {API.currentUrl()}
        </a>
      </h4> */}
      <InputSchemaEntityByText
        endpoint={endpoint}
        onChange={setSchemaEntities}
        entity={schemaEntities}
      />
      {schemaEntities && (
        <Table>
          <tbody>
            {schemaEntities.map((ent) => {
              const { id, label, descr: description, webUri } = ent;
              return (
                <tr key={id}>
                  <td>{label || "Unknown label"}</td>
                  <td>
                    {(
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={webUri}
                      >
                        {webUri}
                        <ExternalLinkIcon />
                      </a>
                    ) || "Unknown URI"}
                  </td>
                  <td>{description || "No description provided"}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
      <Form onSubmit={handleSubmit} style={{ marginBottom: "10px" }}>
        <Button
          className={"btn-with-icon " + (loading ? "disabled" : "")}
          variant="primary"
          type="submit"
          disabled={loading}
        >
          {API.texts.actionButtons.schemaInfo}
          <ReloadIcon className="white-icon" />
        </Button>
      </Form>
      {loading ? (
        <ProgressBar striped animated variant="info" now={progressPercent} />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : result ? (
        <WikibaseSchemaResults result={result} permalink={permalink} />
      ) : null}
    </Container>
  );
}

export default WikibaseSchemaInfo;

// Exporting utils used on all schema pages

export function paramsFromQueryParams(params) {
  let newParams = {};
  params[API.queryParameters.schema.schema] &&
    (newParams[API.queryParameters.schema.schema] =
      params[API.queryParameters.schema.schema]);
  params[API.queryParameters.wikibase.lang] &&
    (newParams[API.queryParameters.wikibase.lang] =
      params[API.queryParameters.wikibase.lang]);
  return newParams;
}

export function getSchemaEntity(params, setError) {
  const schemaId = params[API.queryParameters.id];

  // For parameter lang: default to "en" if needed
  const lang = params[API.queryParameters.wikibase.lang] || "en";
  const e = SchemaEntities.find((e) => e.id === schemaId);
  if (e) {
    return mkSchemaEntity(e, lang);
  } else {
    setError(`Entity with supplied ID '${schemaId}' not found`);
  }
}

export function mkSchemaEntity(e, lang) {
  if (e && e.labels) {
    const labelRecord = e.labels[lang] || e.labels["en"];
    return {
      id: e.id,
      label: labelRecord.label,
      descr: labelRecord.descr,
      conceptUri: e.conceptUri,
      webUri: e.webUri,
      lang: lang,
    };
  } else return null;
}
