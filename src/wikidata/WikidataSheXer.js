import React, {useEffect, useState} from 'react';
import Container from 'react-bootstrap/Container';
import Alert from "react-bootstrap/Alert";
import InputEntitiesByText from "../components/InputEntitiesByText";
import Table from "react-bootstrap/Table";
//import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
//import DataTabs from "../data/DataTabs";
import Button from "react-bootstrap/Button";
import API from "../API";
import {mkPermalink, params2Form, Permalink} from "../Permalink";
import axios from "axios";
import ResultDataExtract from "../results/ResultDataExtract";
import Pace from "react-pace-progress";
import * as qs from "qs";

function WikidataSheXer(props) {

    const [entities,setEntities] = useState([]);
    const [permalink,setPermalink] = useState('');
    const [result,setResult] = useState('');
    const [error,setError] = useState(null);
    const [loading,setLoading] = useState(false);
    const url = "http://156.35.86.6:8080/shexer";

    function handleChange(es) {
        setEntities(es);
    }


    useEffect(() => {
        if (props.location.search) {
            let params = {};
            const queryParams = qs.parse(props.location.search);
            params['entity'] = queryParams.entity;
            const formData = params2Form(params);
            postExtract(url, sheXerParams(queryParams.entity), () => {
                setEntities(updateEntities(params,entities));
            });
        }
    }, [props.location.search]);

    function updateEntities(params, entities) {
        if (params['entity']) {
            return [ params['entity'] ]
        } else {
            return entities
        }
    }

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

    function postExtract(url, jsonData, cb) {
        setLoading(true);
        axios.post(url,jsonData, { headers: {'Content-type': 'Application/json'}})
            .then (response => response.data)
            .then((data) => {
                setLoading(false);
                setResult(data);
                if (cb) cb()
            })
            .catch(function (error) {
                setLoading(false);
                setError(`Error in request: ${url}: ${error.message}`);
            });
    }

    function handleSubmit(event) {
        event.preventDefault();
        let params={}
        params['endpoint'] = localStorage.getItem("endpoint") || API.wikidataContact.endpoint ;
        if (entities && entities.length > 0 && entities[0].uri ) {
            const nodeSelector = entities[0].uri
            // params['nodeSelector'] = "<" + nodeSelector + ">";
            params['entity'] = nodeSelector ;
            console.log(`Node selector: ${nodeSelector}`);
            setPermalink(mkPermalink(API.wikidataExtractRoute, params));
            // let formData = params2Form(params);
            postExtract(url,sheXerParams(nodeSelector));
        } else {
            setError(`No entities selected`)
        }
    }


    return (
       <Container>
         <h1>Extract schema from Wikidata entities (sheXer)</h1>
         <InputEntitiesByText onChange={handleChange} entities={entities} />
         <Table>
               { entities.map(e => <tr><td>{e.label}</td><td>{e.uri}</td><td>{e.descr}</td></tr>)}
         </Table>
         <Form onSubmit={handleSubmit}>
               <Button variant="primary" type="submit">Extract Schema</Button>
         </Form>
          {loading ? <Pace color="#27ae60"/> : null }
          { error? <Alert variant="danger">${error}</Alert>: null }
         <ResultDataExtract result={result} />
         { permalink? <Permalink url={permalink} />: null }
       </Container>
    );
}

export default WikidataSheXer;
