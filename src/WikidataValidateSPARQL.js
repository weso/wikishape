import React, { useState, useReducer } from 'react';
import Container from 'react-bootstrap/Container';
import Alert from "react-bootstrap/Alert";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Pace from "react-pace-progress";
import {mkPermalink, params2Form, Permalink} from "./Permalink";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import ShExTabs from "./ShExTabs";
import API from "./API"
import { showQualify } from "./Utils";
import axios from "axios";
import Tab from "react-bootstrap/Tab";
import InputShapeLabel from "./InputShapeLabel";
import Tabs from "react-bootstrap/Tabs";
import ResultValidate from "./results/ResultValidate";
import InputSchemaEntityByText from "./InputSchemaEntityByText";
import QueryForm from "./QueryForm";
import { paramsFromShEx, initialShExStatus, shExReducer} from './ShEx'
import { mergeResult, showResult } from "./results/ResultValidate";
import {wikidataPrefixes} from "./resources/wikidataPrefixes";

function WikidataValidateSPARQL(props) {

    const initialStatus = {
        loading: false,
        error: false,
        result: null,
        permalink: null,
        entities: [],
        shapeList: [],
        shapeLabel: '',
        nodesPrefixMap: wikidataPrefixes,
        shapesPrefixMap: wikidataPrefixes
    };

    const [status, dispatch] = useReducer(statusReducer, initialStatus);
    const [query, setQuery] = useState('');
    const [schemaEntity,setSchemaEntity] = useState('');
    const [schemaActiveTab, setSchemaActiveTab] = useState('BySchema');
    const [shEx, dispatchShEx] = useReducer(shExReducer, initialShExStatus);
    const urlServer = API.schemaValidate;
    const [permalink, setPermalink] = useState(null);

    function handleShapeLabelChange(label) {
        console.log(`handleShapeLabelChange: ${label}`)
        dispatch({ type: 'set-shapeLabel', value: label})
    }

    function handleSchemaEntityChange(e) {
        if (e && e.length) {
            const schemaEntity = e[0]
            dispatch({type: 'set-loading'})
            let params = {}
            params['schemaURL'] = schemaEntity.conceptUri
            params['schemaFormat'] = 'ShExC'
            params['schemaEngine'] = 'ShEx'
            axios.post(API.schemaInfo, params2Form(params), {
                headers: {'Access-Control-Allow-Origin': '*'}
            })
                .then(response => response.data)
                .then(result => {
                    console.log(`Result of schema info: ${JSON.stringify(result)}`)
                    dispatch({type: 'set-shapeList', value: { shapeList: result.shapes, shapesPrefixMap: result.prefixMap} })
                    dispatchShEx({type:'setUrl', value: schemaEntity.conceptUri})
                })
                .catch(error => {
                    dispatch({type: 'set-error', value: error.message})
                })
            setSchemaEntity(e)
        }
    }

    function statusReducer(status,action) {
        switch (action.type) {
            case 'set-loading':
              return { ...status, loading: true, error: false};
            case 'set-result':
              console.log(`statusReducer: set-result: ${showResult(action.value,'reducer')}`);
              return { ...status,
                  loading: false,
                  error: false,
                  result: mergeResult(status.result, action.value, status.shapesPrefixMap)};
            case 'unset-result':
                console.log(`unset-result to null!!`)
                return { ...status, result: null };
            case 'set-shapeLabel':
                return { ...status, shapeLabel: action.value };
            case 'set-entities':
                return { ...status, entities: action.value };
            case 'set-shapeList':
                const shapesPrefixMap = action.value.shapesPrefixMap;
                const shapeList = action.value.shapeList.map(sl => showQualify(sl,shapesPrefixMap).str);
                const shapeLabel = shapeList && shapeList.length? shapeList[0] :  '';
                return { ...status,
                    loading: false,
                    error: false,
                    shapeList: shapeList,
                    shapeLabel: shapeLabel,
                    shapesPrefixMap: shapesPrefixMap
                };
            case 'set-error':
              return { ...status,
                  loading: false,
                  error: action.value
              };
            default: throw new Error(`Unknown action type for statusReducer: ${action.type}`)
        }
    }

    function resultFromEntities(entities, shapeLabel) {
       const resultMap = entities.map(e => {
           return {
               node: e,
               shape: shapeLabel,
               status: '?',
               reason: 'validating'
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

    function parseData(data) {
        if (data.head && data.head.vars && data.head.vars.length) {
            const varName = data.head.vars[0];
            console.log(`varName: ${varName}`)
            return data.results.bindings.map(binding => {
                const v = binding[varName]
                const converted = cnvValue(v)
                console.log(`Binding: ${JSON.stringify(binding)}, v: ${JSON.stringify(v)}, converted: ${converted}`)
                return converted
            })
        } else {
            return [];
        }
    }

    function cnvValue(value) {
        switch (value.type) {
            case 'uri': return `<${value.value}>`;
            case 'literal':
                if (value.datatype) return `"${value.value}"^^<${value.datatype}>`;
                if (value['xml:lang']) return `"${value.value}"@${value['xml:lang']}`
                return `"${value.value}"`
            default:
                console.error(`cnvValue: Unknown value type for ${value}`)
                return value
        }
    }

    function handleSubmit(event) {
        event.preventDefault();
        let params = {};
        params['query']=query;
        const formDataQuery = params2Form(params);
        dispatch({type: 'set-loading', value: true});
        dispatch({type: 'unset-result'});
        axios.post(API.wikidataQuery,formDataQuery)
            .then(response => response.data)
            .then(data => {
                const entities = parseData(data);
                dispatch({type: 'set-loading', value: false});
                dispatch({ type: 'set-entities', value: entities});
                const paramsShEx = paramsFromShEx(shEx);
                const initialResult = resultFromEntities(entities, status.shapeLabel);
                dispatch({type: 'set-result', value: initialResult});
// TODO:                setPermalink(mkPermalink(API.wikidataValidateSPARQLRoute,params));
                entities.forEach(e => {
                    const paramsEndpoint = { endpoint: localStorage.getItem('url') || API.wikidataContact.url };
                    params = {...paramsEndpoint,...paramsShEx};
                    params['schemaEngine']='ShEx';
                    params['triggerMode']='shapeMap';
                    params['shapeMap'] = `${e}@${status.shapeLabel}`;
                    params['shapeMapFormat']='Compact';
                    const formData = params2Form(params);
                    postValidate(urlServer,formData,e);
                });
            }).catch(error => {
            dispatch({type: 'set-error', value: error.message});
        })

    }

    function postValidate(url, formData, e) {
//        dispatch({type: 'set-loading'} );
        axios.post(url,formData).then (response => response.data)
            .then((data) => {
                console.log(`Return from ${e}`)
                dispatch({type: 'set-result', value: data})
            })
            .catch(function (error) {
                dispatch({type: 'set-error', value: `Error validating ${e} ${url} ${JSON.stringify(formData)}: ${error}` })
            })
    }

    function handleShExTabChange(value) { dispatchShEx({ type: 'changeTab', value: value } ); }
    function handleShExFormatChange(value) {  dispatchShEx({type: 'setFormat', value: value }); }
    function handleShExByTextChange(value) { dispatchShEx({type: 'setText', value: value}) }
    function handleShExUrlChange(value) { dispatchShEx({type: 'setUrl', value: value}) }
    function handleShExFileUpload(value) { dispatchShEx({type: 'setFile', value: value}) }

    function handleTabChange(e) {
        setSchemaActiveTab(e)
    }

    return (
       <Container>
         <h1>Validate Wikidata entities obtained from SPARQL queries</h1>
                   { status.result || status.loading || status.error ?
                       <Row>
                           {status.loading ? <Pace color="#27ae60"/> :
                               status.error? <Alert variant="danger">{status.error}</Alert> :
                               status.result ?
                                   <ResultValidate result={status.result} /> : null
                           }
                           { permalink &&  <Col><Permalink url={permalink} /> </Col>}
                       </Row> : null
                   }
                   <Row>
                       <Form onSubmit={handleSubmit}>
                           <QueryForm
                               onChange={setQuery}
                               placeholder="select ?id ..."
                               value={query}
                               prefixes={ wikidataPrefixes }
                           />
                           <Tabs activeKey={schemaActiveTab}
                                 transition={false}
                                 id="SchemaTabs"
                                 onSelect={handleTabChange}
                           >
                           <Tab eventKey="BySchema" title="Wikidata schema">
                               <InputSchemaEntityByText onChange={handleSchemaEntityChange} entity={schemaEntity} />
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

export default WikidataValidateSPARQL;
