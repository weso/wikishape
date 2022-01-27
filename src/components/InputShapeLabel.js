import PropTypes from "prop-types";
import React from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

function InputShapeLabel(props) {
  return (
    <div>
      <InputGroup className="mb-3">
        <InputGroup.Prepend>
          <InputGroup.Text id="shapeLabel">Shape</InputGroup.Text>
        </InputGroup.Prepend>
        <Form.Control
          as="select"
          aria-label="Shape"
          aria-describedby="shapeLabel"
          defaultValue={props.value}
          onChange={(e) => {
            props.onChange(e.target.value);
          }}
        >
          {props.shapeList.map((shape, idx) => (
            <option key={idx}>{shape}</option>
          ))}
        </Form.Control>
      </InputGroup>
    </div>
  );
}

InputShapeLabel.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  shapeList: PropTypes.array.isRequired,
};

InputShapeLabel.defaultProps = {};

export default InputShapeLabel;
