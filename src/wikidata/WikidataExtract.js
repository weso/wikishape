import React, {useEffect, useState} from 'react';
import Container from 'react-bootstrap/Container';
import Alert from "react-bootstrap/Alert";
import InputEntitiesByText from "../components/InputEntitiesByText";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import API from "../API";
import {mkPermalink, params2Form, Permalink} from "../Permalink";
import axios from "axios";
import ResultDataExtract from "../results/ResultDataExtract";
import Pace from "react-pace-progress";
import * as qs from "qs";
import {ReloadIcon} from "react-open-iconic-svg";

function WikidataExtract(props) {

    const [entities,setEntities] = useState([]);
    const [permalink,setPermalink] = useState('');
    const [result,setResult] = useState('');
    const [error,setError] = useState(null);
    const [loading,setLoading] = useState(false);
    const url = API.dataExtract;

    function handleChange(es) {
        setEntities(es);
    }

    useEffect(() => {
        if (props.location.search) {
            let params = {};
            const queryParams = qs.parse(props.location.search);
            params['entity'] = queryParams.entity;
            const formData = params2Form(params);
            postExtract(url, formData, () => {
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

    function postExtract(url, formData, cb) {
        setLoading(true);
        axios.post(url,formData)
            .then (response => response.data)
            .then((data) => {
                setLoading(false);
                setResult(data)
                if (cb) cb()
            })
            .catch(function (error) {
                setLoading(false);
                setError(`Error in request: ${url}: ${error.message}`);
            });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        let params={}
        params['endpoint'] = localStorage.getItem("endpoint") || API.wikidataContact.endpoint ;
        if (entities && entities.length > 0 && entities[0].uri ) {
            const nodeSelector = entities[0].uri
            // params['nodeSelector'] = "<" + nodeSelector + ">";
            params['entity'] = nodeSelector ;
            console.log(`Node selector: ${nodeSelector}`);
            setPermalink(await mkPermalink(API.wikidataExtractRoute, params));
            let formData = params2Form(params);
            postExtract(url,formData);
        } else {
            setError(`No entities selected`)
        }
    }


    return (
       <Container>
         <h1>Extract schema from Wikidata entities</h1>
         <InputEntitiesByText onChange={handleChange} entities={entities} />
         <Table>
               { entities.map(e => <tr><td>{e.label}</td><td>{e.uri}</td><td>{e.descr}</td></tr>)}
         </Table>
         <Form onSubmit={handleSubmit}>
             <Button className="btn-with-icon" variant="primary" type="submit">Extract schema
                 <ReloadIcon className="white-icon"/>
             </Button>
         </Form>
          {loading ? <Pace color="#27ae60"/> : null }
          { permalink? <Permalink url={permalink} />: null }
          { error? <Alert variant="danger">${error}</Alert>: null }
         <ResultDataExtract result={result} />
       </Container>
    );
}

export default WikidataExtract;
