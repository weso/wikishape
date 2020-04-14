import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import PropTypes from "prop-types";

function InputShapeLabel(props) {

    return (
        <div>
           <InputGroup className="mb-3">
                <InputGroup.Prepend>
                    <InputGroup.Text id="shapeLabel">Shape</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control as="select"
                              aria-label="Shape"
                              aria-describedby="shapeLabel"
                              defaultValue={props.value}
                              onChange={(e) => {
                                  console.log(`InputShapeLabel change...${JSON.stringify(e.target.value)}`)
                                  props.onChange(e.target.value)
                              }} >
                    { props.shapeList.map((shape,idx) =>
                      <option key={idx}>{shape}</option>
                    )}
                </Form.Control>
            </InputGroup>
        </div>
    );
}

InputShapeLabel.propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
    shapeList: PropTypes.array.isRequired
};

InputShapeLabel.defaultProps = {
};

export default InputShapeLabel;
