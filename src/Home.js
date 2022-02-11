import React from "react";
import Container from "react-bootstrap/Container";
import API from "./API.js";

class Home extends React.Component {
  render() {
    return (
      <Container>
        <h1>WikiShape</h1>

        <p>
          Wikishape is a playground customized for querying and extracting
          information on Wikidata and other Wikibase instances. You may visit{" "}
          <a href={API.routes.utils.rdfShapeClient}>RDFShape</a> for a more
          general RDF playground.
        </p>
        <p>Here are some usage ideas:</p>
        <ul>
          <li>
            Search for entities and properties in{" "}
            <a href={API.wikidataContact.url}>Wikidata</a>
          </li>
          <li>
            Perform <a href="http://www.w3.org/TR/sparql11-query/">SPARQL</a>{" "}
            queries against any <a href={API.routes.utils.wikibase}>Wikibase</a>{" "}
            instance
          </li>
          <li>
            Validate entities in Wikidata against Wikidata's own schemas or
            custom <a href="http://shex.io/">ShEx</a> (Shape Expressions)
            schemas
          </li>
        </ul>
        <p>Go ahead or check the examples in the navbar ^^</p>

        <h2>Main tools</h2>

        <p>
          <span className="bold">Wikibase items</span> search and inspection:
        </p>

        <ul>
          <li>
            Get information about{" "}
            <a href={API.routes.client.wikibaseItem}>entities</a> and{" "}
            <a href={API.routes.client.wikibasePropertyInfo}>properties</a>
          </li>
          <li>
            Inspect and visualize wikidata{" "}
            <a href={API.routes.client.wikibaseSchemaInfo}>schemas</a>
          </li>
        </ul>

        <p>
          <span className="bold">SPARQL</span> query mechanisms:
        </p>
        <ul>
          <li>
            <a href={API.routes.client.wikibaseQuery}>Query</a> any wikibase
            instance
          </li>
        </ul>

        <p>
          <span className="bold">ShEx</span> validation mechanisms:
        </p>
        <ul>
          <li>
            Validate Wikidata entities,{" "}
            <a href={API.routes.client.wikibaseValidate}>manually</a> or via{" "}
            <a href={API.routes.client.wikibaseValidateSparql}>
              SPARQL queries
            </a>
          </li>
          <li>
            <a href={API.routes.client.wikibaseExtract}>Extract</a> ShEx schemas
            from wikidata entities entities
          </li>
        </ul>
      </Container>
    );
  }
}

export default Home;
