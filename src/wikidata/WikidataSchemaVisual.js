import React, {useEffect, useState} from 'react';
import Container from 'react-bootstrap/Container';
import Alert from "react-bootstrap/Alert";
import InputSchemaEntityByText from "../components/InputSchemaEntityByText";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import API from "../API";
import {mkPermalink, mkPermalinkLong, params2Form, Permalink} from "../Permalink";
import axios from "axios";
import Pace from "react-pace-progress";
import ShExForm from "../shex/ShExForm";
import PrintSVG from "../utils/PrintSVG";
import qs from 'query-string';
import { SchemaEntities } from "../resources/schemaEntities"
import {ReloadIcon} from "react-open-iconic-svg";


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
    const [lastSchemaEntity, setLastSchemaEntity] = useState([]);
    const [selectedEntity,setSelectedEntity] = useState([]);

    useEffect(() => {
       if (props.location.search) {
           const queryParams = qs.parse(props.location.search);
           let params = paramsFromQueryParams(queryParams);
           if (params['id']) {
               const schemaEntity = getSchemaEntity(params);
               if (schemaEntity) {
                   setSchemaEntity(schemaEntity)
                   setLastSchemaEntity(schemaEntity)
               }
               else setError("Required GET parameter 'ID'")
           }
       }
     },
        [props.location.search]
    );

    useEffect( () => {
        if (schemaEntity) {
            if (schemaEntity.length > 0) {
                // Remove results / errors / permalink from previous query
                resetState()
                // Update history
                setUpHistory()
                fetchSchemaEntity(schemaEntity)
            }
        }
        else {
            setError(`No entity selected, SchemaEntity: ${JSON.stringify(schemaEntity)}`)
        }
    }, [schemaEntity])

    function paramsFromQueryParams(params) {
     let newParams = {};
     if (params.id) newParams["id"] = params.id ;
     if (params.lang) newParams['lang'] = params.lang ;
     return newParams;
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


    const fetchSchemaEntity = async (e) => {
        console.log(`fetchSchemaEntity(${JSON.stringify(e)})`)
        setLoading(true);
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
            setLoading(false)
            setSchemaEntity(e)
            setSchemaId(entity.id)
            setSchemaLabel(entity.label)
            setSchemaDescr(entity.descr)
            setSchemaWebUri(entity.webUri)
            setShExContent(schemaStr)
            setResult(visual.data)
            setPermalink(await mkPermalink(API.wikidataSchemaVisualRoute, {id: entity.id, lang: entity.lang}))

        } catch(error) {
            setLoading(false);
            setError(`Error doing request SchemaEntity: ${JSON.stringify(schemaEntity)}: ${error.message}`)
        }
        finally {
            setLoading(false)
        }
    }


    function handleSubmit(e) {
        e.preventDefault();
        setSchemaEntity(selectedEntity)
    }

    function setUpHistory() {
        // Store the last search URL in the browser history to allow going back
        if (lastSchemaEntity && schemaEntity &&
            lastSchemaEntity.length && schemaEntity.length &&
            lastSchemaEntity[0].id.localeCompare(schemaEntity[0].id) !== 0){
            // eslint-disable-next-line no-restricted-globals
            history.pushState(null, document.title, mkPermalinkLong(API.wikidataSchemaVisualRoute, {
                id: lastSchemaEntity[0].id,
                lang: lastSchemaEntity[0].lang
            }))
        }
        // Change current url for shareable links
        // eslint-disable-next-line no-restricted-globals
        history.replaceState(null, document.title ,mkPermalinkLong(API.wikidataSchemaVisualRoute, {
            id: schemaEntity[0].id,
            lang: schemaEntity[0].lang
        }))

        setLastSchemaEntity(schemaEntity)

    }

    function resetState() {
        setShExContent(null)
        setPermalink(null)
        setError(null)
    }

    return (
       <Container>
         <h1>Visualize Wikidata Schema</h1>
         <InputSchemaEntityByText onChange={setSelectedEntity} entity={selectedEntity} />
         <Form onSubmit={handleSubmit}>
             <Button className="btn-with-icon" variant="primary" type="submit">Visualize schema
                 <ReloadIcon className="white-icon"/>
             </Button>
         </Form>
          {loading ? <Pace color="#27ae60"/> : null }
          { permalink? <Permalink url={permalink} />: null }
          { error? <Alert variant="danger">{error}</Alert>: null }
          { shExContent?
              <div>
                  <h1>{schemaId} - {schemaLabel}</h1>
                  <p>{schemaDescr}</p>
                  <p><code><a href={schemaWebUri}>{schemaWebUri}</a></code></p>
                  { result? <PrintSVG svg={result.svg}/> : null }
                  <details><ShExForm onChange={()=>null} placeholder={''} readonly={true} value={shExContent} /></details>
              </div>
              : null
          }
       </Container>
    );
}

export default WikidataSchemaVisual;
