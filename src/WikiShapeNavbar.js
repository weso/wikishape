import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import API from "./API.js";
import Examples from "./utils/examples.js";

function WikishapeNavbar() {
  function mkHash(route) {
    return route;
  }

  return (
    <Navbar
      id="navigation"
      role="navigation"
      bg="primary"
      expand="md"
      filled="true"
      variant="dark"
    >
      <Navbar.Brand href="/">WikiShape</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <NavDropdown title="Entities" id="basic-nav-dropdown">
            <NavDropdown.Item href={mkHash(API.routes.client.wikibaseItem)}>
              Entity info
            </NavDropdown.Item>
            <NavDropdown.Item
              href={mkHash(API.routes.client.wikibasePropertyInfo)}
            >
              Property info
            </NavDropdown.Item>
            <NavDropdown.Item
              href={mkHash(API.routes.client.wikibaseSchemaInfo)}
            >
              Schema info
            </NavDropdown.Item>
          </NavDropdown>

          <NavDropdown title="Query" id="basic-nav-dropdown">
            <NavDropdown.Item href={mkHash(API.routes.client.wikibaseQuery)}>
              Query SPARQL endpoint
            </NavDropdown.Item>
          </NavDropdown>
          <NavDropdown title="Validate" id="basic-nav-dropdown">
            <NavDropdown.Item href={mkHash(API.routes.client.wikibaseValidate)}>
              Validate entity (user input)
            </NavDropdown.Item>

            <NavDropdown.Item
              href={mkHash(API.routes.client.wikibaseValidateSparql)}
            >
              Validate entity (SPARQL)
            </NavDropdown.Item>
          </NavDropdown>
          <NavDropdown title="Extract" id="basic-nav-dropdown">
            <NavDropdown.Item href={mkHash(API.routes.client.wikibaseExtract)}>
              Extract schema from entity (simple)
            </NavDropdown.Item>
            <NavDropdown.Item href={mkHash(API.routes.client.wikibaseSheXer)}>
              Extract schema from entity (sheXer)
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
        <Nav>
          <NavDropdown
            title={API.texts.navbarHeaders.examples}
            id="basic-nav-dropdown"
          >
            <NavDropdown.Item
              href={`${API.routes.client.wikibaseItem}?${
                API.queryParameters.wikibase.endpoint
              }=${encodeURIComponent(Examples.showEntityExampleEndpoint)}&${
                API.queryParameters.wikibase.entities
              }=${encodeURIComponent(Examples.showEntityExampleEntities)}`}
            >
              Show entity - Q42
            </NavDropdown.Item>
            <NavDropdown.Item
              href={`${API.routes.client.wikibaseSchemaInfo}?${
                API.queryParameters.id
              }=${encodeURIComponent(Examples.showSchemaExampleSchema)}`}
            >
              Inspect schema - E42
            </NavDropdown.Item>
            <NavDropdown.Item
              href={`${API.routes.client.wikibaseValidateSparql}?${
                API.queryParameters.wikibase.endpoint
              }=${encodeURIComponent(Examples.validateSparqlExampleEndpoint)}&${
                API.queryParameters.query.query
              }=${encodeURIComponent(Examples.validateSparqlExampleQuery)}&${
                API.queryParameters.query.source
              }=byText&${
                API.queryParameters.schema.schema
              }=${encodeURIComponent(Examples.validateSparqlExampleSchema)}&${
                API.queryParameters.schema.engine
              }=${API.engines.shex}&${API.queryParameters.schema.format}=${
                API.formats.shexc
              }&${API.queryParameters.schema.label}=${encodeURIComponent(
                Examples.validateSparqlExampleLabel
              )}&${API.queryParameters.schema.source}=${API.sources.byUrl}&${
                API.queryParameters.tab
              }=${API.tabs.wdSchema}`}
            >
              Validate entities (SPARQL) - Hospitals
            </NavDropdown.Item>
            <NavDropdown.Item
              href={`${API.routes.client.wikibaseExtract}?${
                API.queryParameters.wikibase.payload
              }=${encodeURIComponent(Examples.extractSchemaExamplePayload)}`}
            >
              Extract schema from entities - EII
            </NavDropdown.Item>
          </NavDropdown>
          <NavDropdown
            title={API.texts.navbarHeaders.settings}
            id="basic-nav-dropdown"
          >
            <NavDropdown.Item
              href={mkHash(API.routes.client.changeWikibaseInputUrl)}
            >
              {API.texts.navbarHeaders.changeWikibase}
            </NavDropdown.Item>
          </NavDropdown>
          <NavDropdown title="Help" id="basic-nav-dropdown" className="mr-sm-2">
            <NavDropdown.Item
              target="_blank"
              href={API.routes.utils.projectSite}
            >
              {API.texts.navbarHeaders.projectSite}
            </NavDropdown.Item>
            <NavDropdown.Item href={API.routes.utils.apiDocs}>
              {API.texts.navbarHeaders.apiDocs}
            </NavDropdown.Item>
            <NavDropdown.Item href={mkHash(API.routes.client.about)}>
              {API.texts.navbarHeaders.about}
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default WikishapeNavbar;
