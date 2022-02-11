import axios from "axios";
import PropTypes from "prop-types";
import React, { useEffect, useReducer } from "react";
import Alert from "react-bootstrap/Alert";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import API from "../API";

function InputEntity(props) {
  const initialStatus = {
    url: "",
    number: "",
    descr: "",
    rawUrl: "",
    language: "en",
  };
  const [status, dispatch] = useReducer(reducer, initialStatus);

  useEffect(() => {
    findEntityLabel(status.number, status.language);
  }, [status.url, status.language]);

  function findEntityLabel(entity, language) {
    const params = {
      [API.queryParameters.wikibase.payload]: entity,
      [API.queryParameters.wikibase.language]: language,
    };

    axios
      .get(API.wikibaseEntityLabel, params)
      .then((response) => response.data)
      .then(({result}) => {
        const label = result.entities[entity].labels[language].value;
        dispatch({ type: "setLabel", value: label });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function reducer(status, action) {
    switch (action.type) {
      case "setNumber":
        const number = action.value;
        return {
          ...status,
          number: number,
          rawUrl: (props.raw ? props.raw : props.stem) + number,
          url: props.stem + number,
        };
      case "setLabel":
        return {
          ...status,
          label: action.value,
        };
      default:
        return new Error(
          `InputEntity reducer: Unknown action type: ${action.type}`
        );
    }
  }

  function handleNumberChange(e) {
    const number = e.target.value;
    dispatch({ type: "setNumber", value: number });
  }

  return (
    <div>
      <InputGroup className="mb-3">
        <InputGroup.Prepend>
          <InputGroup.Text id="entityNumber">Number</InputGroup.Text>
        </InputGroup.Prepend>
        <FormControl
          placeholder={props.placeholder}
          aria-label="Entity number"
          aria-describedby="entityNumber"
          value={status.number}
          onChange={handleNumberChange}
        />
      </InputGroup>
      <Alert variant="light">
        Concept URL: <Alert.Link href={status.url}>{status.rawUrl}</Alert.Link>
      </Alert>
      <Alert variant="light">Label: {status.label}</Alert>
      <InputGroup className="mb-3">
        <InputGroup.Prepend>
          <InputGroup.Text id="entityLabel">Label</InputGroup.Text>
        </InputGroup.Prepend>
        <FormControl
          placeholder="Label"
          aria-label="Entity Label"
          aria-describedby="entityLabel"
        />
      </InputGroup>
    </div>
  );
}

InputEntity.propTypes = {
  name: PropTypes.string.isRequired,
  entity: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  stem: PropTypes.string.isRequired, // stem of URL
  raw: PropTypes.string, // raw stem of URL
};

export default InputEntity;
