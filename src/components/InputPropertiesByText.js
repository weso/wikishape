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
import SelectLanguage from "./SelectLanguage";

const SEARCH_URI = API.routes.server.wikibaseSearchProperty;
const PER_PAGE = 50;
const defaultLanguage = [{ label: "en", name: "English" }];

function InputPropertiesByText(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(props.entities);
  const [language, setLanguage] = useState(defaultLanguage);

  function makeAndHandleRequest(label, language, page = 0) {
    const lang = language[0] ? language[0].label : "en";
    return fetch(
      `${SEARCH_URI}?${API.queryParameters.endpoint}=${API.currentUrl()}&${
        API.queryParameters.payload
      }=${label}&${API.queryParameters.limit}=${PER_PAGE}&${
        API.queryParameters.language
      }=${lang}&${API.queryParameters.continue}=${page * PER_PAGE}`
    )
      .then((resp) => resp.json())
      .then(({ result: properties }) => {
        return properties;
      })
      .catch(() => []);
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
