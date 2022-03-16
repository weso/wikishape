import API from "../API";

// Items used for the examples displayed on the navbar
class Examples {
  static showEntityExampleEndpoint = API.routes.utils.wikidataUrl;
  static showEntityExampleSparqlEndpoint = API.routes.utils.wikidataSparqlUrl;
  static showEntityExampleEntities = `
[{"label":"Douglas Adams","id":"Q42",
"uri":"http://www.wikidata.org/entity/Q42",
"descr":"English writer and humorist"}]
`;

  static showSchemaExampleSchema = `E42`;
  static showSchemaExampleLang = `en`;

  static validateSparqlExampleEndpoint = API.routes.utils.wikidataUrl;
  static validateSparqlExampleSparqlEndpoint =
    API.routes.utils.wikidataSparqlUrl;
  static validateSparqlExampleQuery = `
# Select 4 hospitals and compare
# against Hospital schema (E187)

SELECT ?item ?itemLabel
WHERE
{
  ?item wdt:P31 wd:Q16917. # Must be hospital
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
} LIMIT 4
  `;
  static validateSparqlExampleSchema = `https://www.wikidata.org/wiki/Special:EntitySchemaText/E187`;
  static validateSparqlExampleLabel = `Hospital`;

  static extractSchemaExamplePayload = `http://www.wikidata.org/entity/Q11681590`;
  static extractSchemaExampleEndpoint = API.routes.utils.wikidataUrl;
}

export default Examples;
