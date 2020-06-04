// import React from 'react';
import API from "../API";
import React from "react";
import {ExternalLinkIcon} from "react-open-iconic-svg";
import {Slide} from "react-toastify";

// const { Module, render } = require('viz.js/full.render.js');

/*
function *intersperse(a, delim) {
    let first = true;
    for (const x of a) {
        if (!first) yield delim;
        first = false;
        yield x;
    }
}*/

/*export function dot2svg(dot,cb) {
    console.log("### Dot2SVG!!!" + dot);
    const digraph = 'digraph { a -> b; }';
    const viz = new Viz({ Module, render });
    const opts = {engine: 'dot'};
    viz.renderSVGElement(digraph, opts).then(function(svg) {
      console.log("SVG converted!!");
      console.log(svg);
      cb(svg);
    });
}*/

const formatModes = {
    "html": "html",
    "json": "javascript",
    "rdf/json": "javascript",
    "rdf/xml": "xml",
    "shexc": "shex",
    "shexj": "javascript",
    "trig": "xml",
    "turtle": "turtle",
    "sparql": "sparql",
  };

const defaultMode = "xml";

export function mkMode(format) {
    let mode = format ? formatModes[format.toLowerCase()] || defaultMode: defaultMode;
    console.log(`mkMode(${format}) = ${mode}`);
    return mode; 
}

export function maybeAdd(maybe,name,obj) {
    if (maybe) obj[name] = maybe ;
    return obj;
}

export const notificationSettings = {
    permalinkText: 'Link copied to clipboard!',
    position: 'bottom-right',
    autoClose: 2500,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnFocusLoss: false,
    pauseOnHover: true,
    closeButton: false,
    transition: Slide,
    limit: 3
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
    // console.log(`node: ${JSON.stringify(node)}`)
    if (!node) {
        return {
            type: 'empty',
            prefix: '',
            localName: '',
            str: '',
            node: node
        }
    }
    const relativeBaseRegex = /^<internal:\/\/base\/(.*)>$/g;
    const matchBase = relativeBaseRegex.exec(node);
    if (matchBase) {
            const rawNode = matchBase[1];
            return {
                type: 'RelativeIRI',
                uri: rawNode,
                str: `<${rawNode}>`,
                prefix: '',
                localName: '',
                node: node
            }
    }
    if (node === "<http://www.w3.org/ns/shex#Start>") {
        return {
            type: 'RelativeIRI',
            uri: "http://www.w3.org/ns/shex#Start",
            str: `START`,
            prefix: '',
            localName: '',
            node: node
        }
    }
    const iriRegexp = /^<(.*)>$/g;
    const matchIri = iriRegexp.exec(node);
    if (matchIri) {
       const rawNode = matchIri[1];
       for (const key in prefixMap) {
          if (rawNode.startsWith(prefixMap[key])) {
               const localName = rawNode.slice(prefixMap[key].length);
                   return {
                    type: 'QualifiedName',
                    uri: rawNode,
                    prefix: key,
                    localName: localName,
                    str: `${key}:${localName}`,
                    node: node
                };
            }
                }
                return {
                    type: 'FullIRI',
                    uri: rawNode,
                    prefix: '',
                    localName: '',
                    str: `<${rawNode}>`,
                    node: node
                };
            }
     const datatypeLiteralRegex = /"(.*)"\^\^(.*)/g
     const matchDatatypeLiteral = datatypeLiteralRegex.exec(node);
     if (matchDatatypeLiteral) {
       const literal = matchDatatypeLiteral[1];
       const datatype = matchDatatypeLiteral[2];
       const datatypeQualified = showQualify(datatype, prefixMap);
       const datatypeElement = showQualified(datatypeQualified, prefixMap);
       return {
          type: 'DatatypeLiteral',
          prefix: '',
          localName: '',
          str: `"${literal}"`,
          datatype: datatype,
          datatypeElement: datatypeElement,
          node: node
       }
     }
     const langLiteralRegex = /"(.*)"@(.*)/g;
     const matchLangLiteral = langLiteralRegex.exec(node);
     if (matchLangLiteral) {
       const literal = matchLangLiteral[1];
       const lang = matchLangLiteral[2];
       return {
                    type: 'LangLiteral',
                    prefix: '',
                    localName: '',
                    str: `"${literal}"@${lang}`,
                    datatype: null,
                    node: node
                }
     }
    const intLiteralRegex = /^(-?[0-9]+(\.[0-9]+)?)$/g;
    const matchIntLiteral = intLiteralRegex.exec(node);
    if (matchIntLiteral) {
        return {
            type: 'IntLiteral',
            prefix: '',
            localName: '',
            str: node,
            datatype: null,
            node: node
        }
    }
     const literalRegex = /"(.*)"/g;
     const matchLiteral = literalRegex.exec(node);
     if (matchLiteral) return {
       type: 'Literal',
       prefix: '',
       localName: '',
       str: node,
       datatype: null,
       node: node
     };
     if (node.type === 'bnode') return {
      type: 'BNode',
      prefix: '',
      localName: node.value,
      str: `_:${node.value}`,
      node: node
     }
     if (node.isString && node.toUpperCase() === 'START') return {
      type: 'START',
      prefix: '',
      localName: '',
      str: ``,
      node: node
     }
     console.log(`ShowQualify: Unknown format for node: ${JSON.stringify(node)}`);
     return {
      type: 'Unknown',
      prefix: '',
      localName: '',
      str: node,
      datatype: null,
      node: node
  };
}

