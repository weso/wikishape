import React, {useState, useEffect} from 'react';
import Container from 'react-bootstrap/Container';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import { mkPermalink, params2Form, Permalink } from "./Permalink";
import API from "./API";
import Pace from "react-pace-progress";
import Form from "react-bootstrap/Form";
import QueryTabs from "./QueryTabs";
import Button from "react-bootstrap/Button";
import {convertTabQuery} from "./Utils";
import axios from "axios";
import ResultEndpointQuery from "./results/ResultEndpointQuery";
import QueryForm from "./QueryForm";
import {wikidataPrefixes} from "./resources/wikidataPrefixes";

const QUERY_URI = API.wikidataQuery ;

function WikidataQuery(props) {
    const [permalink, setPermalink] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error,setError] = useState(null);
    const [query, setQuery] = useState('')
    const [result, setResult] = useState(null)
    const [table, setTable] = useState(null);

    function handleSubmit(event) {
        event.preventDefault();
        let params = {};
        params['query']=query;
        const formData = params2Form(params);
        resolveQuery(QUERY_URI,formData);
    }

    function resolveQuery(url,formData) {
        setIsLoading(true);
        let axiosConfig = {
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                "Access-Control-Allow-Origin": "*",
            }
        };
        axios.post(url,formData,axiosConfig)
            .then(response => response.data)
            .then(data => {
                setIsLoading(false)
                setResult(data);
            }).catch(error => {
            setError(`Error on request: ${url}:  ${error.message}`)
        })
    }


    return (
       <Container fluid={true}>
         <h1>Query Wikidata</h1>
         <Row>
             <Col>
             { result || isLoading || error ?
             <div>
                 {isLoading ? <Pace color="#27ae60"/> :
                     error? <Alert variant="danger">{error}</Alert> :
                     result ?
                         <ResultEndpointQuery result={result} /> : null
                 }
                 { permalink &&  <Permalink url={permalink} /> }
             </div> : null
             }
             <Form onSubmit={handleSubmit}>
               <QueryForm
                         onChange={setQuery}
                         placeholder="select ?id ..."
                         value={query}
                         prefixes = { wikidataPrefixes }
             />
             <Button variant="primary"
                             type="submit">Resolve</Button>
             </Form>
             </Col>
         </Row>
       </Container>
     );
}

export default WikidataQuery;
