import React, {useState, useEffect} from 'react';
import PropTypes from "prop-types";
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead-bs4.min.css';
import Form from 'react-bootstrap/Form';
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";


function ChangeWikibaseURL(props) {
    const wikibaseURLs = [
        {name: "wikidata", url: API.wikidataUrl },
        {name: "local (default)", url: API.localWikibaseUrl },
    ];

    const dropDownItems = wikibaseURLs.map((entry,index) =>
        <Dropdown.Item key={index} eventKey={entry.url}>{entry.name}</Dropdown.Item>
    );

    return (
        <Form.Group>
            <Form.Label>Wikibase URL</Form.Label>
            <Form.Control as="input"
                          type="url"
                          placeholder="http://..."
                          value={props.wikibaseUrl}
                          onChange={handleOnChange}
            />
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
    handleOnChange: PropTypes.func.isRequired,
};

export default SelectLanguage;
