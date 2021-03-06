import { mergeShapeMap } from "../ResultValidate";

test('Merge shape map 1', () => {
  const previous = {
      "valid":false,
      "type":"Result",
      "message":"Validation started",
      "shapeMap":[
          {"node":"<http://www.wikidata.org/entity/Q42>",
           "shape":"Start",
           "status":"?",
           "reason":"validating"
          }
          ],
      "errors":[],
      "nodesPrefixMap":{"bd":"http://www.bigdata.com/rdf#","cc":"http://creativecommons.org/ns#","dct":"http://purl.org/dc/terms/","geo":"http://www.opengis.net/ont/geosparql#","hint":"http://www.bigdata.com/queryHints#","ontolex":"http://www.w3.org/ns/lemon/ontolex#","owl":"http://www.w3.org/2002/07/owl#","prn":"http://www.wikidata.org/prop/reference/value-normalized/","prv":"http://www.wikidata.org/prop/reference/value/","pqn":"http://www.wikidata.org/prop/qualifier/value-normalized/","pqv":"http://www.wikidata.org/prop/qualifier/value/","pq":"http://www.wikidata.org/prop/qualifier/","pr":"http://www.wikidata.org/prop/reference/","prov":"http://www.w3.org/ns/prov#","psn":"http://www.wikidata.org/prop/statement/value-normalized/","psv":"http://www.wikidata.org/prop/statement/value/","ps":"http://www.wikidata.org/prop/statement/","rdf":"http://www.w3.org/1999/02/22-rdf-syntax-ns#","rdfs":"http://www.w3.org/2000/01/rdf-schema#","schema":"http://schema.org/","skos":"http://www.w3.org/2004/02/skos/core#","wikibase":"http://wikiba.se/ontology#","wdata":"http://www.wikidata.org/wiki/Special:EntityData/","wdno":"http://www.wikidata.org/prop/novalue/","wdref":"http://www.wikidata.org/reference/","wds":"http://www.wikidata.org/entity/statement/","wdt":"http://www.wikidata.org/prop/direct/","wdtn":"http://www.wikidata.org/prop/direct-normalized/","wdv":"http://www.wikidata.org/value/","wd":"http://www.wikidata.org/entity/","xsd":"http://www.w3.org/2001/XMLSchema#","p":"http://www.wikidata.org/prop/"}
  };
  const newResult = {
      "valid":true,
      "type":"Result",
      "message":"Validated",
      "shapeMap":[
          {"node":"<http://www.wikidata.org/entity/Q42>",
           "shape":"<http://www.w3.org/ns/shex#Start>",
           "status":"conformant",
           "appInfo":"Shaclex",
           "reason":""
          },
          {"node":"<http://www.wikidata.org/entity/Q42>",
           "shape":"<wikidata-Q5>",
           "status":"conformant",
           "appInfo":"Shaclex",
           "reason":"<http://www.wikidata.org/entity/Q42> passed .+ for path <http://www.wikidata.org/prop/direct/P106>\n<http://www.wikidata.org/entity/Q42> passed .+ for path <http://www.wikidata.org/prop/direct/P735>\n<http://www.wikidata.org/entity/Q42> passed [<http://www.wikidata.org/entity/Q5>]{1,1} for path <http://www.wikidata.org/prop/direct/P31>\n<http://www.wikidata.org/entity/Q42> passed .+ for path <http://www.wikidata.org/prop/direct/P569>\n<http://www.wikidata.org/entity/Q42> passed .+ for path <http://www.wikidata.org/prop/direct/P734>\n<http://www.wikidata.org/entity/Q42> passed .{1,1} for path <http://www.wikidata.org/prop/direct/P21>"}],"errors":[],"nodesPrefixMap":{"ref":"http://www.wikidata.org/reference/","ps":"http://www.wikidata.org/prop/statement/","prv":"http://www.wikidata.org/prop/reference/value/","p":"http://www.wikidata.org/prop/","ontolex":"http://www.w3.org/ns/lemon/ontolex#","prn":"http://www.wikidata.org/prop/reference/value-normalized/","cc":"http://creativecommons.org/ns#","wd":"http://www.wikidata.org/entity/","pq":"http://www.wikidata.org/prop/qualifier/","wikibase":"http://wikiba.se/ontology#","rdf":"http://www.w3.org/1999/02/22-rdf-syntax-ns#","s":"http://www.wikidata.org/entity/statement/","prov":"http://www.w3.org/ns/prov#","geo":"http://www.opengis.net/ont/geosparql#","data":"https://www.wikidata.org/wiki/Special:EntityData/","pqv":"http://www.wikidata.org/prop/qualifier/value/","psn":"http://www.wikidata.org/prop/statement/value-normalized/","wdt":"http://www.wikidata.org/prop/direct/","wdtn":"http://www.wikidata.org/prop/direct-normalized/","owl":"http://www.w3.org/2002/07/owl#","dct":"http://purl.org/dc/terms/","skos":"http://www.w3.org/2004/02/skos/core#","v":"http://www.wikidata.org/value/","schema":"http://schema.org/","wdno":"http://www.wikidata.org/prop/novalue/","rdfs":"http://www.w3.org/2000/01/rdf-schema#","pr":"http://www.wikidata.org/prop/reference/","psv":"http://www.wikidata.org/prop/statement/value/","pqn":"http://www.wikidata.org/prop/qualifier/value-normalized/","xsd":"http://www.w3.org/2001/XMLSchema#"},"shapesPrefixMap":{"p":"http://www.wikidata.org/prop/","wd":"http://www.wikidata.org/entity/","wdt":"http://www.wikidata.org/prop/direct/"}
  };
  const expected = {};
  expect(mergeShapeMap(previous,newResult)).toEqual(expected);

});

test('adds 1 + 2 to equal 3', () => {
    expect(1 + 2).toBe(3);
});