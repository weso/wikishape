import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import Container from "react-bootstrap/Container";
import API from "./API";

class About extends React.Component {
  render() {
    return (
      <Container>
        <h1>About Wikishape</h1>
        <p>
          Main author: <a href="http://labra.weso.es">Jose Emilio Labra Gayo</a>{" "}
          (<a href="http://www.weso.es">WESO research group</a>)
        </p>
        <p>
          This is a fork of{" "}
          <a href="http://rdfshape.weso.es">rdfshape.weso.es</a> customized for{" "}
          <a href="http://wikidata.org">Wikidata</a>
        </p>
        <p>
          Paper describing RDFShape:{" "}
          <a href="http://ceur-ws.org/Vol-2180/paper-35.pdf">
            RDFShape: An RDF playground based on Shapes
          </a>
          , <a href="http://labra.weso.es">Jose Emilio Labra Gayo</a>, Daniel
          Fernández Álvarez, Herminio García González, Demo presented at{" "}
          <a href="http://iswc2018.semanticweb.org/">
            International Semantic Web Conference
          </a>
          , Monterey, California - 2018
        </p>
        <ul>
          <li>
            Version {process.env.REACT_APP_VERSION} [{process.env.NODE_ENV}]
          </li>
          <li>
            Server host:{" "}
            <a href={process.env.REACT_APP_RDFSHAPE_HOST}>
              {process.env.REACT_APP_RDFSHAPE_HOST}
            </a>
          </li>
          {/*                   <li>Built with <a href="http://www.scala-lang.org/">Scala</a> and <a href="http://www.scala-sbt.org/">SBT</a></li> */}
          <li>
            Source code:
            <ul>
              <li>
                <a href="https://github.com/weso/wikishape">Client</a>
              </li>
              <li>
                <a href="https://github.com/weso/rdfshape-client">Client</a>
              </li>
              <li>
                <a href="https://github.com/weso/rdfshape">Server</a>
              </li>
              <li>
                <a href="https://github.com/weso/shaclex">
                  validation libraries
                </a>
              </li>
            </ul>
          </li>
          <li>
            <a href="https://github.com/labra/shaclex/issues/4">
              SHEX Features
            </a>
          </li>
          <li>
            <a href="https://github.com/labra/shaclex/issues/2">
              SHACL Features
            </a>
          </li>
          <li>
            Info about the languages:{" "}
            <a href="http://book.validatingrdf.com">Validating RDF data book</a>
          </li>
        </ul>
        <details>
          Server: <code>{API.rootApi}</code>
        </details>
      </Container>
    );
  }
}

export default About;
