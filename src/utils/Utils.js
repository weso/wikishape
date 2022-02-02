// import React from 'react';
import React from "react";
import { ExternalLinkIcon } from "react-open-iconic-svg";
import { Slide } from "react-toastify";
import API from "../API";

const formatModes = {
  html: "html",
  json: "javascript",
  "rdf/json": "javascript",
  "rdf/xml": "xml",
  shexc: "shex",
  shexj: "javascript",
  trig: "xml",
  turtle: "turtle",
  sparql: "sparql",
};

const defaultMode = "xml";

export function mkMode(format) {
  let mode = format
    ? formatModes[format.toLowerCase()] || defaultMode
    : defaultMode;
  return mode;
}

export function maybeAdd(maybe, name, obj) {
  if (maybe) obj[name] = maybe;
  return obj;
}

export const notificationSettings = {
  permalinkText: "Link copied to clipboard!",
  position: "bottom-right",
  autoClose: 2500,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnFocusLoss: false,
  pauseOnHover: true,
  closeButton: false,
  transition: Slide,
  limit: 1,
};

export function copyToClipboard(text) {
  // Create a dummy input to copy the link from it
  const dummy = document.createElement("input");

  // Add to document
  document.body.appendChild(dummy);
  dummy.setAttribute("id", "dummy_id");

  // Output the link into it
  document.getElementById("dummy_id").value = text;

  // Select it
  dummy.select();

  // Copy its contents
  document.execCommand("copy");

  // Remove it as its not needed anymore
  document.body.removeChild(dummy);
}

// export const internalPrefixes = ["prn", "prv", "pqv", "pq", "pr", "psn", "psv", "ps", "wdata", "wdno", "wdref", "wds", "wdt", "wdtn", "wdv", "wd", "p"];

/**
 * Converts Turtle representation of values to a structure
 * @param node
 * @param prefixMap
 * @returns {{str: string,
    localName: string: Local name,
    node: *,
    prefix: string,
    type: string,
    uri: any
 }}
 */
export function showQualify(node, prefixMap) {
  if (!node) {
    return {
      type: "empty",
      prefix: "",
      localName: "",
      str: "",
      node: node,
    };
  }
  const relativeBaseRegex = /^<internal:\/\/base\/(.*)>$/g;
  const matchBase = relativeBaseRegex.exec(node);
  if (matchBase) {
    const rawNode = matchBase[1];
    return {
      type: "RelativeIRI",
      uri: rawNode,
      str: `<${rawNode}>`,
      prefix: "",
      localName: "",
      node: node,
    };
  }
  if (node === "<http://www.w3.org/ns/shex#Start>") {
    return {
      type: "RelativeIRI",
      uri: "http://www.w3.org/ns/shex#Start",
      str: `START`,
      prefix: "",
      localName: "",
      node: node,
    };
  }
  const iriRegexp = /^<(.*)>$/g;
  const matchIri = iriRegexp.exec(node);
  if (matchIri) {
    const rawNode = matchIri[1];
    for (const key in prefixMap) {
      if (rawNode.startsWith(prefixMap[key])) {
        const localName = rawNode.slice(prefixMap[key].length);
        return {
          type: "QualifiedName",
          uri: rawNode,
          prefix: key,
          localName: localName,
          str: `${key}:${localName}`,
          node: node,
        };
      }
    }
    return {
      type: "FullIRI",
      uri: rawNode,
      prefix: "",
      localName: "",
      str: `<${rawNode.split("/").slice(-1)[0]}>`,
      node: node,
    };
  }
  const datatypeLiteralRegex = /"(.*)"\^\^(.*)/g;
  const matchDatatypeLiteral = datatypeLiteralRegex.exec(node);
  if (matchDatatypeLiteral) {
    const literal = matchDatatypeLiteral[1];
    const datatype = matchDatatypeLiteral[2];
    const datatypeQualified = showQualify(datatype, prefixMap);
    const datatypeElement = showQualified(datatypeQualified, prefixMap);
    return {
      type: "DatatypeLiteral",
      prefix: "",
      localName: "",
      str: `"${literal}"`,
      datatype: datatype,
      datatypeElement: datatypeElement,
      node: node,
    };
  }
  const langLiteralRegex = /"(.*)"@(.*)/g;
  const matchLangLiteral = langLiteralRegex.exec(node);
  if (matchLangLiteral) {
    const literal = matchLangLiteral[1];
    const lang = matchLangLiteral[2];
    return {
      type: "LangLiteral",
      prefix: "",
      localName: "",
      str: `"${literal}"@${lang}`,
      datatype: null,
      node: node,
    };
  }
  const intLiteralRegex = /^(-?[0-9]+(\.[0-9]+)?)$/g;
  const matchIntLiteral = intLiteralRegex.exec(node);
  if (matchIntLiteral) {
    return {
      type: "IntLiteral",
      prefix: "",
      localName: "",
      str: node,
      datatype: null,
      node: node,
    };
  }
  const literalRegex = /"(.*)"/g;
  const matchLiteral = literalRegex.exec(node);
  if (matchLiteral)
    return {
      type: "Literal",
      prefix: "",
      localName: "",
      str: node,
      datatype: null,
      node: node,
    };
  if (node.type === "bnode")
    return {
      type: "BNode",
      prefix: "",
      localName: node.value,
      str: `_:${node.value}`,
      node: node,
    };
  if (node.isString && node.toUpperCase() === "START")
    return {
      type: "START",
      prefix: "",
      localName: "",
      str: ``,
      node: node,
    };
  return {
    type: "Unknown",
    prefix: "",
    localName: "",
    str: node,
    datatype: null,
    node: node,
  };
}

