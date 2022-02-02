import axios from "axios";
import PropTypes from "prop-types";
import React, { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Pace from "react-pace-progress";
import API from "../API";
import { params2Form } from "../Permalink";
import QueryForm from "../query/QueryForm";
import { wikidataPrefixes } from "../resources/wikidataPrefixes";
import { cnvValueFromSPARQL } from "../utils/Utils";

function parseData(data) {
  if (data.head && data.head.vars && data.head.vars.length) {
    const varName = data.head.vars[0];
    return data.results.bindings.map((binding) => {
      const v = binding[varName];
      const converted = cnvValueFromSPARQL(v);
      return converted;
    });
  } else {
    return [];
  }
}

// To be used
function InputEntitiesBySPARQL(props) {
  const queryUrl = API.wikidataSparqlUrl;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [rawResult, setRawResult] = useState(null);
  const [entities, setEntities] = useState(entities);

  function resolveQuery(url, formData) {
    setIsLoading(true);
    axios
      .post(url, formData)
      .then((response) => response.data)
      .then((data) => {
        setIsLoading(false);
        setRawResult(data);
        setEntities(parseData(data));
      })
      .catch((error) => {
        setError(`Error on request: ${url}:  ${error.message}`);
      });
  }

  function handleSubmit(event) {
    event.preventDefault();
    let params = {};
    params["query"] = query;
    const formData = params2Form(params);
    resolveQuery(queryUrl, formData);
  }

  return (
    <Container fluid={true}>
      {isLoading ? <Pace color="#27ae60" /> : null}
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {entities ? (
        <details>
          <Table>
            {entities.map((entity, idx) => {
              return (
                <tr id={idx}>
                  <td>{entity}</td>
                </tr>
              );
            })}
          </Table>
        </details>
      ) : null}
      <Form onSubmit={handleSubmit}>
        <QueryForm
          onChange={setQuery}
          placeholder="select ?id ..."
          value={query}
          prefixes={wikidataPrefixes}
        />
        <Button variant="primary" type="submit">
          Resolve
        </Button>
      </Form>
    </Container>
  );
}

InputEntitiesBySPARQL.propTypes = {
  entities: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};

InputEntitiesBySPARQL.defaultProps = {};

export default InputEntitiesBySPARQL;
