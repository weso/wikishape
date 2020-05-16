import React, {useState, useEffect} from 'react';
import PropTypes from "prop-types";
import {Typeahead, Token} from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead-bs4.min.css';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import SelectLanguage from "./SelectLanguage";
import { SchemaEntities } from "../resources/schemaEntities"
import InputGroup from "react-bootstrap/InputGroup";


const defaultLanguage = [{label: 'en', name:'English'}];

function InputSchemaEntityByText(props) {
    const [language,setLanguage] = useState(defaultLanguage);
    const [options, setOptions] = useState([]);

    useEffect(() => {
         console.log(`Changing language to ${JSON.stringify(language[0])}`)
         if (language[0]) {
             setOptions(optionsFromSchemaEntities(language[0].label))
         }
        },
        [language]
    );

    function optionsFromSchemaEntities(lang) {
        const ses = SchemaEntities.map(e => {
            const labels = e.labels
            let labelRecord = null ;
            if (lang && labels[lang]) {
                labelRecord = labels[lang]
            } else {
                labelRecord = labels['en']
            }
            return {
                id: e.id,
                label: labelRecord.label,
                descr: labelRecord.descr,
                conceptUri : e.conceptUri,
                webUri: e.webUri,
                lang: lang
            }
        });
        // console.log(`entities(${lang}: ${JSON.stringify(ses)}`)
        return ses
    }

    const MenuItem = ({item}) => (
        <div>
            <span>{item.id}</span><br/>
            <span>{item.label}</span><br/>
            <span><b>{item.descr}</b></span>
        </div>
    );

    function customRenderToken(option, props, index) {
        return (
            <Token
                key={index}
                onRemove={props.onRemove}>
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
                filterBy={['id','label','descr']}
                labelKey="label"
                options={options}
                maxResults = {10}
                minLength={2}
                renderToken={customRenderToken}
                placeholder="E.. or label"
                renderMenuItemChildren={(option, props) => (
                    <MenuItem key={option.id} item={option}/>
                )}
                useCache={false}
                selected={props.entities}
                onChange={(selected) => {
                    console.log(`Selected: ${JSON.stringify(selected)}`)
                    props.onChange(selected)
                }}
            />
            </Col>
            <Col>
                <InputGroup>
                  <InputGroup.Prepend>
                    <InputGroup.Text id="basic-addon1">Language</InputGroup.Text>
                  </InputGroup.Prepend>
                  <SelectLanguage id="SelectLanguage" language={[{label:'en', name: 'English'}]} onChange={setLanguage} />
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
