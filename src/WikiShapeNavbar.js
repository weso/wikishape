import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { NavLink, useHistory } from "react-router-dom";
import API from "./API.js";
import Examples from "./utils/examples.js";

function WikishapeNavbar() {
  const history = useHistory();
  function mkHash(route) {
    return route;
  }

  // Make a custom navbar dropdown link, given its destination and test
  const mkNavbarLink = (href, text) => (
    <NavDropdown.Item as={"li"}>
      <Nav.Link className="custom-dropdown-link" as={NavLink} to={href}>
        {text}
      </Nav.Link>
    </NavDropdown.Item>
  );

  return (
    <Navbar
      id="navigation"
      role="navigation"
      bg="primary"
      expand="md"
      filled="true"
      variant="dark"
    >
      <Navbar.Brand className="pointable" onClick={() => history.push("/")}>
        WikiShape
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <NavDropdown
            title={API.texts.navbarHeaders.entities}
            id="nav-dropdown-wikidataItems"
          >
            {mkNavbarLink(
              API.routes.client.wikibaseItem,
              API.texts.navbarHeaders.entityInfo
            )}
            {mkNavbarLink(
              API.routes.client.wikibasePropertyInfo,
              API.texts.navbarHeaders.propertyInfo
            )}
            {mkNavbarLink(
              API.routes.client.wikibaseSchemaInfo,
              API.texts.navbarHeaders.schemaInfo
            )}
          </NavDropdown>

          <NavDropdown
            title={API.texts.navbarHeaders.query}
            id="nav-dropdown-query"
          >
            {mkNavbarLink(
              API.routes.client.wikibaseQuery,
              API.texts.navbarHeaders.queryEndpoint
            )}
          </NavDropdown>
          <NavDropdown
            title={API.texts.navbarHeaders.validate}
            id="nav-dropdown-validate"
          >
            {mkNavbarLink(
              API.routes.client.wikibaseValidate,
              API.texts.navbarHeaders.validateUser
            )}
            {mkNavbarLink(
              API.routes.client.wikibaseValidateSparql,
              API.texts.navbarHeaders.validateSparql
            )}
          </NavDropdown>
          <NavDropdown
            title={API.texts.navbarHeaders.extract}
            id="nav-dropdown-extract"
          >
            {mkNavbarLink(
              API.routes.client.wikibaseExtract,
              API.texts.navbarHeaders.extractSimple
            )}
            {mkNavbarLink(
              API.routes.client.wikibaseSheXer,
              API.texts.navbarHeaders.extractShexer
            )}
          </NavDropdown>
        </Nav>
        <Nav>
          <NavDropdown
            title={API.texts.navbarHeaders.settings}
            id="nav-dropdown-settings"
          >
            {mkNavbarLink(
              API.routes.client.changeWikibaseInputUrl,
              API.texts.navbarHeaders.changeWikibase
            )}
          </NavDropdown>
          <NavDropdown
            title={API.texts.navbarHeaders.examples}
            id="nav-dropdown-examples"
          >
            {mkNavbarLink(
              `${API.routes.client.wikibaseItem}?${
                API.queryParameters.wikibase.endpoint
              }=${encodeURIComponent(Examples.showEntityExampleEndpoint)}&${
                API.queryParameters.wikibase.sparqlEndpoint
              }=${encodeURIComponent(
                Examples.showEntityExampleSparqlEndpoint
              )}&${API.queryParameters.wikibase.entities}=${encodeURIComponent(
                Examples.showEntityExampleEntities
              )}`,
              API.texts.navbarExamples.showEntity
            )}
            {mkNavbarLink(
              `${API.routes.client.wikibaseSchemaInfo}?${
                API.queryParameters.id
              }=${encodeURIComponent(Examples.showSchemaExampleSchema)}`,
              API.texts.navbarExamples.showSchema
            )}
            {mkNavbarLink(
              `${API.routes.client.wikibaseValidateSparql}?${
                API.queryParameters.wikibase.endpoint
              }=${encodeURIComponent(Examples.validateSparqlExampleEndpoint)}&${
                API.queryParameters.wikibase.sparqlEndpoint
              }=${encodeURIComponent(
                Examples.validateSparqlExampleSparqlEndpoint
              )}&${API.queryParameters.query.query}=${encodeURIComponent(
                Examples.validateSparqlExampleQuery
              )}&${API.queryParameters.query.source}=byText&${
                API.queryParameters.schema.schema
              }=${encodeURIComponent(Examples.validateSparqlExampleSchema)}&${
                API.queryParameters.schema.engine
              }=${API.engines.shex}&${API.queryParameters.schema.format}=${
                API.formats.shexc
              }&${API.queryParameters.schema.label}=${encodeURIComponent(
                Examples.validateSparqlExampleLabel
              )}&${API.queryParameters.schema.source}=${API.sources.byUrl}&${
                API.queryParameters.tab
              }=${API.tabs.wdSchema}`,
              API.texts.navbarExamples.validateEntities
            )}
            {mkNavbarLink(
              `${API.routes.client.wikibaseExtract}?${
                API.queryParameters.wikibase.payload
              }=${encodeURIComponent(Examples.extractSchemaExamplePayload)}&${
                API.queryParameters.wikibase.endpoint
              }=${encodeURIComponent(Examples.extractSchemaExampleEndpoint)}`,
              API.texts.navbarExamples.extractSchema
            )}
          </NavDropdown>

          <NavDropdown title="Help" id="nav-dropdown-help" className="mr-sm-2">
            <NavDropdown.Item
              target="_blank"
              href={API.routes.utils.projectSite}
            >
              {API.texts.navbarHeaders.projectSite}
            </NavDropdown.Item>
            <NavDropdown.Item href={API.routes.utils.apiDocs}>
              {API.texts.navbarHeaders.apiDocs}
            </NavDropdown.Item>
            {mkNavbarLink(
              API.routes.client.about,
              API.texts.navbarHeaders.about
            )}
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default WikishapeNavbar;
