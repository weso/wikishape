import PropTypes from "prop-types";
import React, { useState } from "react";
import { AsyncTypeahead, Token } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead-bs4.min.css";
import "react-bootstrap-typeahead/css/Typeahead.css";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import API from "../API";
import axios from "../utils/networking/axiosConfig";
import { defaultLanguage, perPage } from "./InputEntitiesByText";
import SelectLanguage from "./SelectLanguage";

const urlSearch = API.routes.server.wikibaseSearchProperty;

function InputPropertiesByText(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(props.entities);
  const [endpoint] = useState(props.endpoint || API.currentUrl());
  const [language, setLanguage] = useState(defaultLanguage);

  async function makeAndHandleRequest(label, language, page = 0) {
    const lang = language[0] ? language[0].label : "en";

    try {
      const {
        data: { result: entities },
      } = await axios.post(urlSearch, {
        [API.queryParameters.wikibase.endpoint]: endpoint,
        [API.queryParameters.wikibase.payload]: label,
        [API.queryParameters.wikibase.limit]: perPage,
        [API.queryParameters.wikibase.language]: lang,
        [API.queryParameters.wikibase.continue]: page * perPage,
      });
      return entities;
    } catch (error) {
      // Log error and return no entities
      console.error(error);
      return [];
    }
  }

  function handleSearch(query) {
    setIsLoading(true);
    makeAndHandleRequest(query, language, 0).then((resp) => {
      setIsLoading(false);
      setOptions(resp);
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
          <AsyncTypeahead
            id="type-ahead"
            filterBy={["id", "label", "descr"]}
            labelKey="id"
            multiple={props.multiple}
            isLoading={isLoading}
            options={options}
            maxResults={10}
            paginate
            minLength={2}
            onSearch={handleSearch}
            renderToken={customRenderToken}
            placeholder="P.. or label"
            renderMenuItemChildren={(option) => (
              <MenuItem key={option.id} item={option} />
            )}
            useCache={false}
            selected={selected}
            onChange={(selected) => {
              props.onChange(selected);
              setSelected(selected);
            }}
          />
        </Col>
        <Col>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text id="basic-addon1">Language</InputGroup.Text>
            </InputGroup.Prepend>
            <SelectLanguage
              language={[{ label: "en", name: "English" }]}
              onChange={setLanguage}
            />
          </InputGroup>
        </Col>
      </Row>
    </Container>
  );
}

InputPropertiesByText.propTypes = {
  entities: PropTypes.array,
  multiple: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

InputPropertiesByText.defaultProps = {
  multiple: true,
};

export default InputPropertiesByText;
