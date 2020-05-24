import React, {
    // useState,
    useReducer,
    useEffect, useState
} from 'react';
import Container from 'react-bootstrap/Container';
import Alert from "react-bootstrap/Alert";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Pace from "react-pace-progress";
import {mkPermalink, params2Form, Permalink} from "../Permalink";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import ShExTabs from "../shex/ShExTabs";
import API from "../API"
import {showQualify} from "../utils/Utils";
import axios from "axios";
import Tab from "react-bootstrap/Tab";
import InputShapeLabel from "../components/InputShapeLabel";
import Tabs from "react-bootstrap/Tabs";
import InputEntitiesByText from "../components/InputEntitiesByText";
import ResultValidate from "../results/ResultValidate";
import InputSchemaEntityByText from "../components/InputSchemaEntityByText";
import { paramsFromShEx, initialShExStatus, shExReducer, shExParamsFromQueryParams,} from '../shex/ShEx'
import { mergeResult } from "../results/ResultValidate";
import {wikidataPrefixes} from "../resources/wikidataPrefixes";
import qs from "query-string";

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
    const [entities,setEntities] = useState([]);
    const [permalink,setPermalink] = useState('');
    const [result,setResult] = useState(null);
    const [error,setError] = useState(null);
    const [loading,setLoading] = useState(false);
    const [entitySchema,setEntitySchema] = useState(null);
    const [shapeLabel,setShapeLabel] = useState('');
    const [shapeList,setShapeList] = useState([]);
   // const [nodesPrefixMap,setNodesPrefixMap] = useState([]);
    const [shapesPrefixMap, setShapesPrefixMap] = useState([]);
    const [schemaActiveTab, setSchemaActiveTab] = useState('BySchema');

    const [shEx, dispatchShEx] = useReducer(shExReducer, initialShExStatus);

    const urlServer = API.wikidataValidateDeref;

    useEffect(() => {
        if (props.location.search) {
/*          try { */
              const params = qs.parse(props.location.search);
              const shExParams = shExParamsFromQueryParams(params);
              console.log(`ShExParams: ${JSON.stringify(shExParams)}`);
              dispatchShEx({ type: 'set-params', value: shExParams});
              let validateParams = validateParamsFromQueryParams(params);
              // let validateParams = params ;
              validateParams = {...validateParams, shEx: shExParams};
              validate(validateParams);
       /*   } catch(error) {
              setError(`Error initializing from parameters: ${error.message}`);
          } */
        }
    },
        [props.location.search]
    );

    function validateParamsFromQueryParams(params) {
        let newParams = {};
        if (params.schemaActiveTab) newParams["schemaActiveTab"] = params.schemaActiveTab ;
        if (params.shape) newParams["shape"] = params.shape ;
        console.log(`validateParamsFromQueryParams: ${JSON.stringify(params)}`)
        if (params.entities) {
            if (Array.isArray(params.entities)) {
                newParams["entities"] = params.entities ;
            } else {
                newParams["entities"] = [ params.entities ];
            }
        } else {
            newParams["entities"] = [] ;
        }
/*                params.nodes ?
                    params.nodes.split(',').map(node => { return { uri: node }
                    }) : []  ; */
        if (params.entitySchema) newParams["entitySchema"] = params.entitySchema ;
        return newParams;
    }

    function handleChangeEntities(es) {
        console.log(`#### handleChange: ${JSON.stringify(es)}`);
        // dispatch({type: 'set-entities', value: es.map(e => `<${e.uri}>`)});
        setEntities(es.map(e => `<${e.uri}>`));
    }

    function handleShapeLabelChange(label) {
        console.log(`handleShapeLabelChange: ${label}`);
        setShapeLabel(label);
        setResult('');
    }

    function handleSchemaEntityChange(e) {
        console.log(`Change schema entity: ${JSON.stringify(e)}`);
        if (e && e.length) {
            const entitySchema = e[0]
            setLoading(true);
            setResult('');

            // Fetch Schema from Entity schema URL
            let params = {}
            params['schemaURL'] = entitySchema.conceptUri;
            params['schemaFormat'] = 'ShExC';
            params['schemaEngine'] = 'ShEx';
            const postParams = params2Form(params);
            axios.post(API.schemaInfo, postParams, {
                headers: {'Access-Control-Allow-Origin': '*'}
            })
                .then(response => response.data)
                .then(result => {
                    console.log(`Result of schema info: ${JSON.stringify(result)}`);
                    /* let shapes = [] ;
                    if (result && result.shapes && result.shapes.length) {
                        shapes = result.shapes
                    } else shapes = [ 'START'] ; */
                    const newShapes = ["Start"].concat(result.shapes);
                    const newShapesQualified = newShapes.map(sl => showQualify(sl,shapesPrefixMap).str)
                    setShapeList(newShapesQualified);
                    console.log(`NewShapesQualified: ${JSON.stringify(newShapesQualified)}`);
                    const newShapeLabel = shapeList && shapeList.length? shapeList[0] :  '';
                    console.log(`NewShapeLabel: ${JSON.stringify(newShapeLabel)}`);
                    setShapeLabel(newShapeLabel);

                    setShapesPrefixMap(result.shapesPrefixMap);
                    setLoading(false);
                })
                .catch(error => {
                    setError(`handleSchemaEntityChange: error after POST ${API.schemaInfo} with params ${JSON.stringify(postParams)}: ${error.message}`);
                    setLoading(false);
                })
            setEntitySchema(e);
        }
    }

