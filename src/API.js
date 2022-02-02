import environmentConfiguration from "./EnvironmentConfig";

class API {
  static rootApi = environmentConfiguration.rdfShapeHost + "/api/";
  static routes = {
    server: {
      root: this.rootApi,
      health: this.rootApi + "health",

      dataInfo: this.rootApi + "data/info",
      dataConvert: this.rootApi + "data/convert",
      dataQuery: this.rootApi + "data/query",
      dataExtract: this.rootApi + "data/extract",
      dataFormatsInput: this.rootApi + "data/formats/input",
      dataFormatsOutput: this.rootApi + "data/formats/output",
      dataVisualFormats: this.rootApi + "data/formats/visual",
      dataOutgoing: this.rootApi + "endpoint/outgoing",

      schemaInfo: this.rootApi + "schema/info",
      schemaConvert: this.rootApi + "schema/convert",
      schemaValidate: this.rootApi + "schema/validate",
      shExFormats: this.rootApi + "schema/formats?schemaEngine=shex",
      shaclFormats: this.rootApi + "schema/formats?schemaEngine=shaclex",
      schemaShaclEngines: this.rootApi + "schema/engines/shacl",

      shapeMapInfo: this.rootApi + "shapemap/info",
      shapeMapFormats: this.rootApi + "shapemap/formats",

      endpointInfo: this.rootApi + "endpoint/info",
      endpointQuery: this.rootApi + "endpoint/query",

      inferenceEngines: this.rootApi + "data/inferenceEngines",

      serverPermalinkEndpoint: this.rootApi + "permalink/generate",
      serverOriginalLinkEndpoint: this.rootApi + "permalink/get",
      fetchUrl: this.rootApi + "fetch",

      wikidataEntityLabel: this.rootApi + "wikibase/entityLabel",
      wikibaseSearchEntity: this.rootApi + "wikibase/searchEntity",
      wikibaseSearchProperty: this.rootApi + "wikibase/searchProperty",
      wikibaseSchemaContent: this.rootApi + "wikibase/schemaContent",
      wikibaseValidate: this.rootApi + "wikibase/validate",
      wikibaseQuery: this.rootApi + "wikibase/query",
      wikibaseExtract: this.rootApi + "wikibase/extract",
      wikibaseExtractShexer: this.rootApi + "wikibase/shexer",
      wikibaseLanguages: this.rootApi + "wikibase/languages",
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

      byTextTab: "byText",
      byUrlTab: "byUrl",
      byFileTab: "byFile",
      defaultTab: "byTextTab",
      defaultDataFormat: "TURTLE",
      defaultShExFormat: "ShExC",
      defaultSHACLFormat: "TURTLE",
      defaultShapeMapFormat: "Compact",
    },
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
    payload: "payload",
    endpoint: "endpoint",
    language: "language",
    languages: "languages",
    limit: "limit",
    continue: "continue",
    node: "node",
    entities: "entities",
    lang: "lang",
    tab: "tab",
    id: "id",
  };

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

  // Text constants
  static texts = {
    navbarHeaders: {
      rdf: "RDF",
      endpoint: "Endpoint",
      shex: "ShEx",
      shacl: "SHACL",
      shapeMap: "ShapeMap",
      analysis: "Analysis",
      information: "Information",
      conversion: "Conversion",
      visualization: "Visualization",
      validationUser: "Validation (user data)",
      validationEndpoint: "Validation (endpoint data)",
      mergeAndConvert: "Merge & Convert",
      mergeAndVisualize: "Merge & Visualize",
      sparqlQuery: "Query (SPARQL)",
      shexExtract: "ShEx extraction",
      shexToShacl: "ShEx → SHACL",
      shaclToShex: "SHACL → ShEx",
      shexToForm: "ShEx → Form",
      shexToUml: "ShEx ⟷ UML",
      examples: "Examples",
      help: "Help",
      wikishape: "Wikishape",
      wiki: "Wiki",
      apiDocs: "API Docs",
      about: "About",
    },

    pageHeaders: {
      dataInfo: "Data analysis",
      dataConversion: "Data conversion",
      dataVisualization: "Data visualization",
      dataMergeConvert: "Data merge & convert",
      dataMergeVisualize: "Data merge & visualize",
      dataQuery: "Data query",
      wikibaseQuery: "Query Wikibase",
      wikidataValidate: "Validate Wikidata entities",
      dataShexExtraction: "Extract ShEx from Data",
      wikidataSchemaExtraction: "Extract schema from Wikidata entities",
      endpointSchemaExtraction: "Extract schema from Endpoint node",

      endpointInfo: "Endpoint information",
      endpointQuery: "Endpoint query",

      shexInfo: "ShEx analysis",
      shexConversion: "ShEx conversion",
      shexValidation: "ShEx validate user data",
      shexValidationEndpoint: "ShEx validate endpoint data",
      shexVisualization: "ShEx visualization",
      shexToShacl: "ShEx conversion to Shacl",
      shexToForm: "Create form from ShEx",
      shexToUml: "ShEx conversion to UML",
      umlToShex: "UML conversion to ShEx",

      shaclInfo: "SHACL analysis",
      shaclValidation: "SHACL validate user data",
      shaclConversion: "SHACL conversion",
      shaclToShex: "SHACL conversion to ShEx",

      shapeMapInfo: "ShapeMap analysis",
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
      analyze: "Analyze",
      convert: "Convert",
      visualize: "Visualize",
      validate: "Validate",
      merge: "Merge",
      query: "Query",
      extract: "Extract",
      fetch: "Fetch",
      createForm: "Create form",
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
    embeddedLink: "Embedded link",
    permalinkCopied: "Link copied to clipboard!",
    shapeStartRequired: '"Shape Start" is required on input',

    enableFullscreen: "Show at fullscreen",
    leaveFullscreen: "✖ Leave fullscreen",
  };
}

export default API;
