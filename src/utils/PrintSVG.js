import PropTypes from "prop-types";
import React from "react";

function mkInner(inner) {
  return { __html: inner };
}

const PrintSVG = React.memo(({ svg }) => (
  <div className="visualization" dangerouslySetInnerHTML={mkInner(svg)} />
));

PrintSVG.propTypes = {
  svg: PropTypes.string.isRequired,
};

export default PrintSVG;
