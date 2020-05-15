import React, {useState} from 'react';
import Container from 'react-bootstrap/Container';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import {params2Form, Permalink } from "../Permalink";
import API from "../API";
import {validateURL} from "../utils/Utils"
import Pace from "react-pace-progress";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";
import ResultEndpointQuery from "../results/ResultEndpointQuery";
import QueryForm from "../query/QueryForm";
import Spinner from "react-bootstrap/Spinner";

const QUERY_URI = API.wikidataQuery ;

function WikidataQuery() {
    const [permalink] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error,setError] = useState(null);
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [controlPressed, setControlPressed] = useState(false);
    const currentUrlHostname = API.currentUrl().split(/\/\//)[1].split('/')[0];

    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            "Access-Control-Allow-Origin": "*",
        }
    };

    const divStyle = {
        display: 'flex',
        margin: '10px auto'
    };
    const spinnerStyle = {
        marginLeft: '10px',
        visibility: isLoading?'visible':'hidden'
    };

    function handleChange(queryText){
      const query = queryText.replace(/^PREFIX.*$/gim, '');
      setQuery(query);
    }

    function onKeyDown(event) {
        const key = event.which || event.keyCode;
        if (key === 17) setControlPressed(true);
        else if (key === 13 && controlPressed) handleSubmit(event)
    }

    function onKeyUp(event) {
        const key = event.which || event.keyCode;
        if (key === 17) setControlPressed(false)
    }

    function handleSubmit(event) {
        event.preventDefault();
        let params = {};
        params['query'] = query;
        params['endpoint']= localStorage.getItem("endpoint") || API.wikidataContact.endpoint;
        const formData = params2Form(params);
        resolveQuery(QUERY_URI,formData);
    }

    // Place the current URL to the resulting items
    function handleResults(initialResults) {
        let data = initialResults.results.bindings;
        for (let i = 0; i < data.length; i++) {
            console.log(data[i])
            Object.keys(data[i]).forEach( (key) => {
                let value = data[i][key].value;
                console.log(value)
                if (value && validateURL(value)) {
                    let path = value.split(/\/\//)[1].split(/\/(.+)/)[1];
                    data[i][key].value = `${value.split(/\/\//)[0]}//${currentUrlHostname}/${path}`;
                }
            });
        }

        setResult(initialResults);
    }

    function resolveQuery(url,formData) {
        setIsLoading(true);

        axios.post(url,formData,axiosConfig)
            .then(response => {
              setIsLoading(false);
              const results = response.data.results;
              // TODO: Even if the request fails, the RdfShape server returns a 200 status with no data so the client does not
              // realizes there is no data and may fail processing it. Refactor the server to return a more accurate code.
              if (results && results.bindings.length > 0) {
                setError(null);
                handleResults(response.data)
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
              }
            );
          
    }


    return (
       <Container fluid={true}>
         <h1>Query SPARQL endpoint:</h1>
           <h4>Current endpoint: <a href={API.currentEndpoint()}>{API.currentEndpoint()}</a></h4>
         <Row>
             <Col>
             <Form onSubmit={handleSubmit} onKeyDown={onKeyDown} onKeyUp={onKeyUp}>
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
