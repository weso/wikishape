import React, {useContext, useState} from 'react';
import PropTypes from "prop-types";
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead-bs4.min.css';
import Form from 'react-bootstrap/Form';
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import API from "./API";
import Spinner from "react-bootstrap/Spinner";

function ChangeWikibaseURL(props) {

    const [url, setUrl] = useState(window.name || API.wikidataUrl);
    const [spinnerStyle, setSpinnerStyle] = useState(
        {
        display: "none"
        }
    );

    const okMessage = "Valid endpoint URL. Endpoint updated.";
    const errorMessage = "Invalid endpoint URL.";

    const [message, setMessage] = useState(okMessage);

    const okMessageStyle = {
        display: "inline",
        color: "green"
    };

    const errorMessageStyle = {
        display: "inline",
        color: "red"
    };

    const [messageStyle, setMessageStyle] = useState({
        display: "none",
    });

    const wikibaseURLs = [
        {name: "wikidata", url: API.wikidataUrl },
        {name: "local (default)", url: API.localWikibaseUrl },
    ];

    const regexUrl = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,})|localhost)|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i');

    function validateURL (receivedUrl) {
        return !!regexUrl.test(receivedUrl);
    }

    function processUrl (receivedUrl) {


        // Set spinner
        setSpinnerStyle({
            display: "inline-block"
        });

        // Validate url
        if (validateURL(receivedUrl) === true) {
            setMessageStyle(okMessageStyle);
            setMessage(okMessage);
            // Set new custom endpoint
            setUrl(receivedUrl);
            window.name = receivedUrl;
        } else {
            // Show error and keep old endpoint
            setMessageStyle(errorMessageStyle);
            setMessage(errorMessage);
        }
        setSpinnerStyle({
            display: "none"
        });
    }

    function isCommonUrl (receivedUrl) {
        // The URL is one of the common endpoints...
        wikibaseURLs.forEach( baseUrl => {
            if (baseUrl.url.localeCompare(receivedUrl) === 0){
                setMessageStyle(okMessageStyle);
                setMessage(okMessage);
                // Set new custom endpoint
                setUrl(baseUrl.url);
                window.name = baseUrl.url;
                return true;
            }
        });
        return false;
    }

    function handleOnChange(e) {
        let endpoint = e.target.value.trim();
        setUrl(endpoint);
        if (!isCommonUrl(endpoint))
            processUrl(endpoint);

    }

    function handleOnSelect(e) {
        let endpoint = e.trim();
        setUrl(endpoint);
        if (!isCommonUrl(endpoint))
            processUrl(endpoint);
    }

    const dropDownItems = wikibaseURLs.map((entry,index) =>
        <Dropdown.Item key={index} eventKey={entry.url}>{entry.name}</Dropdown.Item>
    );

    return (
        <Form.Group>
            <Form.Label>Custom Wikibase URL</Form.Label>
            <Form.Control as="input"
                          type="url"
                          placeholder="http://..."
                          value={url}
                          onChange={handleOnChange}
            />
            <Spinner animation="border" variant="primary" style={spinnerStyle} />
            <span style={messageStyle}>{message}</span>
            <Dropdown onSelect={handleOnSelect}>
                <DropdownButton alignRight
                                title="Common Wikibase URLs"
                                id="select-endpoint"
                >
                    {dropDownItems}
                </DropdownButton>
            </Dropdown>
        </Form.Group>

    );
}

ChangeWikibaseURL.propTypes = {
    wikibaseUrl: PropTypes.string,
    handleOnChange: PropTypes.func,
};
export default ChangeWikibaseURL;
