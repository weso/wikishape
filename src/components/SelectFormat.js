import React, {useState, useEffect} from 'react';
import Form from "react-bootstrap/Form";
import axios from 'axios';
import PropTypes from "prop-types";

function SelectFormat(props) {
    const [formats,setFormats] = useState([]);
    const [format,setFormat] = useState(props.selectedFormat);


    useEffect(() => {
        const url = props.urlFormats;
        axios.get(url, {
            headers: { 'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            }}).then(response => response.data)
            .then((data) => {
                setFormats(data)
                console.log(`Formats: ${formats}`)
            })
    }, [props.urlFormats]);

    function handleFormatChange(e) {
        setFormat(e.target.value)
        props.handleFormatChange(e.target.value);
    }

    return (
            <Form.Group>
            <Form.Label>{props.name}</Form.Label>
            <Form.Control as="select" onChange={handleFormatChange}>
                { formats.map((f,key) => (
                    <option key={key} defaultValue={f === format}>{f}</option>
                ))
            }
            </Form.Control>
            </Form.Group>
    )
}

SelectFormat.propTypes = {
    name: PropTypes.string.isRequired,
    selectedFormat: PropTypes.string,
    handleFormatChange: PropTypes.func.isRequired,
    urlFormats: PropTypes.string.isRequired,
};


export default SelectFormat;
