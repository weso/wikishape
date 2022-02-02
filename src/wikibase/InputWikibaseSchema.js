import axios from "axios";
import PropTypes from "prop-types";
import React, { useEffect, useReducer } from "react";
import Alert from "react-bootstrap/Alert";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import API from "../API";
import Code from "../components/Code";

function InputWikibaseSchema(props) {
  const initialStatus = {
    url: "",
    number: "",
    rawUrl: "",
    content: "",
    loading: false,
    error: null,
  };
  const [status, dispatch] = useReducer(reducer, initialStatus);

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "setLoading" });

      const result = axios
        .get(API.wikibaseSchemaContent, {
          params: { wdSchema: status.number },
        })
        .then((response) => response.data)
        .then(({ result }) => {
          dispatch({ type: "setContent", value: result });
        })
        .catch((err) => dispatch({ type: "setError", value: err }));
    };
    fetchData();
  }, [status.number]);

  function reducer(status, action) {
    switch (action.type) {
      case "setNumber":
        const number = action.value;
        return {
          ...status,
          number: number,
          rawUrl: (props.raw ? props.raw : props.stem) + number,
          url: props.stem + number,
          content: null,
        };
      case "setLoading":
        return { ...status, loading: true, error: null };
      case "setError":
        return { ...status, error: action.value, loading: false };
      case "setContent":
        return {
          ...status,
          content: action.value,
          loading: false,
          error: null,
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
    props.handleChange(status.rawUrl);
  }

  return (
    <div>
      <InputGroup className="mb-3">
        <InputGroup.Prepend>
          <InputGroup.Text id="entityNumber">{props.name}</InputGroup.Text>
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
      {status.content ? (
        <details>
          <Code mode="ShExC" value={status.content} readonly={true} />
        </details>
      ) : null}
    </div>
  );
}

InputWikibaseSchema.propTypes = {
  name: PropTypes.string.isRequired,
  entity: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  stem: PropTypes.string.isRequired, // stem of URL
  raw: PropTypes.string, // raw stem of URL
};

export default InputWikibaseSchema;
