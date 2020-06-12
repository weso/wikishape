import React, {useEffect, useState} from 'react';
import Container from 'react-bootstrap/Container';
import Alert from "react-bootstrap/Alert";
import InputEntitiesByText from "../components/InputEntitiesByText";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import API from "../API";
import {mkPermalink, mkPermalinkLong, Permalink} from "../Permalink";
import axios from "axios";
import ResultDataExtract from "../results/ResultDataExtract";
import * as qs from "qs";
import {ReloadIcon} from "react-open-iconic-svg";
import ProgressBar from "react-bootstrap/ProgressBar";
import set from "cytoscape/src/set";

function WikidataSheXer(props) {

    const [entities,setEntities] = useState([]);
    const [selectedEntities, setSelectedEntities] = useState([]);
    const [lastEntities, setLastEntities] = useState([]);
    const [endpoint,setEndpoint] = useState(API.currentEndpoint);
    const [permalink,setPermalink] = useState('');
    const [result,setResult] = useState('');
    const [error,setError] = useState(null);
    const [loading,setLoading] = useState(false);
    const [progressPercent,setProgressPercent] = useState(0);

    const url = "http://156.35.86.6:8080/shexer";


    useEffect(() => {
        if (props.location.search) {
            let params = {};
            const queryParams = qs.parse(props.location.search.substring(1));
            if (queryParams.endpoint) {
                setEndpoint(queryParams.endpoint)
            }
            if (queryParams.entity) {
                setSelectedEntities([{"uri": queryParams.entity}])
                setEntities([{"uri": queryParams.entity}])
                setLastEntities([{"uri": queryParams.entity}])
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
                postExtract(sheXerParams(entities[0].uri))
            }
        }
        else {
            setError(`No entities selected, SchemaEntity: ${JSON.stringify(entities)}`)
        }
    }, [entities])


    function sheXerParams(entity) {
        return {"prefixes": {
                "http://wikiba.se/ontology#": "wikibase",
                "http://www.bigdata.com/rdf#": "bd",
                "http://www.wikidata.org/entity/": "wd",
                "http://www.wikidata.org/prop/direct/": "wdt",
                "http://www.wikidata.org/prop/direct-normalized/": "wdtn",
                "http://www.wikidata.org/entity/statement/": "wds",
                "http://www.wikidata.org/prop/": "p",
                "http://www.wikidata.org/reference/": "wdref",
                "http://www.wikidata.org/value/": "wdv",
                "http://www.wikidata.org/prop/statement/": "ps",
                "http://www.wikidata.org/prop/statement/value/": "psv",
                "http://www.wikidata.org/prop/statement/value-normalized/": "psn",
                "http://www.wikidata.org/prop/qualifier/": "pq",
                "http://www.wikidata.org/prop/qualifier/value/": "pqv",
                "http://www.wikidata.org/prop/qualifier/value-normalized/": "pqn",
                "http://www.wikidata.org/prop/reference/": "pr",
                "http://www.wikidata.org/prop/reference/value/": "prv",
                "http://www.wikidata.org/prop/reference/value-normalized/": "prn",
                "http://www.wikidata.org/prop/novalue/": "wdno"
            },
            "shape_map": "SPARQL'SELECT DISTINCT ?virus WHERE {   VALUES ?virus {  wd:Q82069695  }  }'@<Virus>  ",
            "endpoint": "https://query.wikidata.org/sparql",
            "all_classes": false,
            "query_depth": 2,
            "threshold": 0,
            "instantiation_prop": "http://www.wikidata.org/prop/direct/P31",
            "disable_comments": true,
            "shape_qualifiers_mode": true,
            "namespaces_for_qualifiers": ["http://www.wikidata.org/prop/"]
        }

    }

    function handleChange(es) {
        setSelectedEntities(es);
    }

    function handleSubmit(event) {
        event.preventDefault();
        setEntities(selectedEntities)
    }

    function postExtract(jsonData, cb) {
        setLoading(true);
        setProgressPercent(30)
        const params = {
            entity: entities[0].uri,
            endpoint: endpoint
        }
        axios.post(url,jsonData, { headers: {'Content-type': 'Application/json'}})
            .then (response => {
                setProgressPercent(70)
                return response.data
            })
            .then(async data => {
                setResult(data);
                if (cb) cb()
                setProgressPercent(90)
                setPermalink(await mkPermalink(API.wikidataSheXerRoute, params));
                setProgressPercent(100)
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
            endpoint: endpoint
        }))

        setLastEntities(entities)
    }

    function resetState() {
        setResult(null)
        setPermalink(null)
        setError(null)
        setEndpoint(API.currentEndpoint())
        setProgressPercent(0)
    }


    return (
       <Container>
         <h1>Extract schema from Wikibase entities (sheXer)</h1>
           <h4>Target Wikibase: <a href={API.currentUrl()}>{API.currentUrl()}</a></h4>
         <InputEntitiesByText onChange={handleChange} entities={entities} />
         <Table>
             <tbody>
               { entities.map(e =>
                   <tr key={e.id || e.uri}>
                       <td>{e.label || "Unknown label"}</td>
                       <td>{<a target="_blank" href={e.uri}>{e.uri}</a> || "Unknown URI"}</td>
                       <td>{e.descr || "No description provided"}</td>
                   </tr>
               )
               }
             </tbody>
         </Table>
         <Form onSubmit={handleSubmit}>
             <Button className={"btn-with-icon " + (loading ? "disabled" : "")}
                     variant="primary" type="submit" disabled={loading}>
                 Extract schema
                 <ReloadIcon className="white-icon"/>
             </Button>
         </Form>
          { loading ? <ProgressBar striped animated variant="info" now={progressPercent}/> : null }
          { permalink? <Permalink url={permalink} />: null }
          { error? <Alert variant="danger">${error}</Alert>: null }
         <ResultDataExtract result={result} />
       </Container>
    );
}

export default WikidataSheXer;