export function showQualified(qualified, prefixes) {
  switch (qualified.type) {
    case "RelativeIRI":
      return <span>{qualified.str}</span>;
    case "QualifiedName":
      if (prefixes[qualified.prefix]) {
        return (
          <a target="_blank" rel="noopener noreferrer" href={qualified.uri}>
            {qualified.str} <ExternalLinkIcon />
          </a>
        );
      } else {
        return (
          <fragment>
            {qualified.str}{" "}
            <a href={qualified.uri}>
              <ExternalLinkIcon />
            </a>
          </fragment>
        );
      }
    case "FullIRI":
      return <a href={qualified.uri}>{qualified.str}</a>;
    case "DatatypeLiteral":
      return (
        <span>
          {qualified.str}^^
          <a href={qualified.datatype}>&lt;{qualified.datatype}&gt;</a>
        </span>
      );
    case "Literal":
      return <span>{qualified.str}</span>;
    case "LangLiteral":
      return <span>{qualified.str}</span>;
    case "IntLiteral":
      return <span>{qualified.str}</span>;
    case "START":
      return <span>{qualified.str}</span>;
    default:
      console.error(`Unknown type for qualified value ${qualified.str}`);
      return <span>{qualified.str}</span>;
  }
}

// Given a string, remove the specified characters and return it
export function sanitizeQualify(name, badChars = ["<", ">", "#"]) {
  const nameChars = Array.from(name);
  return nameChars.filter((char) => !badChars.includes(char)).join("");
}

/* Converts SPARQL representation to Turtle representation */
export function cnvValueFromSPARQL(value) {
  switch (value.type) {
    case "uri":
      return `<${value.value}>`;
    case "literal":
      if (value.datatype) {
        switch (value.datatype) {
          case "http://www.w3.org/2001/XMLSchema#integer":
            return `${value.value}`;
          case "http://www.w3.org/2001/XMLSchema#decimal":
            return `${value.value}`;
          default:
            return `"${value.value}"^^${value.datatype}`;
        }
      }
      if (value["xml:lang"]) return `"${value.value}"@${value["xml:lang"]}`;
      return `"${value.value}"`;
    default:
      console.error(`cnvValueFromSPARQL: Unknown value type for ${value}`);
      return value;
  }
}

