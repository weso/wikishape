import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Token, Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead-bs4.min.css";
import "react-bootstrap-typeahead/css/Typeahead.css";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import API from "../API";
import { SchemaEntities } from "../resources/schemaEntities";
import SelectLanguage from "./SelectLanguage";

const defaultLanguage = [{ label: "en", name: "English" }];

function InputSchemaEntityByText(props) {
  const [language, setLanguage] = useState(props.language || defaultLanguage);
  const [options, setOptions] = useState([]);

  // To be used when mediaWiki's API accepts searching for schemas
  const [endpoint] = useState(props.endpoint || API.currentUrl());

  useEffect(() => {
    if (language[0]) {
      setOptions(optionsFromSchemaEntities(language[0]?.label || language[0]));
    }
  }, [language]);

  function optionsFromSchemaEntities(lang) {
    return SchemaEntities.map((e) => {
      const labels = e.labels;
      let labelRecord;
      if (lang && labels[lang]) {
        labelRecord = labels[lang];
      } else {
        labelRecord = labels["en"];
      }
      return {
        id: e.id,
        label: labelRecord.label,
        descr: labelRecord.descr,
        conceptUri: e.conceptUri,
        webUri: e.webUri,
        lang: lang,
      };
    });
  }

  const MenuItem = ({ item }) => (
    <div>
      <span>{item.id}</span>
      <br />
      <span>{item.label}</span>
      <br />
      <span>
        <b>{item.descr}</b>
      </span>
    </div>
  );

  function customRenderToken(option, props, index) {
    return (
      <Token key={index} onRemove={props.onRemove}>
        {`${option.id} (${option.label})`}
      </Token>
    );
  }

  return (
    <Container fluid={true}>
      <Row>
        <Col>
          <Typeahead
            id="InputSchemaEntityByText"
            filterBy={["id", "label", "descr"]}
            labelKey="label"
            options={options}
            maxResults={10}
            minLength={2}
            renderToken={customRenderToken}
            placeholder="E.. or label"
            renderMenuItemChildren={(option, props) => (
              <MenuItem key={option.id} item={option} />
            )}
            useCache={false}
            selected={props.entities}
            onChange={(selected) => {
              props.onChange(selected);
            }}
          />
        </Col>
        <Col>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text id="basic-addon1">Language</InputGroup.Text>
            </InputGroup.Prepend>
            <SelectLanguage
              id="SelectLanguage"
              language={props.language || defaultLanguage}
              onChange={setLanguage}
            />
          </InputGroup>
        </Col>
      </Row>
    </Container>
  );
}

InputSchemaEntityByText.propTypes = {
  entities: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};

export default InputSchemaEntityByText;
