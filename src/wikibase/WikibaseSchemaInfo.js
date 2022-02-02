import axios from "axios";
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
import { mkPermalinkLong, params2Form } from "../Permalink";
import { SchemaEntities } from "../resources/schemaEntities";
import { mkError } from "../utils/ResponseError";
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
      if (urlParams[API.queryParameters.endpoint]) {
        setEndpoint(urlParams[API.queryParameters.endpoint]);
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

    const reqParams = params2Form(await mkServerParams());

    try {
      const { data: schemaInfo } = await axios.post(urlServerInfo, reqParams);
      setProgressPercent(40);
      const { data: schemaVisual } = await axios.post(
        urlServerVisual,
        reqParams
      );
      setProgressPercent(60);

      const newResult = {
        ...schemaInfo,
        ...schemaVisual,
        result: { ...schemaInfo.result, ...schemaVisual.result },
      };

      // Merge results from both info and convert and set the state
      setResult(newResult);

      // Create and set the permalink value on success
      setPermalink(
        mkPermalinkLong(API.routes.client.wikibaseSchemaInfo, {
          [API.queryParameters.schema.schema]: schemaEntities[0].id,
          [API.queryParameters.lang]: schemaEntities[0].lang,
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

  // Make params to be sent to the server API endpoint
  async function mkServerParams(pSchemaEntity = schemaEntities[0]) {
    const { data: schemaRaw } = await axios.get(pSchemaEntity.conceptUri);
    return {
      [API.queryParameters.schema.schema]: schemaRaw,
      [API.queryParameters.schema.source]: API.sources.byText,
      [API.queryParameters.schema.format]: API.formats.shexc,
      [API.queryParameters.schema.engine]: API.engines.shex,
      // The server internally converts to a PlantUML SVG string and the client interprets it
      [API.queryParameters.schema.targetFormat]: API.formats.svg,
    };
  }

  // Make params for client usage
  function mkParams(pSchemaEntity = schemaEntities[0]) {
    if (pSchemaEntity) {
      return {
        [API.queryParameters.id]: pSchemaEntity.id,
        [API.queryParameters.lang]: pSchemaEntity.lang,
      };
    }
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
          [API.queryParameters.lang]: lastParams.lang,
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
        [API.queryParameters.lang]: params.lang,
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
      <h1>Info about Wikidata Schema entity</h1>
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
          Get schema info
          <ReloadIcon className="white-icon" />
        </Button>
      </Form>
      {loading ? (
        <ProgressBar striped animated variant="info" now={progressPercent} />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : result ? (
        <WikibaseSchemaResults
          result={result}
          permalink={permalink}
        />
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
  params[API.queryParameters.lang] &&
    (newParams[API.queryParameters.lang] = params[API.queryParameters.lang]);
  return newParams;
}

export function getSchemaEntity(params, setError) {
  const schemaId = params[API.queryParameters.id];

  // For parameter lang: default to "en" if needed
  const lang = params[API.queryParameters.lang] || "en";
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
