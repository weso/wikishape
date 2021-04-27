import PropTypes from "prop-types";
import React from "react";
import Alert from "react-bootstrap/Form";
import PrintJson from "../utils/PrintJson";

function ResultShExInfo(props) {
  const result = props.result;
  const variant = result.wellFormed ? "success" : "danger";
  const msgAlert = result.wellFormed ? "Well formed" : "Not well formed";
  const errors = null; //result.errors.map((err,key) => { <li>{err}</li> } );

  return (
    <div>
      <Alert variant={variant}>
        {msgAlert}:<ul>{errors}</ul>
      </Alert>
      <details>
        <PrintJson json={result} />
      </details>
    </div>
  );
}

ResultShExInfo.propTypes = {
  result: PropTypes.object,
};

export default ResultShExInfo;
