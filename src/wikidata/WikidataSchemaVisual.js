import React, {useEffect, useState} from 'react';
import Container from 'react-bootstrap/Container';
import Alert from "react-bootstrap/Alert";
import InputSchemaEntityByText from "../components/InputSchemaEntityByText";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import API from "../API";
import {mkPermalink, params2Form, Permalink} from "../Permalink";
import axios from "axios";
import Pace from "react-pace-progress";
import ShExForm from "../shex/ShExForm";
import PrintSVG from "../utils/PrintSVG";
import qs from 'query-string';
import { SchemaEntities } from "../resources/schemaEntities"


function WikidataSchemaVisual(props) {
    const [permalink,setPermalink] = useState(null)
    const [result,setResult] = useState(null);
    const [shExContent,setShExContent] = useState(null);
    const [schemaId, setSchemaId] = useState('');
    const [schemaLabel, setSchemaLabel] = useState('');
    const [schemaDescr, setSchemaDescr] = useState('')
    const [schemaWebUri, setSchemaWebUri] = useState('');
    const [error,setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [schemaEntity,setSchemaEntity] = useState([]);

    useEffect(() => {
       if (props.location.search) {
           const queryParams = qs.parse(props.location.search);
           let params = paramsFromQueryParams(queryParams);
           console.log(`Params in location search: ${JSON.stringify(params)}| ${JSON.stringify(props.location.search)}`)
           const e = getSchemaEntity(params);
           fetchSchemaEntity(e);
       }
     },
        [props.location.search]
    );

    function paramsFromQueryParams(params) {
     let newParams = {};
     if (params.id) newParams["id"] = params.id ;
     if (params.lang) newParams['lang'] = params.lang ;
     return newParams;
    }

    function mkSchemaEntity(e, lang) {
        if (e && e.labels) {
            const labelRecord = e.labels[lang]? e.labels[lang]: e.labels['en'] ;
            return [{
                id: e.id,
                label: labelRecord.label,
                descr: labelRecord.descr,
                conceptUri : e.conceptUri,
                webUri: e.webUri,
                lang: lang
            }]
        } else return null;
    }

    function getSchemaEntity(params) {
      const id = params['id'];
      const lang = params['lang'] ? params['lang'] : 'en'
      const e = SchemaEntities.find(e => e.id === id)
      if (e) {
          console.log(`found entity: ${JSON.stringify(e)}`);
          return mkSchemaEntity(e,lang);
      } else {
          setError(`Entity with id ${id} not found`)
      }
    }


    const fetchSchemaEntity = async (e) => {
        console.log(`fetchSchemaEntity(${JSON.stringify(e)})`)
        setError(null);
        setLoading(true);
        if (e && e.length) {
            try {  const entity = e[0];
                const schema = await axios.get(entity.conceptUri);
                const schemaStr = schema.data ;
                console.log(`Returning from get Entity: ${JSON.stringify(schemaStr)}`)

                // Prepare params to call visualize schema
                let params = {}
                params['schemaURL']=entity.conceptUri;
                params['schemaFormat']='ShExC';
                params['schemaEngine']='ShEx';
                const visual = await axios.post(API.schemaVisualize, params2Form(params),{
                    headers: { 'Access-Control-Allow-Origin': '*'}
                });
                const visualResult = visual.data
                console.log(`Returning from visualResult...${JSON.stringify(visualResult)}`)

                setPermalink(mkPermalink(API.wikidataSchemaVisualRoute, {id: entity.id, lang: entity.lang}))
                setLoading(false);
                setSchemaEntity(e)
                setSchemaId(entity.id);
                setSchemaLabel(entity.label);
                setSchemaDescr(entity.descr);
                setSchemaWebUri(entity.webUri);
                setShExContent(schemaStr);
                setResult(visualResult)
            } catch(error) {
                setLoading(false);
                setError(`Error doing request SchemaEntity: ${JSON.stringify(schemaEntity)}: ${error.message}`)
            };
        } else {
            setLoading(false);
            setError(`No entity selected, SchemaEntity: ${JSON.stringify(schemaEntity)}`)
        }
    }


    function handleSubmit(e) {
        e.preventDefault();
        fetchSchemaEntity(schemaEntity);
    }

    return (
       <Container>
         <h1>Visualize Wikidata Schema</h1>
         <InputSchemaEntityByText onChange={setSchemaEntity} entity={schemaEntity} />
         <Form onSubmit={handleSubmit}>
               <Button variant="primary" type="submit">Info about schema entity</Button>
         </Form>
          {loading ? <Pace color="#27ae60"/> : null }
          { error? <Alert variant="danger">{error}</Alert>: null }
          { shExContent?
              <div>
                  <h1>{schemaId} - {schemaLabel}</h1>
                  <p>{schemaDescr}</p>
                  <p><code><a href={schemaWebUri}>{schemaWebUri}</a></code></p>
                  { result? <PrintSVG svg={result.svg}/> : null }
                  <details><ShExForm onChange={()=>null} placeholder={''} readonly={true} value={shExContent} /></details>
                  <Permalink  />
              </div>
              : null
          }
          { permalink? <Permalink url={permalink} />: null }
       </Container>
    );
}

export default WikidataSchemaVisual;
