import axios from "axios";
import qs from "query-string";
import React, {
  useEffect,
  // useState,
  useReducer,
  useState
} from "react";
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
import { mkPermalink, params2Form } from "../Permalink";
import { wikidataPrefixes } from "../resources/wikidataPrefixes";
import ResultValidate, { mergeResult } from "../results/ResultValidate";
import {
  initialShExStatus,
  paramsFromShEx,
  shExParamsFromQueryParams,
  shExReducer
} from "../shex/ShEx";
import ShExTabs from "../shex/ShExTabs";
import { showQualify } from "../utils/Utils";

function WikidataValidateDeref(props) {
  /*    const initialStatus = {
        loading: false,
        error: false,
        result: null,
        permalink: null,
        entities: [],
        shapeList: [],
        shapeLabel: '',
        nodesPrefixMap: [],
        shapesPrefixMap: [],
        schemaEntity: '',
        schemaActiveTab: 'BySchema',
    }; */

  /*   const [status, dispatch] = useReducer(statusReducer, initialStatus); */
  const [entities, setEntities] = useState([]);
  const [permalink, setPermalink] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [entitySchema, setEntitySchema] = useState(null);
  const [shapeLabel, setShapeLabel] = useState("");
  const [shapeList, setShapeList] = useState([]);
  // const [nodesPrefixMap,setNodesPrefixMap] = useState([]);
  const [shapesPrefixMap, setShapesPrefixMap] = useState([]);
  const [schemaActiveTab, setSchemaActiveTab] = useState("BySchema");
  const [shEx, dispatchShEx] = useReducer(shExReducer, initialShExStatus);
  const [progressLabel, setProgressLabel] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);

  const urlServer = API.wikidataValidateDeref;

  useEffect(() => {
    if (props.location.search) {
      const params = qs.parse(props.location.search);
      const shExParams = shExParamsFromQueryParams(params);
      dispatchShEx({ type: "set-params", value: shExParams });
      let validateParams = validateParamsFromQueryParams(params);
      // let validateParams = params ;
      validateParams = { ...validateParams, shEx: shExParams };
      validate(validateParams);
    }
  }, [props.location.search]);

  function validateParamsFromQueryParams(params) {
    let newParams = {};
    if (params.schemaActiveTab)
      newParams["schemaActiveTab"] = params.schemaActiveTab;
    if (params.shape) newParams["shape"] = params.shape;
    if (params.entities) {
      if (Array.isArray(params.entities)) {
        newParams["entities"] = params.entities;
      } else {
        newParams["entities"] = [params.entities];
      }
    } else {
      newParams["entities"] = [];
    }
    /*                params.nodes ?
                    params.nodes.split(',').map(node => { return { uri: node }
                    }) : []  ; */
    if (params.entitySchema) newParams["entitySchema"] = params.entitySchema;
    return newParams;
  }

  function handleChangeEntities(es) {
    // dispatch({type: 'set-entities', value: es.map(e => `<${e.uri}>`)});
    setEntities(es.map((e) => `<${e.uri}>`));
  }

  function handleShapeLabelChange(label) {
    setShapeLabel(label);
    setResult("");
  }

  function updateShapeLabel() {
    const newShapeLabel = shapeList && shapeList.length ? shapeList[0] : "";
    setShapeLabel(newShapeLabel);
  }

  function updateShapes(shapes) {
    const newShapes = ["Start"].concat(shapes);
    const newShapesQualified = newShapes.map(
      (sl) => showQualify(sl, shapesPrefixMap).str
    );
    setShapeList(newShapesQualified);
    updateShapeLabel();
  }

  function handleSchemaEntityChange(e) {
    if (e && e.length) {
      const entitySchema = e[0];
      setLoading(true);
      setProgressPercent(90);
      setProgressLabel("Retrieving schema info...");
      setResult("");

      // Fetch Schema from Entity schema URL
      let params = {};
      params["schemaURL"] = entitySchema.conceptUri;
      params["schemaFormat"] = "ShExC";
      params["schemaEngine"] = "ShEx";
      const postParams = params2Form(params);
      axios
        .post(API.schemaInfo, postParams, {
          headers: { "Access-Control-Allow-Origin": "*" },
        })
        .then((response) => {
          return response.data;
        })
        .then((result) => {
          updateShapes(result.shapes);
          setShapesPrefixMap(result.shapesPrefixMap);
        })
        .catch((error) => {
          setError(
            `handleSchemaEntityChange: error after POST ${
              API.schemaInfo
            } with params ${JSON.stringify(postParams)}: ${error.message}`
          );
        })
        .finally(() => {
          setLoading(false);
          setProgressLabel("");
          setProgressPercent(0);
        });
      setEntitySchema(e);
    }
  }

  function resultFromEntities(entities, shapeLabel) {
    const resultMap = entities.map((e) => {
      return {
        node: e,
        shape: shapeLabel,
        status: "?",
        reason: "validating",
      };
    });
    return {
      valid: false,
      type: "Result",
      shapeMap: resultMap,
      errors: [],
      nodesPrefixMap: wikidataPrefixes, // The prefix map for nodes is wikidata endpoint
      shapesPrefixMap: shapesPrefixMap, // the prefix map for shapes can be changed by the ShEx author
    };
  }

  function paramsFromSchema(entitySchema) {
    let params = {};
    if (Array.isArray(entitySchema)) {
      params["entitySchema"] = entitySchema[0].id;
    } else {
      params["entitySchema"] = entitySchema;
    }
    return params;
  }

  async function validate(validateParams) {
    const initialResult = resultFromEntities(
      validateParams.entities,
      validateParams.shapeLabel
    );
    setResult(initialResult);

    const schemaActiveTab = validateParams.schemaActiveTab;
    let paramsSchema = null;
    if (schemaActiveTab === "BySchema")
      paramsSchema = paramsFromSchema(validateParams.entitySchema);
    else paramsSchema = paramsFromShEx(validateParams.shEx);

    const paramsPermalink = {
      ...paramsSchema,
      entities: validateParams.entities,
      shape: validateParams.shapeLabel,
      schemaActiveTab: validateParams.schemaActiveTab,
    };
    setPermalink(
      await mkPermalink(API.wikidataValidateDerefRoute, paramsPermalink)
    );

    const entitySchema = validateParams.entitySchema;

    validateParams.entities.forEach((e) => {
      const paramsEndpoint = { endpoint: API.currentUrl() };
      let params = { ...paramsEndpoint, ...paramsSchema };
      params["schemaEngine"] = "ShEx";
      params["item"] = e;
      params["shape"] = validateParams.shapeLabel;
      const formData = params2Form(params);

      postValidate(urlServer, formData, e);
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    resetState();
    if (entities && entities.length) {
      let params = {
        entitySchema: entitySchema,
        schemaActiveTab: schemaActiveTab,
        shapeLabel: shapeLabel,
        shapeList: shapeList,
        entities: entities,
        shEx: shEx,
      };
      validate(params);
    } else setError("No entities selected");
  }

  function postValidate(url, formData, e) {
    setLoading(true);
    setProgressPercent(15);
    axios
      .post(url, formData)
      .then((response) => {
        setProgressPercent(65);
        return response.data;
      })
      .then((data) => {
        const mergedResult = mergeResult(result, data, shapesPrefixMap);
        setLoading(false);
        setError(null);
        setProgressPercent(90);
        setResult(mergedResult);
        setProgressPercent(100);
      })
      .catch((error) => {
        setError(
          `Error validating ${e} ${url} ${JSON.stringify(formData)}: ${error}`
        );
      })
      .finally(() => {
        setLoading(false);
        setProgressPercent(0);
      });
  }

  function handleShExTabChange(value) {
    dispatchShEx({ type: "changeTab", value: value });
    setResult(null);
  }
  function handleShExFormatChange(value) {
    dispatchShEx({ type: "setFormat", value: value });
    setResult(null);
  }

  function updateShEx(schemaStr) {
    let params = {};
    params["schema"] = schemaStr;
    params["schemaFormat"] = "ShExC";
    params["schemaEngine"] = "ShEx";
    axios
      .post(API.schemaInfo, params2Form(params), {
        headers: { "Access-Control-Allow-Origin": "*" },
      })
      .then((response) => response.data)
      .then((result) => {
        updateShapes(result.shapes);
        setShapesPrefixMap(result.prefixMap);
      })
      .catch((error) => {
        setError(`updateShEx error: ${error.message}`);
      });
  }

  function handleShExByTextChange(value) {
    dispatchShEx({ type: "setText", value: value });
    setResult(null);
    updateShEx(value); //TODO: Check if this implies a post for every key pressed?
  }

  function handleShExUrlChange(value) {
    dispatchShEx({ type: "setUrl", value: value });
    setResult(null);
  }
  function handleShExFileUpload(value) {
    dispatchShEx({ type: "setFile", value: value });
    setResult(null);
  }

  function handleTabChange(e) {
    setSchemaActiveTab(e);
  }

  function resetState() {
    setResult(null);
    setPermalink(null);
    setError(null);
    setLoading(false);
    setProgressPercent(0);
    setProgressLabel("");
  }

  return (
    <Container>
      <h1>Validate Wikibase entities</h1>
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
            entities={entities}
          />
          <Tabs
            activeKey={schemaActiveTab}
            transition={false}
            id="SchemaTabs"
            onSelect={handleTabChange}
          >
            <Tab eventKey="BySchema" title="Wikidata schema">
              <InputSchemaEntityByText
                onChange={handleSchemaEntityChange}
                entity={entitySchema}
              />
            </Tab>
            <Tab eventKey="ByShExTab" title="ShEx">
              <ShExTabs
                activeTab={shEx.shExActiveTab}
                handleTabChange={handleShExTabChange}
                textAreaValue={shEx.shExTextArea}
                handleByTextChange={handleShExByTextChange}
                shExUrl={shEx.shExUrl}
                handleShExUrlChange={handleShExUrlChange}
                handleFileUpload={handleShExFileUpload}
                dataFormat={shEx.shExFormat}
                handleShExFormatChange={handleShExFormatChange}
              />
            </Tab>
          </Tabs>
          <InputShapeLabel
            onChange={handleShapeLabelChange}
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
    </Container>
  );
}

export default WikidataValidateDeref;
