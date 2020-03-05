import React, {useEffect, useState} from 'react';
import Container from 'react-bootstrap/Container';
import Alert from "react-bootstrap/Alert";
import InputPropertiesByText from "./InputPropertiesByText";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import API from "./API";
import {mkPermalink, Permalink} from "./Permalink";
import axios from "axios";
import ResultOutgoing from "./results/ResultOutgoing";
import Pace from "react-pace-progress";
import qs from "query-string";

function WikidataProperty(props) {

    const [entities,setEntities] = useState([]);
    const [permalink,setPermalink] = useState('');
    const [result,setResult] = useState('');
    const [error,setError] = useState(null);
    const [loading,setLoading] = useState(false);

    useEffect(() => {
            if (props.location.search) {
                const params = qs.parse(props.location.search);
                if (params.node) {
                    setEntities([{uri: params.node}]);
                    fetchOutgoing(params.node);
                } else {
                    setError(`No value for parameter node`)
                }
            }
        },
        [props.location.search]
    );

    function handleChange(es) {
        setEntities(es);
    }

    function fetchOutgoing(node) {
        let params={};
        params['endpoint'] = window.name || API.wikidataUrl ;
        params['node'] = node ;
        console.log(`Node: ${node}`);
        setPermalink(mkPermalink(API.wikidataOutgoingRoute, params));
        getOutgoing(API.dataOutgoing,params);
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (entities && entities.length > 0 && entities[0].uri) {
            const node = entities[0].uri;
            fetchOutgoing(node)
        } else {
            setError(`No entity selected`)
        }
    }

    function getOutgoing(url, params, cb) {
        setLoading(true);
        axios.get(url,{
            params: params,
            headers: { 'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            }})
            .then (response => response.data)
            .then((data) => {
                setLoading(false);
                setResult(data);
                if (cb) cb()
            })
            .catch((error) => {
                console.log(`Error processing request: ${url}: ${error.message}`);
                setLoading(false);
                setError(`Error processing ${url}: ${error.message}`);
            });

    }

    return (
       <Container>
         <h1>Info about wikidata properties</h1>
         <InputPropertiesByText onChange={handleChange} multiple={false} entities={entities} />
         <Table>
               { entities.map(e => <tr><td>{e.label}</td><td>{e.uri}</td><td>{e.descr}</td></tr>)}
         </Table>
         <Form onSubmit={handleSubmit}>
               <Button variant="primary" type="submit">Outgoing arcs</Button>
         </Form>
          {loading ? <Pace color="#27ae60"/> : null }
          { error? <Alert variant="danger">${error}</Alert>: null }
         <ResultOutgoing result={result} />
         { permalink? <Permalink url={permalink} />: null }
       </Container>
    );
}

export default WikidataProperty;
