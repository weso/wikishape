import React, {useState, useReducer, useEffect} from 'react';
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
import {convertTabSchema, showQualify} from "../utils/Utils";
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

function WikidataValidate(props) {

    const initialStatus = {
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
    };

    const [status, dispatch] = useReducer(statusReducer, initialStatus);
    const [shEx, dispatchShEx] = useReducer(shExReducer, initialShExStatus);
    const urlServer = API.schemaValidate;

    useEffect(() => {
        if (props.location.search) {
          try {
              const params = qs.parse(props.location.search);
              const shExParams = shExParamsFromQueryParams(params);
              dispatchShEx({type: 'set-params', value: shExParams});
              dispatch({type: 'set-params', value: params});
              console.log(`Entities: ${status.entities} Shape-label: ${status.shapeLabel} SchemaEntity: ${status.schemaEntity}`)
              validate();
          } catch(error) {
              dispatch({type: 'set-error', value: error.message})
          }
        }
    },
        [props.location.search,status.schemaEntity]
    );

    function handleChange(es) {
        console.log(`#### handleChange: ${JSON.stringify(es)}`);
        dispatch({type: 'set-entities', value: es.map(e => `<${e.uri}>`)});
    }

    function handleShapeLabelChange(label) {
        console.log(`handleShapeLabelChange: ${label}`);
        dispatch({ type: 'set-shapeLabel', value: label});
        dispatch({type: 'unset-result'});
    }

    function handleSchemaEntityChange(e) {
        console.log(`Change schema entity: ${JSON.stringify(e)}`);
        if (e && e.length) {
            const schemaEntity = e[0]
            dispatch({type: 'set-loading'});
            let params = {}
            params['schemaURL'] = schemaEntity.conceptUri;
            params['schemaFormat'] = 'ShExC';
            params['schemaEngine'] = 'ShEx';
            axios.post(API.schemaInfo, params2Form(params), {
                headers: {'Access-Control-Allow-Origin': '*'}
            })
                .then(response => response.data)
                .then(result => {
                    console.log(`Result of schema info: ${JSON.stringify(result)}`);
                    dispatch({
                        type: 'set-shapeList',
                        value: {
                            shapeList: result.shapes,
                            shapesPrefixMap: result.prefixMap},
                    });
                })
                .catch(error => {
                    dispatch({type: 'set-error', value: error.message})
                })
            dispatch({type: 'set-schemaEntity', value: e});
        }
    }

    function statusReducer(status,action) {
        switch (action.type) {
            case "set-loading":
              return { ...status, loading: true, error: false};
            case "set-permalink":
                return {...status, permalink: action.value }
            case "set-params":
                const params = action.value;
                const es = params.node? params.node.split(',').map(node => {return {uri: node}}) : [];
                const shape = params.shape ;
                return { ...status, entities: es, shapeLabel: shape }
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
    }

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
            message: 'Validating...',
            shapeMap: resultMap,
            errors: [],
            nodesPrefixMap: wikidataPrefixes, // The prefix map for nodes is wikidata endpoint
            shapesPrefixMap: status.shapesPrefixMap // the prefix map for shapes can be changed by the ShEx author
        };
    }

    function paramsFromSchema(schemaEntities) {
        console.log(`paramsFromSchema: ${JSON.stringify(schemaEntities)}`)
        let params = {};
        params['schemaEmbedded'] = false;
        params['schemaFormat'] = 'ShExC';
        params['schemaURL'] = schemaEntities[0].conceptUri;
        params['schemaFormatUrl'] = 'ShExC';
        console.log(`paramsShEx: ${JSON.stringify(params)}`)
        return params;
    }

    function validate() {
        console.log(`Validate: entities: ${JSON.stringify(status.entities)}, shape: ${JSON.stringify(status.shapeLabel)}`)
        const initialResult = resultFromEntities(status.entities, status.shapeLabel);
        console.log(`schemaActiveTab: ${status.schemaActiveTab}`);
        let paramsShEx = null;
        if (status.schemaActiveTab === 'BySchema')
             paramsShEx = paramsFromSchema(status.schemaEntity);
            else
             paramsShEx = paramsFromShEx(shEx);
        console.log(`Validate: paramsShEx: ${JSON.stringify(paramsShEx)}`);

        const paramsPermalink = {...paramsShEx,
            nodes: status.entities,
            shape: status.shapeLabel};
        dispatch({type: "set-permalink", value: mkPermalink(API.wikidataValidateRoute, paramsPermalink)});
        dispatch({type: "set-result", value: initialResult});
        status.entities.forEach(e => {
            const paramsEndpoint = { endpoint: localStorage.getItem("url") || API.wikidataContact.url };
            let params = {...paramsEndpoint,...paramsShEx};
            params['schemaEngine']='ShEx';
            params['triggerMode']='shapeMap';
            params['shapeMap'] = `${e}@${status.shapeLabel}`;
            params['shapeMapFormat']='Compact';
            const formData = params2Form(params);
            postValidate(urlServer,formData,e);
        });
    }

    function handleSubmit(event) {
        event.preventDefault();
        validate();
    }

    function postValidate(url, formData, e) {
//        dispatch({type: 'set-loading'} );
        axios.post(url,formData).then (response => response.data)
            .then((data) => {
                console.log(`Return from ${e}`);
                dispatch({type: 'set-result', value: data});
            })
            .catch(function (error) {
                dispatch({
                    type: 'set-error',
                    value: `Error validating ${e} ${url} ${JSON.stringify(formData)}: ${error}`
                });
            })
    }

    function handleShExTabChange(value) { dispatchShEx({ type: 'changeTab', value: value } ); }
    function handleShExFormatChange(value) {  dispatchShEx({type: 'setFormat', value: value }); }
    function handleShExByTextChange(value) { dispatchShEx({type: 'setText', value: value}) }
    function handleShExUrlChange(value) { dispatchShEx({type: 'setUrl', value: value}) }
    function handleShExFileUpload(value) { dispatchShEx({type: 'setFile', value: value}) }

    function handleTabChange(e) {
        dispatch({type: 'set-schemaActiveTab', value: e});
    }

    return (
       <Container>
         <h1>Validate Wikidata entities (through SPARQL endpoint)</h1>
                   { status.result || status.loading || status.error ?
                       <Row>
                           {status.loading ? <Pace color="#27ae60"/> :
                            status.error? <Alert variant="danger">{status.error}</Alert> :
                            status.result ?
                              <ResultValidate result={status.result} /> : null
                           }
                           { status.permalink &&  <Col><Permalink url={status.permalink} /> </Col>}
                       </Row> : null
                   }
                   <Row>
                       <Form onSubmit={handleSubmit}>
                           <InputEntitiesByText onChange={handleChange} entities={status.entities} />
                           <Tabs activeKey={status.schemaActiveTab}
                                 transition={false}
                                 id="SchemaTabs"
                                 onSelect={handleTabChange}
                           >
                           <Tab eventKey="BySchema" title="Wikidata schema">
                               <InputSchemaEntityByText onChange={handleSchemaEntityChange} entity={status.schemaEntity} />
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
                                            value={status.shapeLabel}
                                            shapeList={status.shapeList}/>
                           <Button variant="primary"
                                   type="submit">Validate wikidata entities</Button>
                       </Form>

                   </Row>
           </Container>
   );
}

export default WikidataValidate;
