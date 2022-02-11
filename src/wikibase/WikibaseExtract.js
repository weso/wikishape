import axios from "axios";
import qs from "query-string";
import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import ProgressBar from "react-bootstrap/ProgressBar";
import Row from "react-bootstrap/Row";
import { ReloadIcon } from "react-open-iconic-svg";
import ExternalLinkIcon from "react-open-iconic-svg/dist/ExternalLinkIcon";
import API from "../API";
import InputEntitiesByText from "../components/InputEntitiesByText";
import { mkPermalinkLong, params2Form } from "../Permalink";
import { mkError } from "../utils/ResponseError";
import { shexToXmi } from "../utils/xmiUtils/shumlexUtils";
import WikibaseSchemaResults from "./WikibaseSchemaResults";

function WikibaseExtract(props) {
  // User selected entity and schema (either from wikidata schemas or custom shex)
  const [entities, setEntities] = useState([]);
  const [endpoint, setEndpoint] = useState(API.wikidataContact.endpoint); // Only available for Wikidata

  // Params to be formatted and sent to the server
  const [params, setParams] = useState(null);
  const [lastParams, setLastParams] = useState(null);

  const [permalink, setPermalink] = useState(null);
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Progress bar controls
  const [progressPercent, setProgressPercent] = useState(0);

  // Target API endpoint.
  // Choose to use SheXer or not to perform the extraction in the server
  const { useShexer } = props;
  const urlExtract = useShexer
    ? API.routes.server.wikibaseExtractShexer
    : API.routes.server.wikibaseExtract;

  const urlInfo = API.routes.server.schemaInfo;
  const urlVisualize = API.routes.server.schemaConvert;

  const urlClient = useShexer
    ? API.routes.client.wikibaseSheXer
    : API.routes.client.wikibaseExtract;

  // URL-based loading
  useEffect(() => {
    if (props.location?.search) {
      const urlParams = qs.parse(props.location.search);
      if (urlParams[API.queryParameters.wikibase.payload]) {
        const pEntities = urlParams[API.queryParameters.wikibase.payload]
          .split("|")
          .map((ent) => ({
            uri: ent,
          }));
        setEntities(pEntities);

        // Set new params accordingly
        const newParams = mkParams(pEntities);

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
      else {
        resetState();
        setUpHistory();
        postExtract();
      }
    }
  }, [params]);

  const handleChangeEntities = (entities) => {
    setEntities(entities);
  };

  function handleSubmit(e) {
    e.preventDefault();
    setParams(mkParams());
  }

  // Create params to be sent to the server
  function mkParams(pEntities = entities, pEndpoint = endpoint) {
    return {
      [API.queryParameters.wikibase.payload]: pEntities
        .map((ent) => ent.uri)
        .join("|"), // List of entities joined by "|"
      // [API.queryParameters.wikibase.endpoint]: pEndpoint,
    };
  }

  // Given the server response to the extraction operation,
  // make the schema parameters to be sent to the server for futher processing
  // the schema
  function mkSchemaServerParams(extractResponse) {
    return {
      [API.queryParameters.schema.schema]: extractResponse?.result?.result,
      [API.queryParameters.schema.source]: API.sources.byText,
      [API.queryParameters.schema.format]: API.formats.shexc,
      [API.queryParameters.schema.engine]: API.engines.shex,
    };
  }

  async function postExtract() {
    setLoading(true);
    setProgressPercent(15);

    try {
      // 1. Exrtact schema
      const extractParams = params2Form(params);
      const { data: extractResponse } = await axios.post(
        urlExtract,
        extractParams
      );
      setProgressPercent(40);

      // 2. Schema info
      const infoParams = mkSchemaServerParams(extractResponse);
      const { data: resultInfo } = await axios.post(
        urlInfo,
        params2Form(infoParams)
      );
      setProgressPercent(60);

      // 3. Schema SVG
      const convertParams = {
        ...infoParams,
        [API.queryParameters.schema.targetFormat]: API.formats.svg,
      };
      const { data: resultSvg } = await axios.post(
        urlVisualize,
        params2Form(convertParams)
      );
      setProgressPercent(80);

      // 4. Schema UML
      const umlFromSchema = await shexToXmi(infoParams);

      // Merge all operation results for full information
      setResult({
        resultInfo,
        resultSvg,
        resultUml: umlFromSchema,
      });
      // Create and set the permalink value on success
      setPermalink(mkPermalinkLong(urlClient, params));
    } catch (err) {
      setError(mkError(err, urlExtract));
    } finally {
      setLoading(false);
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
        mkPermalinkLong(urlClient, lastParams)
      );
    }
    // Change current url for shareable links
    // eslint-disable-next-line no-restricted-globals
    history.replaceState(
      null,
      document.title,
      mkPermalinkLong(urlClient, params)
    );

    setLastParams(params);
  }

  function resetState() {
    setResult(null);
    setPermalink(null);
    setError(null);
  }

  return (
    <Container>
      <h1>
        {useShexer
          ? API.texts.pageHeaders.schemaExtractShexer
          : API.texts.pageHeaders.schemaExtractDefault}
      </h1>
      <Row>
        <Form onSubmit={handleSubmit}>
          <InputEntitiesByText
            onChange={handleChangeEntities}
            multiple={false}
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
          <Button
            className={"btn-with-icon " + (loading ? "disabled" : "")}
            variant="primary"
            type="submit"
            disabled={loading}
          >
            {API.texts.actionButtons.extractSchema}
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
            />
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : result ? (
            <WikibaseSchemaResults
              result={result}
              permalink={permalink}
              doUml={false}
            />
          ) : null}
        </Row>
      ) : null}
    </Container>
  );
}

WikibaseExtract.defaultProps = {
  useShexer: false,
};

export default WikibaseExtract;