export function dataParamsFromQueryParams(params) {
  let newParams = {};
  if (params.data) newParams["data"] = params.data;
  if (params.dataFormat) newParams["dataFormat"] = params.dataFormat;
  if (params.dataUrl) newParams["dataUrl"] = params.dataUrl;
  return newParams;
}

export function shapeMapParamsFromQueryParams(params) {
  let newParams = {};
  if (params.shapeMap) newParams["shapeMap"] = params.shapeMap;
  if (params.shapeMapFormat)
    newParams["shapeMapFormat"] = params.shapeMapFormat;
  if (params.shapeMapUrl) newParams["shapeMapUrl"] = params.shapeMapUrl;
  return newParams;
}

export function endpointParamsFromQueryParams(params) {
  let newParams = {};
  if (params.endpoint) newParams["endpoint"] = params.endpoint;
  return newParams;
}

export function paramsFromStateData(state) {
  const activeTab = state.dataActiveTab;
  const dataTextArea = state.dataTextArea;
  const dataFormat = state.dataFormat;
  const dataUrl = state.dataUrl;
  const dataFile = state.dataFile;
  let params = {};
  params["activeTab"] = convertTabData(activeTab);
  params["dataFormat"] = dataFormat;
  switch (activeTab) {
    case API.byTextTab:
      params["data"] = dataTextArea;
      params["dataFormatTextArea"] = dataFormat;
      break;
    case API.byUrlTab:
      params["dataUrl"] = dataUrl;
      params["dataFormatUrl"] = dataFormat;
      break;
    case API.byFileTab:
      params["dataFile"] = dataFile;
      params["dataFormatFile"] = dataFormat;
      break;
    default:
  }
  return params;
}

export function paramsFromStateEndpoint(state) {
  let params = {};
  params["endpoint"] = state.endpoint;
  return params;
}

export function paramsFromStateShEx(state) {
  const activeTab = state.shExActiveTab;
  const textArea = state.shExTextArea;
  const format = state.shExFormat;
  const url = state.shExUrl;
  const file = state.shExFile;
  let params = {};
  params["activeSchemaTab"] = convertTabSchema(activeTab);
  params["schemaEmbedded"] = false;
  params["schemaFormat"] = format;
  switch (activeTab) {
    case API.byTextTab:
      params["schema"] = textArea;
      params["schemaFormatTextArea"] = format;
      break;
    case API.byUrlTab:
      params["schemaUrl"] = url;
      params["schemaFormatUrl"] = format;
      break;
    case API.byFileTab:
      params["schemaFile"] = file;
      params["schemaFormatFile"] = format;
      break;
    default:
  }
  return params;
}

export function paramsFromStateShapeMap(state) {
  const activeTab = state.shapeMapActiveTab;
  const textArea = state.shapeMapTextArea;
  const format = state.shapeMapFormat;
  const url = state.shapeMapUrl;
  const file = state.shapeMapFile;
  let params = {};
  params["shapeMapActiveTab"] = convertTabShapeMap(activeTab);
  params["shapeMapFormat"] = format;
  switch (activeTab) {
    case "byText":
      params["shapeMap"] = textArea;
      params["shapeMapFormatTextArea"] = format;
      break;
    case "byURL":
      params["shapeMapUrl"] = url;
      params["shapeMapFormatURL"] = format;
      break;
    case "byFile":
      params["shapeMapFile"] = file;
      params["shapeMapFormatFile"] = format;
      break;
    default:
  }
  return params;
}

