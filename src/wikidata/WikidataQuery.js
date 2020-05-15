import React, {useState} from 'react';
import Container from 'react-bootstrap/Container';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import {params2Form, Permalink } from "../Permalink";
import API from "../API";
import Pace from "react-pace-progress";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";
import ResultEndpointQuery from "../results/ResultEndpointQuery";
import QueryForm from "../query/QueryForm";
import {wikidataPrefixes} from "../resources/wikidataPrefixes";
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
        margin: '10px'
    };
    const spinnerStyle = {
        marginLeft: '10px',
        visibility: isLoading?'visible':'hidden'
    };

    function handleChange(queryText){
      const query = queryText.replace(/^PREFIX.*$/im, '');
      setQuery(query);
    }

    function handleSubmit(event) {
        event.preventDefault();
        console.log(query)
        let params = {};
        params['query'] = query;
        params['endpoint']= localStorage.getItem("endpoint") || API.wikidataContact.endpoint;
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
            .then(response => {
              setIsLoading(false);
              const results = response.data.results;
              // TODO: Even if the request fails, the RdfShape server returns a 200 status with no data so the client does not
              // realizes there is no data and may fail processing it. Refactor the server to return a more accurate code.
              if (results && results.bindings.length > 0) {
                setError(null);
                setResult(response.data);
              }
              else {
                setResult(null);
                setError(`Error on request: ${url}:  No results found`);
              }
            })
            .catch(error => {
              setResult(null);
              setError(`Error on request: ${url}:  ${error.message}`);
            }).finally ( () => {
                setIsLoading(false);
                console.log(result);
              }
            );
          
    }


    return (
       <Container fluid={true}>
         <h1>Query current endpoint:</h1>
         <h4>{localStorage.getItem("endpoint") || API.wikidataContact.endpoint}</h4>
         <Row>
             <Col>
             <Form onSubmit={handleSubmit}>
               <QueryForm 
                         onChange={handleChange}
                         placeholder="select ?id ..."
                         value={query}
             />
             <div style={divStyle}>
             <Button variant="primary"
                             type="submit">Resolve</Button>
             <Spinner style={spinnerStyle} animation="border" variant="primary" /></div>
             </Form>
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
             </Col>
         </Row>
       </Container>
     );
}

export default WikidataQuery;