export function showQualified(qualified, prefixes) {
    // console.log(`showQualified ${JSON.stringify(qualified)}`)
    switch (qualified.type) {
        case 'RelativeIRI': return <span>{qualified.str}</span>;
        case 'QualifiedName':
            // console.log(`QualifiedName: ${qualified.prefix}`)
            if (prefixes[qualified.prefix]) {
                return <a target={'_blank'} href={qualified.uri}>{qualified.str} <ExternalLinkIcon /></a>
            } else {
                return <fragment>{qualified.str} <a href={qualified.uri}><ExternalLinkIcon/></a></fragment>
            }
        case 'FullIRI': return <a href={qualified.uri}>{qualified.str}</a>;
        case 'DatatypeLiteral' : return <span>{qualified.str}^^<a href={qualified.datatype}>&lt;{qualified.datatype}&gt;</a></span>;
        case 'Literal' : return <span>{qualified.str}</span>;
        case 'LangLiteral' : return <span>{qualified.str}</span>;
        case 'IntLiteral' : return <span>{qualified.str}</span>;
        case 'START' : return <span>{qualified.str}</span>;
        default:
            console.error(`Unknown type for qualified value ${qualified.str}`);
            return <span>{qualified.str}</span>
    }
}

/* Converts SPARQL representation to Turtle representation */
export function cnvValueFromSPARQL(value) {
    switch (value.type) {
        case 'uri': return `<${value.value}>`;
        case 'literal':
            if (value.datatype) {
                switch (value.datatype) {
                    case "http://www.w3.org/2001/XMLSchema#integer": return `${value.value}` ;
                    case "http://www.w3.org/2001/XMLSchema#decimal": return `${value.value}` ;
                    default: return `"${value.value}"^^${value.datatype}`;
                }
            }
            if (value['xml:lang']) return `"${value.value}"@${value['xml:lang']}`;
            return `"${value.value}"`;
        default:
            console.error(`cnvValueFromSPARQL: Unknown value type for ${value}`);
            return value
    }
}


export function dataParamsFromQueryParams(params) {
    let newParams = {};
    if (params.data) newParams["data"] = params.data ;
    if (params.dataFormat) newParams["dataFormat"] = params.dataFormat ;
    if (params.dataUrl) newParams["dataUrl"] = params.dataUrl ;
    return newParams;
}

export function shapeMapParamsFromQueryParams(params) {
    let newParams = {};
    if (params.shapeMap) newParams["shapeMap"] = params.shapeMap ;
    if (params.shapeMapFormat) newParams["shapeMapFormat"] = params.shapeMapFormat ;
    if (params.shapeMapUrl) newParams["shapeMapUrl"] = params.shapeMapUrl ;
    return newParams;
}

export function endpointParamsFromQueryParams(params) {
    let newParams = {};
    if (params.endpoint) newParams["endpoint"] = params.endpoint ;
    return newParams;
}

