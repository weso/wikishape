import PropTypes from "prop-types";
import React from "react";
import API from "../API";
import InputTabs from "../components/InputTabs";
import QueryForm from "./QueryForm";

function QueryTabs(props) {
  const queryForm = (
    <QueryForm
      onChange={props.handleByTextChange}
      value={props.textAreaValue}
      setCodeMirror={props.setCodeMirror}
      fromParams={props.fromParams}
      resetFromParams={props.resetFromParams}
      value={props.textAreaValue}
    />
  );

  return (
    <div>
      <InputTabs
        name={props.name}
        activeSource={props.activeSource}
        handleTabChange={props.handleTabChange}
        byTextName={props.subname}
        textAreaValue={props.textAreaValue}
        handleByTextChange={props.handleByTextChange}
        byTextPlaceholder={API.texts.placeholders.sparqlQuery}
        inputForm={queryForm}
        urlValue={props.urlValue}
        handleUrlChange={props.handleUrlChange}
        byUrlPlaceholder={API.texts.placeholders.url}
        handleFileUpload={props.handleFileUpload}
        fromParams={props.fromParams}
        resetFromParams={props.resetFromParams}
      />
    </div>
  );
}

QueryTabs.propTypes = {
  activeSource: PropTypes.string,
  textAreaValue: PropTypes.string,
  handleByTextChange: PropTypes.func.isRequired,
  urlValue: PropTypes.string,
  handleUrlChange: PropTypes.func.isRequired,
  handleFileUpload: PropTypes.func.isRequired,

  setCodeMirror: PropTypes.func.isRequired,

  /** Flag to signal if values come from Params */
  fromParams: PropTypes.bool.isRequired,

  /** Function to reset value of fromParams */
  resetFromParams: PropTypes.func.isRequired,
};

QueryTabs.defaultProps = {
  name: API.texts.dataTabs.queryHeader,
  subname: "",
  activeSource: API.sources.default,
};

export default QueryTabs;
