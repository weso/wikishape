import React from "react";
import { rootApi } from "./utils/networking/axiosConfig";
class API {
  // Information sources / tabs
  static sources = {
    byText: "byText",
    byUrl: "byUrl",
    byFile: "byFile",
    bySchema: "bySchema",

    default: "byText",
  };

  static tabs = {
    xmi: "XMI",
    uml: "UML",
    shex: "ShEx",
    text: "text",
    prefixMap: "prefixMap",

    visualization: "visualization",
    visualizations: "visualizations",
    visualizationDot: "dot",
    visualizationCyto: "cyto",

    shaclValidationReportText: "shaclReportText",
    shaclValidationReportNodes: "shaclReportNodes",

    wdSchema: "bySchema",
    shexSchema: "byShex",
  };

  // Formats (most formats come from server but we need defaults for data initialization)
  static formats = {
    turtle: "turtle",
    triG: "TriG",
    compact: "Compact",
    shexc: "ShExC",
    shexj: "ShExJ",
    sparql: "SPARQL",
    xml: "XML",
    rdfXml: "RDF/XML",
    rdfJson: "RDF/JSON",
    svg: "SVG",
    png: "PNG",
    html: "HTML",
    htmlMicrodata: "html-microdata",
    htmlRdf: "html-rdfa11",
    json: "JSON",
    jsonld: "JSON-LD",
    dot: "DOT",
    ps: "PS",
    uml: "UML",
    txt: "txt",

    defaultData: "turtle",
    defaultShex: "ShExC",
    defaultShacl: "turtle",
    defaultShapeMap: "Compact",
    defaultQuery: "SPARQL",
    defaultGraphical: "SVG",
  };

  // Mime types
  static mimeTypes = {
    shex: "text/shex",
    svg: "image/svg+xml",
    png: "image/png",
  };

  // Inferences
  static inferences = {
    default: "None",

    none: "None",
  };

  // Engines
  static engines = {
    default: "ShEx",
    defaultShex: "ShEx",
    defaultShacl: "SHACLex",

    shex: "ShEx",
    shaclex: "SHACLex",
    jenaShacl: "JenaSHACL",
    shacl_tq: "SHACL_TQ",
    xml: "xml",
  };

  // Trigger modes
  static triggerModes = {
    default: "ShapeMap",

    shapeMap: "ShapeMap",
    targetDecls: "TargetDecls",
  };

  // Prop names
  static propNames = {
    useShexer: "useShexer",
    // Wikibase entity types
    wbEntityTypes: {
      propName: "wbEntityType",

      item: "item",
      property: "property",
      lexeme: "lexeme",
    },
  };

  static routes = {
    server: {
      root: rootApi,
      health: "health",

      dataInfo: "data/info",
      dataConvert: "data/convert",
      dataQuery: "data/query",
      dataExtract: "data/extract",
      dataFormatsInput: "data/formats/input",
      dataFormatsOutput: "data/formats/output",
      dataVisualFormats: "data/formats/visual",
      dataOutgoing: "endpoint/outgoing",

      schemaInfo: "schema/info",
      schemaConvert: "schema/convert",
      schemaValidate: "schema/validate",
      shExFormats: `schema/formats/${this.engines.shex}`,
      shaclFormats: `schema/formats/${this.engines.shaclex}`,
      schemaShaclEngines: `schema/engines/${this.engines.shacl}`,

      shapeMapInfo: "shapemap/info",
      shapeMapFormats: "shapemap/formats",

      endpointInfo: "endpoint/info",
      endpointQuery: "endpoint/query",

      inferenceEngines: "data/inferenceEngines",

      serverPermalinkEndpoint: "permalink/generate",
      serverOriginalLinkEndpoint: "permalink/get",
      fetchUrl: "fetch",

      wikidataEntityLabel: "wikibase/entityLabel",
      wikibaseSearchEntity: "wikibase/search/item",
      wikibaseSearchProperty: "wikibase/search/property",
      wikibaseSearchLexeme: "wikibase/search/lexeme",
      wikibaseSchemaContent: "wikibase/schemaContent",
      wikibaseValidate: "wikibase/validate",
      wikibaseQuery: "wikibase/query",
      wikibaseExtract: "wikibase/extract",
      wikibaseExtractShexer: "wikibase/shexer",
      wikibaseLanguages: "wikibase/languages",
    },
    client: {
      wikibaseItem: "/item",
      wikibasePropertyInfo: "/property",
      wikibaseSchemaInfo: "/schema",

      wikibaseQuery: "/query",

      wikibaseValidate: "/validate",
      wikibaseValidateSparql: "/validateSparql",

      wikibaseExtract: "/extract",
      wikibaseSheXer: "/shexer",
      changeWikibaseInputUrl: "/wikibaseUrl",
      about: "/about",
      permalink: "/link/:urlCode",

      visualizeRawRoute: "/visualize",
    },
    // Other useful routes
    utils: {
      apiDocs: "https://app.swaggerhub.com/apis/weso/RDFShape",
      projectSite: "https://www.weso.es/rdfshape-api/",
      rdfShapeClient: "https://rdfshape.weso.es/",
      wikidataUrl: "https://query.wikidata.org/sparql",
      wikidataBase: "https://www.wikidata.org/",
      dbpediaUrl: "https://dbpedia.org/sparql",
      dbpediaBase: "https://dbpedia.org/",
      shapeFormHelpUrl:
        "https://github.com/weso/shapeForms#requirementslimitations",

      wikibase: "https://wikiba.se/",
      shexerRepo: "https://github.com/DaniFdezAlvarez/shexer",
    },
  };

