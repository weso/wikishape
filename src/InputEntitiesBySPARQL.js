import React, {useState, useEffect} from 'react';
import PropTypes from "prop-types";
import API from "./API";
import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import {params2Form} from "./Permalink";
import Pace from "react-pace-progress";
import axios from "axios";
import QueryForm from "./QueryForm";


const QUERY_URI = API.wikidataQuery ;


function InputEntitiesBySPARQL(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('')
    const [rawResult, setRawResult] = useState(null)

    function resolveQuery(url,formData) {
        setIsLoading(true);
        axios.post(url,formData)
            .then(response => response.data)
            .then(data => {
                setIsLoading(false)
                setRawResult(data)
            }).catch(error => {
                setError(`Error on request: ${url}:  ${error.message}`)
        })
    }

    function handleSubmit(event) {
        event.preventDefault();
        let params = {};
        params['query']={query};
        const formData = params2Form(params);
        resolveQuery(QUERY_URI,formData);
    }

    return (
        <Container fuild={true}>
            { isLoading ? <Pace color="#27ae60"/> : null }
            { error ? <Alert variant="danger">{error}</Alert>: null }
            { rawResult ? <pre>{JSON.stringify(rawResult)}</pre>: null}
            <QueryForm onChange={setQuery} placeholder="select ?id ..." value={query} />
            <Button variant="primary"
                    type="submit">Resolve</Button>

        </Container>
  );
}

InputEntitiesBySPARQL.propTypes = {
    entities: PropTypes.array,
    onChange: PropTypes.func.isRequired,
};

InputEntitiesBySPARQL.defaultProps = {
};

export default InputEntitiesBySPARQL;
