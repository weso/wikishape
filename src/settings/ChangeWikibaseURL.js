import PropTypes from "prop-types";
import React, {
  // useContext,
  useState
} from "react";
import "react-bootstrap-typeahead/css/Typeahead-bs4.min.css";
import "react-bootstrap-typeahead/css/Typeahead.css";
import Container from "react-bootstrap/Container";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/Form";
import API from "../API";
import { validateURL } from "../utils/Utils";

function ChangeWikibaseURL(props) {
  const [url, setUrl] = useState(
    localStorage.getItem("url") || API.wikidataContact.url
  );
  const [endpoint, setEndpoint] = useState(
    localStorage.getItem("endpoint") || API.wikidataContact.endpoint
  );

  const okMessageUrl = "Valid wikibase URL. URL updated.";
  const errorMessageUrl = "Invalid wikibase URL.";

  const okMessageEndpoint = "Valid endpoint URL. Endpoint updated.";
  const errorMessageEndpoint = "Invalid endpoint URL.";

  const [messageUrl, setMessageUrl] = useState(okMessageUrl);
  const [messageEndpoint, setMessageEndpoint] = useState(okMessageEndpoint);

  const okMessageStyle = {
    display: "block",
    color: "green",
  };

  const errorMessageStyle = {
    display: "block",
    color: "red",
  };

  const [messageUrlStyle, setMessageUrlStyle] = useState({
    display: "none",
  });

  const [messageEndpointStyle, setMessageEndpointStyle] = useState({
    display: "none",
  });

  const wikibaseURLs = [
    { name: "Wikidata", data: API.wikidataContact },
    { name: "Example wikibase", data: API.exampleWikibaseContact },
    { name: "Local wikibase (default)", data: API.localWikibaseContact },
  ];

  function processUrl(receivedUrl) {
    // Validate base url
    if (validateURL(receivedUrl) === true) {
      setMessageUrlStyle(okMessageStyle);
      setMessageUrl(okMessageUrl);
      // Set new custom endpoint
      setUrl(receivedUrl);
      localStorage.setItem("url", receivedUrl);
    } else {
      // Show error and keep old url
      setMessageUrlStyle(errorMessageStyle);
      setMessageUrl(errorMessageUrl);
    }
  }

  function processEndpoint(receivedEndpoint) {
    // Validate endpoint
    if (validateURL(receivedEndpoint) === true) {
      setMessageEndpointStyle(okMessageStyle);
      setMessageEndpoint(okMessageEndpoint);
      // Set new custom endpoint
      setEndpoint(receivedEndpoint);
      localStorage.setItem("endpoint", receivedEndpoint);
    } else {
      // Show error and keep old endpoint
      setMessageEndpointStyle(errorMessageStyle);
      setMessageEndpoint(errorMessageEndpoint);
    }
  }

  function processData(receivedData) {
    processUrl(receivedData.url);
    processEndpoint(receivedData.endpoint);
  }

  function isCommonUrl(receivedUrl) {
    // The URL is one of the common endpoints...
    wikibaseURLs.forEach((baseUrl) => {
      if (baseUrl.data.url.localeCompare(receivedUrl) === 0) {
        setMessageUrlStyle(okMessageStyle);
        setMessageUrl(okMessageUrl);

        // Set new custom endpoint
        setUrl(baseUrl.data.url);
        localStorage.setItem("url", baseUrl.data.url);

        return true;
      }
    });
    return false;
  }

  function isCommonEndpoint(receivedEndpoint) {
    // The URL is one of the common endpoints...
    wikibaseURLs.forEach((baseUrl) => {
      if (baseUrl.data.endpoint.localeCompare(receivedEndpoint) === 0) {
        setMessageEndpointStyle(okMessageStyle);
        setMessageEndpoint(okMessageEndpoint);
        // Set new custom endpoint
        setEndpoint(baseUrl.data.endpoint);
        localStorage.setItem("endpoint", baseUrl.data.endpoint);
        return true;
      }
    });
    return false;
  }

  function isCommonData(receivedData) {
    return (
      isCommonUrl(receivedData.url) && isCommonEndpoint(receivedData.endpoint)
    );
  }

  function handleOnChangeUrl(e) {
    let url = e.target.value.trim();
    setUrl(url);
    if (!isCommonUrl(url)) {
      processUrl(url);
    }
  }

  function handleOnChangeEndpoint(e) {
    let endpoint = e.target.value.trim();
    setEndpoint(endpoint);
    if (!isCommonEndpoint(endpoint)) {
      processEndpoint(endpoint);
    }
  }

  function handleOnSelect(e) {
    let data = e.split(",");
    let url = data[0].trim();
    let endpoint = data[1].trim();
    setUrl(url);
    setEndpoint(endpoint);
    if (!isCommonData(e)) {
      processData({ url, endpoint });
    }
  }

  const dropDownItems = wikibaseURLs.map((entry, index) => (
    <Dropdown.Item
      key={index}
      eventKey={entry.data.url + "," + entry.data.endpoint}
    >
      {entry.name}
    </Dropdown.Item>
  ));

  return (
    <Container>
      <Form.Group>
        <Form.Label>Custom Wikibase URL</Form.Label>
        <Form.Control
          as="input"
          type="url"
          placeholder="https://..."
          value={url}
          onChange={handleOnChangeUrl}
        />
        <span style={messageUrlStyle}>{messageUrl}</span>
        <br />

        <Form.Label>Custom Wikibase SPARQL Endpoint</Form.Label>
        <Form.Control
          as="input"
          type="url"
          placeholder="https://..."
          value={endpoint}
          onChange={handleOnChangeEndpoint}
        />
        <span style={messageEndpointStyle}>{messageEndpoint}</span>

        <hr />
        <Dropdown onSelect={handleOnSelect}>
          <DropdownButton
            alignRight
            title="Common Wikibase Instances"
            id="select-endpoint"
          >
            {dropDownItems}
          </DropdownButton>
        </Dropdown>
      </Form.Group>
    </Container>
  );
}

ChangeWikibaseURL.propTypes = {
  wikibaseUrl: PropTypes.string,
  wikibaseEndpoint: PropTypes.string,
  handleOnChange: PropTypes.func,
};
export default ChangeWikibaseURL;
