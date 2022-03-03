import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Token, Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead-bs4.min.css";
import "react-bootstrap-typeahead/css/Typeahead.css";
import API from "../API";
import axios from "../utils/networking/axiosConfig";

const defaultLanguage = { label: "en", name: "English" };

function SelectLanguage(props) {
  const [options, setOptions] = useState([]);
  const [language, setLanguage] = useState(props.language);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { result: languages },
      } = await axios.post(API.routes.server.wikibaseLanguages, {
        [API.queryParameters.wikibase.endpoint]: API.currentUrl(),
        [API.queryParameters.wikibase.payload]: "langs", // need a dummy payload
      });
      setOptions(languages);
    };
    fetchData();
  }, [props.language]);

  const MenuItemLang = ({ item }) => (
    <div>
      <span>{item.label}</span>{" "}
      <span>
        <b>{item.name}</b>
      </span>
    </div>
  );

  function customRenderToken(option, props, index) {
    return (
      <Token key={index} onRemove={props.onRemove}>
        {`${option.label} (${option.name})`}
      </Token>
    );
  }

  return (
    <Typeahead
      id="SelectLanguage"
      options={options}
      renderToken={customRenderToken}
      placeholder="Language"
      renderMenuItemChildren={(option, props) => (
        <MenuItemLang key={option.id} item={option} />
      )}
      defaultSelected={[defaultLanguage]}
      selected={language}
      onChange={(lang) => {
        props.onChange(lang);
        setLanguage(lang);
      }}
    />
  );
}

SelectLanguage.propTypes = {
  language: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};

export default SelectLanguage;
