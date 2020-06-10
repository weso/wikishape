import React, {useEffect, useState} from 'react';
import Container from 'react-bootstrap/Container';
import Alert from "react-bootstrap/Alert";
import InputEntitiesByText from "../components/InputEntitiesByText";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import API from "../API";
import {mkPermalink, mkPermalinkLong, params2Form, Permalink} from "../Permalink";
import axios from "axios";
import ResultDataExtract from "../results/ResultDataExtract";
import * as qs from "qs";
import {ReloadIcon} from "react-open-iconic-svg";
import ProgressBar from "react-bootstrap/ProgressBar";

function WikidataExtract(props) {

    const [entities,setEntities] = useState([]);
    const [selectedEntities, setSelectedEntities] = useState([]);
    const [lastEntities, setLastEntities] = useState([]);
    const [endpoint,setEndpoint] = useState(API.currentEndpoint);
    const [permalink,setPermalink] = useState('');
    const [result,setResult] = useState('');
    const [error,setError] = useState(null);
    const [loading,setLoading] = useState(false);
    const [progressPercent,setProgressPercent] = useState(0);

    const url = API.dataExtract;

    useEffect(() => {
        if (props.location.search) {
            const queryParams = qs.parse(props.location.search.substring(1));
            if (queryParams.endpoint)
                setEndpoint(queryParams.endpoint)
            if (queryParams.entity) {
                setSelectedEntities([{'uri': queryParams.entity}])
                setEntities([{'uri': queryParams.entity}])
                setLastEntities([{'uri': queryParams.entity}])
            }
        }
    }, [props.location.search]);

    useEffect( () => {
        if (entities) {
            if (entities.length && entities[0].uri) {
                // Remove results / errors / permalink from previous query
                resetState()
                // Update history
                setUpHistory()
                postExtract()
            }
        }
        else {
            setError(`No entities selected, SchemaEntity: ${JSON.stringify(entities)}`)
        }
    }, [entities])

    function handleChange(es) {
        setSelectedEntities(es)
    }

    function handleSubmit(event) {
        event.preventDefault();
        setEntities(selectedEntities)
    }

    function postExtract(cb) {
        setLoading(true);
        setProgressPercent(10)
        const params = {
            entity: entities[0].uri,
            endpoint: endpoint
        }
        const formData = params2Form(params)
        setProgressPercent(30)
        axios.post(url, formData)
            .then (response => {
                setProgressPercent(70)
                return response.data
            })
            .then(async data => {
                setResult(data)
                setProgressPercent(100)
                setPermalink(await mkPermalink(API.wikidataExtractRoute, params));
                if (cb) cb()
            })
            .catch(function (error) {
                setError(`Error in request: ${url}: ${error.message}`);
            })
            .finally( () => setLoading(false));
    }

    function setUpHistory() {
        // Store the last search URL in the browser history to allow going back
        if (lastEntities && entities &&
            lastEntities.length && entities.length &&
            lastEntities[0].uri.localeCompare(entities[0].uri) !== 0){
            // eslint-disable-next-line no-restricted-globals
            history.pushState(null, document.title, mkPermalinkLong(API.wikidataExtractRoute, {
                entity: lastEntities[0].uri,
                endpoint: endpoint
            }))
        }
        // Change current url for shareable links
        // eslint-disable-next-line no-restricted-globals
        history.replaceState(null, document.title ,mkPermalinkLong(API.wikidataExtractRoute, {
            entity: entities[0].uri,
            endpoint: endpoint,
        }))

        setLastEntities(entities)
    }

    function resetState() {
        setResult(null)
        setPermalink(null)
        setError(null)
        setProgressPercent(0)
    }


    return (
       <Container>
         <h1>Extract schema from Wikibase entities</h1>
           <h4>Target Wikibase: <a href={API.currentUrl()}>{API.currentUrl()}</a></h4>
         <InputEntitiesByText onChange={handleChange} entities={entities} />
         <Table>
             <tbody>
               { selectedEntities.map(e =>
                   <tr key={e.id || e.uri}>
                       <td>{e.label || 'Unknown label'}</td>
                       <td>{<a target='_blank' href={e.uri}>{e.uri}</a> || 'Unknown URI'}</td>
                       <td>{e.descr || 'No description provided'}</td>
                   </tr>
               )
               }
             </tbody>
         </Table>
         <Form onSubmit={handleSubmit}>
             <Button className={"btn-with-icon " + (loading ? "disabled" : "")} variant="primary" type="submit">Extract schema
                 <ReloadIcon className="white-icon"/>
             </Button>
         </Form>
          { loading ? <ProgressBar striped animated variant="info" now={progressPercent}/> : null}
          { permalink? <Permalink url={permalink} />: null }
          { error? <Alert variant="danger">${error}</Alert>: null }
         <ResultDataExtract result={result} />
       </Container>
    );
}

export default WikidataExtract;