/*    function statusReducer(status,action) {
        switch (action.type) {
            case "set-loading":
              return { ...status, loading: true, error: false};
            case "set-permalink":
                return {...status, permalink: action.value }
            case "set-validateParams":
                const params = action.value;
                const es = params.nodes ? params.nodes.split(',').map(node => {return {uri: node}}) : [];
                const shape = params.shape ;
                const schemaEntity = params.entitySchema;
                console.log(`set-params: ${JSON.stringify(params)} shape: ${JSON.stringify(shape)} ${JSON.stringify(schemaEntity)}`)
                return { ...status, entities: es, shapeLabel: shape, schemaEntity: schemaEntity }
            case "set-schemaEntity":
                console.log(`statusReducer: set-schemaEntity: ${JSON.stringify(action.value)}`);
                return { ...status, schemaEntity: action.value }
            case "set-result":
                console.log(`statusReducer: set-result: ${JSON.stringify(action.value)}`);
                return { ...status,
                    loading: false,
                    error: false,
                    result: mergeResult(status.result, action.value, status.shapesPrefixMap)};
            case "unset-result":
                console.log(`unset-result to null!!`);
                return { ...status, result: null };
            case "set-shapeLabel":
                return { ...status, shapeLabel: action.value }
            case "set-entities":
                return { ...status, entities: action.value }
            case "set-shapeList":
                console.log(`set-shapeList ${JSON.stringify(action.value)}`);
                const shapesPrefixMap = action.value.shapesPrefixMap
                const shapeList = action.value.shapeList.map(sl => showQualify(sl,shapesPrefixMap).str)
                const shapeLabel = shapeList && shapeList.length? shapeList[0] :  ''
                return { ...status,
                    loading: false,
                    error: false,
                    shapeList: shapeList,
                    shapeLabel: shapeLabel,
                    shapesPrefixMap: shapesPrefixMap
                };
            case "set-error":
              return { ...status,
                  loading: false,
                  error: action.value
              };
            case "set-schemaActiveTab":
                return { ...status, schemaActiveTab: action.value };
            default: throw new Error(`Unknown action type for statusReducer: ${action.type}`)
        }
    } */

    function resultFromEntities(entities, shapeLabel) {
        const resultMap = entities.map(e => {
            return {
                node: e,
                shape: shapeLabel,
                status: "?",
                reason: "validating"
            }
        });
        return {
            valid: false,
            type: 'Result',
            message: 'Validation started',
            shapeMap: resultMap,
            errors: [],
            nodesPrefixMap: wikidataPrefixes, // The prefix map for nodes is wikidata endpoint
            shapesPrefixMap: shapesPrefixMap // the prefix map for shapes can be changed by the ShEx author
        };
    }

    function paramsFromSchema(entitySchema) {
        console.log(`paramsFromSchema| entitySchema = ${JSON.stringify(entitySchema)}`)
        let params = {};
        if (Array.isArray(entitySchema)) {
            params['entitySchema'] = entitySchema[0].id;
        } else {
            params['entitySchema'] = entitySchema
        }
        console.log(`paramsFromSchema: ${JSON.stringify(params)}`)
        return params;
    }

    function validate(validateParams) {
        console.log(`Validate\nvalidateParams: ${JSON.stringify(validateParams)}`)
        const initialResult = resultFromEntities(validateParams.entities, validateParams.shapeLabel);
        setResult(initialResult);

        const schemaActiveTab = validateParams.schemaActiveTab;
        console.log(`schemaActiveTab: ${schemaActiveTab}`);
        let paramsSchema = null;
        if (schemaActiveTab === 'BySchema')
             paramsSchema = paramsFromSchema(validateParams.entitySchema);
            else
             paramsSchema = paramsFromShEx(validateParams.shEx);

        console.log(`validate| paramsSchema: ${JSON.stringify(paramsSchema)}`);
        const paramsPermalink = {...paramsSchema,
            entities: validateParams.entities,
            shape: validateParams.shapeLabel,
            schemaActiveTab: validateParams.schemaActiveTab
        };
        setPermalink(mkPermalink(API.wikidataValidateDerefRoute, paramsPermalink));
        console.log(`validate| Permalink: ${JSON.stringify(permalink)}`);

        const entitySchema = validateParams.entitySchema ;
        if (entitySchema) {
            console.log(`validate| entitySchema: ${JSON.stringify(entitySchema)} Entities: ${JSON.stringify(validateParams.entities)}`);
            validateParams.entities.forEach(e => {
                const paramsEndpoint = { endpoint: localStorage.getItem("url") || API.wikidataContact.url };
                let params = {...paramsEndpoint,...paramsSchema};
                params['schemaEngine'] = 'ShEx';
                params['item'] = e ;
                params['shape'] = validateParams.shapeLabel ;
                const formData = params2Form(params);

                postValidate(urlServer,formData,e);
            });
        } else {
            console.log(`validate| No schema entity: Params: ${JSON.stringify(validateParams)}`)
            validateParams.entities.forEach(e => {
                const paramsEndpoint = { endpoint: localStorage.getItem("url") || API.wikidataContact.url };
                let params = {...paramsEndpoint,...paramsSchema};
                params['schemaEngine'] = 'ShEx';
                params['item'] = e ;
                params['shape'] = validateParams.shapeLabel ;
                const formData = params2Form(params);
                postValidate(urlServer,formData,e);
            });
        }
    }


    function handleSubmit(event) {
        event.preventDefault();
        console.log(`Validate button!: Status entities: ${JSON.stringify(entities)}`)
        let params = {
            entitySchema: entitySchema,
            schemaActiveTab: schemaActiveTab,
            shapeLabel: shapeLabel,
            shapeList: shapeList,
            entities: entities,
            shEx: shEx
        }
        validate(params);
    }

    function postValidate(url, formData, e) {
        console.log(`POST validation: ${JSON.stringify(formData)}`);
        setLoading(true);
        axios.post(url,formData).then (response => response.data)
            .then((data) => {
                console.log(`Return from validation ${JSON.stringify(data)}`);
                const mergedResult = mergeResult(result, data, shapesPrefixMap);
                console.log(`Merged result: ${JSON.stringify(mergedResult)}`);
                setLoading(false);
                setError(null);
                setResult(mergedResult);
            })
            .catch((error) => {
                setError(`Error validating ${e} ${url} ${JSON.stringify(formData)}: ${error}`);
            })
    }

    function handleShExTabChange(value) {
        dispatchShEx({ type: 'changeTab', value: value } );
        setResult(null);
    }
    function handleShExFormatChange(value) {
        dispatchShEx({type: 'setFormat', value: value });
        setResult(null);
    }

    function updateShEx(schemaStr) {
        let params = {};
        params['schema'] = schemaStr;
        params['schemaFormat'] = 'ShExC';
        params['schemaEngine'] = 'ShEx';
        axios.post(API.schemaInfo, params2Form(params), {
            headers: {'Access-Control-Allow-Origin': '*'}
        })
            .then(response => response.data)
            .then(result => {
                console.log(`Result of schema info: ${JSON.stringify(result)}`);
                let newShapes;
                if (result.shapes && result.shapes.length) newShapes = result.shapes;
                else newShapes = ["Start"];
                console.log(`NewShapes from ShEx: ${newShapes}`);
                setShapeList(newShapes);
                setShapesPrefixMap(result.prefixMap);
            })
            .catch(error => {
                setError(`updateShEx error: ${error.message}`);
            })
    }

    function handleShExByTextChange(value) {
        dispatchShEx({type: 'setText', value: value});
        setResult(null);
        updateShEx(value);  //TODO: Check if this implies a post for every key pressed?
    }

    function handleShExUrlChange(value) {
        dispatchShEx({type: 'setUrl', value: value})
        setResult(null);
    }
    function handleShExFileUpload(value) {
        dispatchShEx({type: 'setFile', value: value})
        setResult(null);
    }

    function handleTabChange(e) {
        setSchemaActiveTab(e);
    }

    return (
       <Container>
         <h1>Validate Wikidata entities</h1>
                   { result || loading || error ?
                       <Row>
                           {loading ? <Pace color="#27ae60"/> :
                            error? <Alert variant="danger">{error}</Alert> :
                            result ?
                              <ResultValidate result={result} /> : null
                           }
                           { permalink &&  <Col><Permalink url={permalink} /> </Col>}
                       </Row> : null
                   }
                   <Row>
                       <Form onSubmit={handleSubmit}>
                           <InputEntitiesByText onChange={handleChangeEntities} entities={entities} />
                           <Tabs activeKey={schemaActiveTab}
                                 transition={false}
                                 id="SchemaTabs"
                                 onSelect={handleTabChange}
                           >
                           <Tab eventKey="BySchema" title="Wikidata schema">
                               <InputSchemaEntityByText onChange={handleSchemaEntityChange} entity={entitySchema} />
                            </Tab>
                            <Tab eventKey="ByShExTab" title="ShEx">
                               <ShExTabs activeTab={shEx.shExActiveTab}
                                     handleTabChange={handleShExTabChange}

                                     textAreaValue={shEx.shExTextArea}
                                     handleByTextChange={handleShExByTextChange}

                                     shExUrl={shEx.shExUrl}
                                     handleShExUrlChange={handleShExUrlChange}

                                     handleFileUpload={handleShExFileUpload}

                                     dataFormat={shEx.shExFormat}
                                     handleShExFormatChange={handleShExFormatChange} />
                                </Tab>
                           </Tabs>
                           <InputShapeLabel onChange={handleShapeLabelChange}
                                            value={shapeLabel}
                                            shapeList={shapeList}/>
                           <Button variant="primary"
                                   type="submit">Validate wikidata entities</Button>
                       </Form>

                   </Row>
           </Container>
   );
}

export default WikidataValidateDeref;
