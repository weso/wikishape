import React, {useState} from 'react';
import Container from 'react-bootstrap/Container';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import {params2Form, Permalink } from "./Permalink";
import API from "./API";
import Pace from "react-pace-progress";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";
import ResultEndpointQuery from "./results/ResultEndpointQuery";
import QueryForm from "./QueryForm";
import {wikidataPrefixes} from "./resources/wikidataPrefixes";
import Spinner from "react-bootstrap/Spinner";

const QUERY_URI = API.wikidataQuery ;

function WikidataQuery() {
    const [permalink] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error,setError] = useState(null);
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);


    const divStyle = {
        display: 'flex',
        marginTop: '10px'
    };
    const spinnerStyle = {
        marginLeft: '10px',
        visibility: isLoading?'visible':'hidden'
    };

    function handleSubmit(event) {
        event.preventDefault();
        let params = {};
        params['query'] = query;
        params['endpoint']= localStorage.getItem('endpoint') || API.wikidataContact.endpoint;
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
         <h1>Query current endpoint:</h1>
         <h4>{localStorage.getItem('endpoint')}</h4>
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
             <div style={divStyle}>
             <Button variant="primary"
                             type="submit">Resolve</Button>
             <Spinner style={spinnerStyle} animation="border" variant="primary" /></div>
             </Form>
             </Col>
         </Row>
       </Container>
     );
}

export default WikidataQuery;