  // By text limitations
  static limits = {
    byTextCharacterLimit: 2200,
  };

  // URLs and Endpoints

  static currentEndpoint = () =>
    localStorage.getItem("endpoint") || API.wikidataContact.endpoint;
  static currentUrl = () =>
    localStorage.getItem("url") || API.wikidataContact.url;

  static serverPermalinkEndpoint = API.rootApi + "permalink/generate";
  static serverOriginalLinkEndpoint = API.rootApi + "permalink/get";
  static fetchUrl = API.rootApi + "fetch";

  static wikidataSparqlUrl = "https://query.wikidata.org/sparql";
  // static wikidataUrlFetch =  "https://www.wikidata.org/sparql";

  static dbpediaSparqlUrl = "http://dbpedia.org/sparql";
  static localWikibaseUrl =
    "http://localhost:8282/proxy/wdqs/bigdata/namespace/wdq/sparql";

  static wikidataContact = {
    url: "https://www.wikidata.org",
    endpoint: "https://query.wikidata.org/sparql",
  };

  static exampleWikibaseContact = {
    url: "https://cursoslabra.wiki.opencura.com",
    endpoint: "https://cursoslabra.wiki.opencura.com/query/sparql",
  };

  static localWikibaseContact = {
    url: "http://localhost:8181",
    endpoint: "http://localhost:8282/proxy/wdqs/bigdata/namespace/wdq/sparql",
  };

  // Dictionary with the names used for query parameters
  // Centralized point to change them and keep them in sync with what the server expects
  static queryParameters = {
    data: {
      data: "data",
      source: "dataSource",
      format: "dataFormat",
      targetFormat: "dataTargetFormat",
      inference: "dataInference",
      compound: "dataCompound",
      nodeSelector: "nodeSelector",
      layout: "dataLayout", // Client only
    },

    schema: {
      schema: "schema",
      source: "schemaSource",
      format: "schemaFormat",
      engine: "schemaEngine",
      inference: "schemaInference",
      targetFormat: "schemaTargetFormat",
      targetEngine: "schemaTargetEngine",
      triggerMode: "triggerMode",
      label: "schemaLabel",
    },
    shapeMap: {
      shapeMap: "shapeMap",
      source: "shapeMapSource",
      format: "shapeMapFormat",
    },
    query: {
      query: "query",
      source: "querySource",
    },
    extraction: {
      endpoint: "endpoint",
      nodeSelector: "nodeSelector",
    },
    endpointP: {
      endpoint: "endpoint",
    },
    uml: {
      uml: "uml",
      source: "umlSource",
      format: "umlFormat",
    },
    permalink: {
      code: "urlCode",
    },
    visualization: {
      type: "vType",
      target: "vTarget",

      types: {
        data: "data",
        shex: "shex",
        shacl: "shacl",
        uml: "uml",
      },
      targets: {
        svg: "svg",
        cyto: "cyto",
      },
    },
    wikibase: {
      payload: "payload",
      endpoint: "endpoint",
      language: "language",
      languages: "languages",
      limit: "limit",
      continue: "continue",
      node: "node",
      entities: "entities",

      format: "wbFormat",
    },

    lang: "lang",
    tab: "tab",
    id: "id",

    content: "content",
    format: "format",
    engine: "engine",
    source: "source",
    inference: "inference",
    targetFormat: "targetFormat",
    targetEngine: "targetEngine",
    type: "type",
  };