export function paramsFromStateData(state) {
    const activeTab = state.dataActiveTab;
    const dataTextArea = state.dataTextArea;
    const dataFormat = state.dataFormat;
    const dataUrl = state.dataUrl;
    const dataFile = state.dataFile;
    let params = {};
    params['activeTab'] = convertTabData(activeTab);
    params['dataFormat'] = dataFormat;
    switch (activeTab) {
        case API.byTextTab:
            params['data'] = dataTextArea;
            params['dataFormatTextArea']=dataFormat;
            break;
        case API.byUrlTab:
            params['dataURL'] = dataUrl;
            params['dataFormatUrl']=dataFormat;
            break;
        case API.byFileTab:
            params['dataFile'] = dataFile;
            params['dataFormatFile']=dataFormat;
            break;
        default:
    }
   return params;
}

export function paramsFromStateEndpoint(state) {
    let params = {};
    params['endpoint'] = state.endpoint;
    return params;
}


export function paramsFromStateShEx(state) {
    const activeTab = state.shExActiveTab;
    const textArea = state.shExTextArea;
    const format = state.shExFormat;
    const url = state.shExUrl;
    const file = state.shExFile;
    let params = {};
    params['activeSchemaTab'] = convertTabSchema(activeTab);
    params['schemaEmbedded'] = false;
    params['schemaFormat'] = format;
    switch (activeTab) {
        case API.byTextTab:
            params['schema'] = textArea;
            params['schemaFormatTextArea'] = format;
            break;
        case API.byUrlTab:
            params['schemaURL'] = url;
            params['schemaFormatUrl'] = format;
            break;
        case API.byFileTab:
            params['schemaFile'] = file;
            params['schemaFormatFile'] = format;
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
    params['shapeMapActiveTab'] = convertTabShapeMap(activeTab);
    params['shapeMapFormat'] = format;
    switch (activeTab) {
        case "byText":
            params['shapeMap'] = textArea;
            params['shapeMapFormatTextArea'] = format;
            break;
        case "byURL":
            params['shapeMapURL'] = url;
            params['shapeMapFormatURL'] = format;
            break;
        case "byFile":
            params['shapeMapFile'] = file;
            params['shapeMapFormatFile'] = format;
            break;
        default:
    }
    return params;
}

export function paramsFromStateQuery(state) {
    let params = {};
    let activeTab = state.queryActiveTab;
    params['activeTab'] = convertTabQuery(activeTab);
    switch (activeTab) {
        case "byText":
            params['query'] = state.queryTextArea;
            break;
        case "byURL":
            params['queryURL'] = state.queryUrl;
            break;
        case "byFile":
            params['queryFile'] = state.queryFile;
            break;
        default:
    }
    return params;
}

export function convertTabData(key) {
    switch (key) {
        case API.byTextTab: return "#dataTextArea";
        case API.byFileTab: return "#dataFile";
        case API.byUrlTab: return "#dataUrl";
        default: console.log("Unknown schemaTab: " + key);
            return key
    }
}

export function convertTabSchema(key) {
    switch (key) {
        case API.byTextTab: return "#schemaTextArea";
        case API.byFileTab: return "#schemaFile";
        case API.byUrlTab: return "#schemaUrl";
        default: console.log("Unknown schemaTab: " + key);
            return key
    }
}

export function convertTabShapeMap(key) {
    switch (key) {
        case API.byTextTab: return "#shapeMapTextArea";
        case API.byFileTab: return "#shapeMapFile";
        case API.byUrlTab: return "#shapeMapUrl";
        default:
            console.log("Unknown schemaTab: " + key);
            return key
    }
}

export function convertTabQuery(key) {
    switch (key) {
        case API.byTextTab: return "#queryTextArea";
        case API.byFileTab: return "#queryFile";
        case API.byUrlTab: return "#queryUrl";
        default:
            console.log("Unknown schemaTab: " + key);
            return key
    }
}

export function format2mode(format) {
    if (format) {
        switch (format.toUpperCase()) {
            case "TURTLE":
                return "turtle";
            case "RDF/XML":
                return 'xml';
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
                return "turtle"
        }
    } else return "turtle"
}

const regexUrl = new RegExp("^(https?:\\/\\/)?"+ // protocol
    "((((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,})|localhost)|"+ // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))"+ // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*"+ // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?"+ // query string
    "(\\#[-a-z\\d_]*)?$","i");

export function validateURL (receivedUrl) {
    return !!regexUrl.test(receivedUrl);
}