export function paramsFromStateQuery(state) {
  let params = {};
  let activeTab = state.queryActiveTab;
  params["activeTab"] = convertTabQuery(activeTab);
  switch (activeTab) {
    case "byText":
      params["query"] = state.queryTextArea;
      break;
    case "byURL":
      params["queryUrl"] = state.queryUrl;
      break;
    case "byFile":
      params["queryFile"] = state.queryFile;
      break;
    default:
  }
  return params;
}

export function convertTabData(key) {
  switch (key) {
    case API.byTextTab:
      return "#dataTextArea";
    case API.byFileTab:
      return "#dataFile";
    case API.byUrlTab:
      return "#dataUrl";
    default:
      return key;
  }
}

export function convertTabSchema(key) {
  switch (key) {
    case API.byTextTab:
      return "#schemaTextArea";
    case API.byFileTab:
      return "#schemaFile";
    case API.byUrlTab:
      return "#schemaUrl";
    default:
      return key;
  }
}

export function convertTabShapeMap(key) {
  switch (key) {
    case API.byTextTab:
      return "#shapeMapTextArea";
    case API.byFileTab:
      return "#shapeMapFile";
    case API.byUrlTab:
      return "#shapeMapUrl";
    default:
      return key;
  }
}

export function convertTabQuery(key) {
  switch (key) {
    case API.byTextTab:
      return "#queryTextArea";
    case API.byFileTab:
      return "#queryFile";
    case API.byUrlTab:
      return "#queryUrl";
    default:
      return key;
  }
}

export function format2mode(format) {
  if (format) {
    switch (format.toUpperCase()) {
      case "TURTLE":
        return "turtle";
      case "RDF/XML":
        return "xml";
      case "SPARQL":
        return "sparql";
      case "HTML":
        return "xml";
      case "JSON-LD":
        return "javascript";
      case "RDF/JSON":
        return "javascript";
      case "TRIG":
        return "xml";
      case "SHEXC":
        return "shex";
      default:
        return "turtle";
    }
  } else return "turtle";
}

const regexUrl = new RegExp(
  "^(https?:\\/\\/)?" + // protocol
  "((((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,})|localhost)|" + // domain name
  "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
  "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
  "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
    "(\\#[-a-z\\d_]*)?$",
  "i"
);

export function validateURL(receivedUrl) {
  return !!regexUrl.test(receivedUrl);
}

export const equalsIgnoreCase = (str1, str2, exact = false) => {
  return exact
    ? str1.toLowerCase() === str2.toLowerCase()
    : str1.toLowerCase() == str2.toLowerCase();
};

// Shortcut to all the settings that must be included in a Yashe object to prevent buttons
export const yasheNoButtonsOptions = {
  showTooltip: false,
  showUploadButton: false,
  showDownloadButton: false,
  showCopyButton: false,
  showDeleteButton: false,
  showShareButton: false,
  showThemeButton: false,
  showFullScreenButton: false,
};

// Shortcut to all the settings that must be included in a Yashe object to show minimal buttons
export const yasheMinButtonsOptions = {
  showUploadButton: false,
  showDeleteButton: false,
  showShareButton: false,
  showThemeButton: false,

  showTooltip: true,
  showDownloadButton: true,
  showCopyButton: true,
  showFullScreenButton: true,
};

// Function generating the symbol for ordering data in a table
export const sortCaretGen = (order) => (
  <button className="discrete">{order === "desc" ? "↓" : "↑"}</button>
);
// Prefixes for prefix map tables
export const prefixMapTableColumns = [
  {
    dataField: "prefixName",
    text: "Name",
    sort: true,
    sortCaret: sortCaretGen,
  },
  {
    dataField: "prefixIRI",
    text: "IRI",
  },
];

// Function for reading Files from the client and extracting their text contents
export const getFileContents = async (file) =>
  await new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.readAsText(file);
  });

// Zoom limits for non-cyto visualizations, whose zoom is controlled with CSS
export const visualizationMinZoom = 0.2;
export const visualizationMaxZoom = 1.9;
export const visualizationStepZoom = 0.1;