  // Text constants
  static texts = {
    navbarHeaders: {
      examples: "Examples",
      help: "Help",
      wikishape: "Wikishape",
      wiki: "Wiki",
      apiDocs: "API Docs",
      about: "About",
      settings: "Settings",
      examples: "Examples",
      changeWikibase: "Set target Wikibase",
      projectSite: "Project site",
    },

    pageHeaders: {
      entityInfo: "Outgoing arcs from entity",
      propertyInfo: "Outgoing arcs from property",
      schemaInfo: "Analyze Wikidata schema",
      querySparql: "Query SPARQL endpoint",
      validateWbEntities: "Validate Wikibase entities",
      validateWbEntitiesSparql: "Validate Wikibase entities (from SPARQL)",
      schemaExtractDefault: "Extract schema from Wikidata entities",
      schemaExtractShexer: "Extract schema from Wikidata entities (Shexer)",
      changeWikibase: "Set target Wikibase instance",
    },

    pageExplanations: {
      entityInfo:
        "Select a set of entities to see a list of all the outgoing relationships to other entities/properties",
      propertyInfo:
        "Select a set of properties to see a list of all the outgoing relationships to other entities/properties",
      schemaInfo:
        "Type in and select any Wikidata schema to see its contents and different visualizations of it, " +
        "including: ShEx text, SVG and Cytoscape visuals and a UML-equivalent of the schema",
      querySparql:
        "Input a query (by text, by pointing to a URL with the contents or by file) and execute it against the current SPARQL endpoint",
      validateWbEntities:
        "Select a set of entities to be validated and a schema to be validated against. The validation schema can be one of Wikidata's or a custom one (Wikidata schemas will require a start shape)",
      validateWbEntitiesSparql:
        "Query the current endpoint and validate the resulting entities against a given schema. The validation schema can be one of Wikidata's or a custom one (Wikidata schemas will require a start shape)",

      schemaExtractDefault:
        "Select a set of entities and try to extract a validation schema (ShEx) that suits the entities' properties",

      schemaExtractShexer: (
        <span>
          Select a set of entities and try to extract a validation schema (ShEx)
          that suits the entities' properties (uses{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={this.routes.utils.shexerRepo}
          >
            Shexer
          </a>
          )
        </span>
      ),

      changeWikibase: (
        <span>
          Set the target Wikibase instance used in the web operations to one of
          your liking. Examples of common Wikibase instances are provided (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={this.routes.utils.wikidataBase}
          >
            Wikidata
          </a>{" "}
          and{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={this.routes.utils.dbpediaBase}
          >
            DBpedia
          </a>
          )
          <br />
          Note that some operations are still restricted to Wikidata
        </span>
      ),
    },

    dataTabs: {
      dataHeader: "Data (RDF)",
      shexHeader: "Shapes Graph (ShEx)",
      shaclHeader: "Shapes Graph (SHACL)",
      shapeMapHeader: "ShapeMap",
      queryHeader: "Query (SPARQL)",
      umlHeader: "UML (XMI)",

      formatHeader: "Format",
    },

    endpoints: {
      commonEndpoints: "Common endpoints",
      online: "Endpoint ONLINE",
    },

    xmi: {
      umlToShex: "Load UML to ShEx converter",
      shexToUml: "Load ShEx to UML converter",
    },

    placeholders: {
      sparqlQuery: "SELECT...",
      rdf: "RDF...",
      url: "http://...",
      shex: "ShEx...",
      shacl: "SHACL...",
      shapeMap: "<node>@<Shape>...>",
      xmi: "XMI...",
    },

    actionButtons: {
      getOutgoing: "Get outgoing arcs",
      schemaInfo: "Get schema info",
      validateEntities: "Validate entities",
      extractSchema: "Extract schema",
      query: "Query",
    },

    visualizationSettings: {
      download: "Download",
      embedLink: "Embed link",
      fullscreen: "Toggle fullscreen",
      fullscreenIn: "Enter fullscreen",
      fullscreenOut: "Exit fullscreen",
      center: "Center visualization",
    },

    validationResults: {
      allValid: "Validation successful",
      nodeValid: "Valid",
      nodeInvalid: "Invalid",
      someValid:
        "Partially invalid data: check the details of each node to learn more",
      noneValid: "Invalid data: check the details of each node to learn more",
      noData:
        "Validation was completed but no results were obtained, check if the input data is coherent",
    },

    targetUrlChanges: {
      okUrl: "Valid wikibase URL, URL updated",
      badUrl: "Invalid wikibase URL",

      okEndpoint: "Valid endpoint URL, endpoint updated",
      badEndpoint: "Invalid endpoint URL",
    },

    resultTabs: {
      schema: "Schema",
      extracted: "Extracted",
      overview: "Overview",
      result: "Result",
      prefixMap: "Prefix Map",
      visualization: "Visualization",
      render: "Render",
      visualizations: "Visualizations",
      visualizationDot: "DOT",
      visualizationCyto: "Cytoscape",
      uml: "UML",
      xmi: "XMI",
    },

    selectors: {
      format: "Format",
      targetFormat: "Target format",

      engine: "Engine",
      targetEngine: "Target engine",
      shaclEngine: "SHACL engine",
    },

    misc: {
      shex: "ShEx",
      xmi: "XMI",
      graph: "Graph",
      prefixMap: "Prefix map",
      associations: "Associations",
      umlDiagram: "UML Diagram",
      fullscreen: "Fullscreen",
      download: "Download",
      address: "Address",
      status: "Status",
      authors: "Authors & Contributors",
      weso: "WESO",
      wesoGroup: "WESO Research Group",

      shaclValidationReportText: "Validation report",
      shaclValidationReportNodes: "Results per node",
    },

    serverStatus: "Server status",
    networkError: "Network error",
    errorDetails: "Error details",
    errorParsingUrl: "Could not parse URL information",
    errorFetchingQuery: "Could not fetch the query data",
    noProvidedRdf: "No RDF data provided",
    noProvidedSchema: "No schema provided",
    noProvidedEntity: "No entity provided",
    invalidXmiSchema: "Invalid XMI schema",
    noProvidedShapeMap: "No shapeMap provided",
    noProvidedQuery: "No query provided",
    noProvidedEndpoint: "No endpoint provided",
    noProvidedUml: "No UML provided",
    errorResponsePrefix: "Error response",
    responseSummaryText: "Full response",
    noPrefixes: "No prefixes",
    noAssociations: "No associations",
    unknownReason: "Unknown reason",
    noResultsFound: "No results found",

    dataFormat: "Data format",
    schemaFormat: "Schema format",
    schemaEngine: "Schema engine",
    shapeMapFormat: "ShapeMap format",

    numberOfStatements: "Number of statements",
    numberOfShapes: "Number of shapes",
    numberOfAssociations: "Number of associations",

    operationInformation: "Operation information",
    visualizationsWillAppearHere: "Visualizations will appear here",
    dataInfoWillAppearHere: "Data info will appear here",
    schemaInfoWillAppearHere: "Schema info will appear here",
    conversionResultsWillAppearHere: "Conversion results will appear here",
    extractionResultsWillAppearHere: "Extraction results will appear here",
    mergeResultsWillAppearHere: "Merge results will appear here",
    queryResultsWillAppearHere: "Query results will appear here",
    validationResultsWillAppearHere: "Validation results will appear here",
    noPermalinkManual:
      "Can't generate links for long manual inputs, try inserting data by URL",
    noPermalinkFile:
      "Can't generate links for file-based inputs, try inserting data by URL",
    permalinkCopied: "Link copied to clipboard!",
    shapeStartRequired: '"Shape Start" is required on input',

    enableFullscreen: "Show at fullscreen",
    leaveFullscreen: "✖ Leave fullscreen",
  };

  // ID of the results container for any operation
  static resultsId = "results-container";
}

export default API;
