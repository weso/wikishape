import React from "react";
import Container from "react-bootstrap/Container";
import API from "./API.js";

class Home extends React.Component {
  render() {
    return (
      <Container>
        <p>
          Wikishape is a playground customized for Wikidata and Wikibase
          instances. If you want a more general RDF playground you can visit{" "}
          <a href="https://rdfshape.weso.es">RDFShape</a>.
        </p>
        <p>With Wikishape, you can do the following:</p>
        <ul>
          <li>
            Get information about{" "}
            <a href={API.routes.client.wikibaseItem}>entities</a>,{" "}
            <a href={API.routes.client.wikidataPropertyInfo}>properties</a> and
            entity <a href={API.routes.client.wikibaseSchemaInfo}>schemas</a>.
          </li>
          <li>
            <a href={API.routes.client.wikibaseQuery}>Query</a> entities.
          </li>
          <li>
            <a href={API.routes.client.wikibaseValidate}>Validate</a> entities
            with entity schemas (ShEx).
          </li>
          <li>
            <a href={API.routes.client.wikibaseExtract}>Extract</a> schemas from
            entities.
          </li>
        </ul>

        <p>
          Source code available{" "}
          <a href="https://github.com/weso/wikishape">here</a>.
        </p>
      </Container>
    );
  }
}

export default Home;
