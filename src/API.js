class API {

    // Routes in server
    static rootApi = process.env.REACT_APP_RDFSHAPE_HOST + "/api/"; // "http://localhost:8080/api/";

    static dataInfo = API.rootApi + "data/info";
    static dataOutgoing = API.rootApi + "endpoint/outgoing";
    static dataConvert = API.rootApi + "data/convert";
    static dataVisualize = API.rootApi + "data/visualize";
    static dataFormats = API.rootApi + "data/formats";
    static dataQuery = API.rootApi + "data/query";
    static dataExtract = API.rootApi + "data/extract";
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

    static ChangeWikibaseURL = API.rootApi + "changeBase/" ;

    // Routes in client
    static wikidataSchemaInfoRoute = "/wikidataSchemaInfo";
    static wikidataSchemaVisualRoute = "/wikidataSchemaVisual";
    static wikidataQueryRoute = "/wikidataQuery";
    static wikidataValidateRoute = "/wikidataValidate";
    static wikidataExtractRoute = "/wikidataExtract";
    static wikidataOutgoingRoute = "/wikidataOutgoing";
    static wikidataPropertyInfoRoute = "/wikidataPropertyInfo";
    static wikidataValidateSPARQLRoute = "/wikidataValidateSPARQL";
    static changeWikibaseURLRoute = "/changeWikibaseURLRoute";

    static aboutRoute = "/about";

    static byTextTab = "byText";
    static byUrlTab = "byUrl";
    static byFileTab = "byFile";
    static defaultTab = "byTextTab";
    static defaultDataFormat = "TURTLE";
    static defaultShExFormat = "ShExC";
    static defaultSHACLFormat = "TURTLE";
    static defaultShapeMapFormat = "Compact";

    static wikidataUrl =  "https://query.wikidata.org/sparql";
    // static wikidataUrlFetch =  "https://www.wikidata.org/sparql";

    static dbpediaUrl =  "http://dbpedia.org/sparql";
    static localWikibaseUrl = "http://localhost:8282/proxy/wdqs/bigdata/namespace/wdq/sparql";
}

export default API;
