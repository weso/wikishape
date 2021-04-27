import environmentConfiguration from "./EnvironmentConfig";

console.log(
  "ENV: ",
  environmentConfiguration,
  environmentConfiguration.rdfShapeHost
);

class API {
  // Routes in server
  static rootApi = environmentConfiguration.rdfShapeHost + "/api/";

  static dataInfo = API.rootApi + "data/info";
  static dataOutgoing = API.rootApi + "endpoint/outgoing";
  static dataConvert = API.rootApi + "data/convert";
  static dataVisualize = API.rootApi + "data/visualize";
  static dataFormats = API.rootApi + "data/formats";
  static dataQuery = API.rootApi + "data/query";
  static dataExtract = API.rootApi + "wikidata/extract";
  static dataVisualFormats = API.rootApi + "data/visualize/formats";
  static endpointInfo = API.rootApi + "endpoint/info";
  static endpointQuery = API.rootApi + "endpoint/query";
  static shExFormats = API.rootApi + "schema/formats?schemaEngine=shex";
  static shapeMapFormats = API.rootApi + "shapeMap/formats";
  static shaclFormats = API.rootApi + "schema/formats?schemaEngine=shaclex";
  static schemaValidate = API.rootApi + "schema/validate";
  static schemaInfo = API.rootApi + "schema/info";
  static schemaVisualize = API.rootApi + "schema/visualize";
  static schemaConvert = API.rootApi + "schema/convert";
  static schemaVisualizeCytoscape = API.rootApi + "schema/cytoscape";

  static wikidataEntityLabel = API.rootApi + "wikidata/entityLabel";
  static wikidataSearchEntity = API.rootApi + "wikidata/searchEntity";
  static wikidataSearchProperty = API.rootApi + "wikidata/searchProperty";
  static wikidataLanguages = API.rootApi + "wikidata/languages";
  static wikidataSchemaContent = API.rootApi + "wikidata/schemaContent";
  static wikidataQuery = API.rootApi + "wikidata/query";
  static wikidataValidateDeref = API.rootApi + "wikidata/validate";

  static ChangeWikibaseURL = API.rootApi + "changeBase/";

  // Routes in client
  static wikidataSchemaInfoRoute = "/wikidataSchemaInfo";
  static wikidataSchemaVisualRoute = "/wikidataSchemaVisual";
  static wikidataQueryRoute = "/wikidataQuery";
  static wikidataValidateRoute = "/wikidataValidate";
  static wikidataValidateDerefRoute = "/wikidataValidateDeref";
  static wikidataValidateDerefShExRoute = "/wikidataValidateDerefShEx";
  static wikidataExtractRoute = "/wikidataExtract";
  static wikidataSheXerRoute = "/wikidataSheXer";
  static wikidataOutgoingRoute = "/wikidataOutgoing";
  static wikidataPropertyInfoRoute = "/wikidataPropertyInfo";
  static wikidataValidateSPARQLRoute = "/wikidataValidateSPARQL";
  static changeWikibaseURLRoute = "/changeWikibaseURLRoute";
  static aboutRoute = "/about";
  static permalinkRoute = "/link/:urlCode";

  static byTextTab = "byText";
  static byUrlTab = "byUrl";
  static byFileTab = "byFile";
  static defaultTab = "byTextTab";
  static defaultDataFormat = "TURTLE";
  static defaultShExFormat = "ShExC";
  static defaultSHACLFormat = "TURTLE";
  static defaultShapeMapFormat = "Compact";

  // URLs and Endpoints

  static currentEndpoint = () =>
    localStorage.getItem("endpoint") || API.wikidataContact.endpoint;
  static currentUrl = () =>
    localStorage.getItem("url") || API.wikidataContact.url;

  static serverPermalinkEndpoint = API.rootApi + "permalink/generate";
  static serverOriginalLinkEndpoint = API.rootApi + "permalink/get";
  static fetchUrl = API.rootApi + "fetch";

  static wikidataUrl = "https://query.wikidata.org/sparql";
  // static wikidataUrlFetch =  "https://www.wikidata.org/sparql";

  static dbpediaUrl = "http://dbpedia.org/sparql";
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
}

export default API;
