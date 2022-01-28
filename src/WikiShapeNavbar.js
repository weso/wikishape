import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import API from "./API.js";

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
          <NavDropdown title="Examples" id="basic-nav-dropdown">
            <NavDropdown.Item
              href={`${API.routes.client.wikibaseItem}?${API.queryParameters.endpoint}=https%3A%2F%2Fquery.wikidata.org%2Fsparql&${API.queryParameters.entities}=%5B%7B%22label%22%3A%22Douglas%20Adams%22%2C%22id%22%3A%22Q42%22%2C%22uri%22%3A%22http%3A%2F%2Fwww.wikidata.org%2Fentity%2FQ42%22%2C%22descr%22%3A%22English%20writer%20and%20humorist%22%7D%5D`}
            >
              Show entity (Q42)
            </NavDropdown.Item>
            {/*<NavDropdown.Item href='/#/wikidataSchemaInfo?id=E42&lang=en'>Show entity schema (E42)</NavDropdown.Item>*/}
            <NavDropdown.Item
              href={`${API.routes.client.wikibaseSchemaInfo}?${API.queryParameters.id}=E42&${API.queryParameters.lang}=en`}
            >
              Inspect schema (E42)
            </NavDropdown.Item>
            <NavDropdown.Item
              href={`${API.routes.client.wikibaseValidateSparql}?${API.queryParameters.endpoint}=https%3A%2F%2Fwww.wikidata.org&${API.queryParameters.query.query}=SELECT%20%3Fitem%20%3FitemLabel%0AWHERE%0A%7B%0A%20%20%3Fitem%20wdt%3AP31%20wd%3AQ16917.%20%23%20Must%20be%20hospital%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%2Cen%22.%20%7D%0A%7D%20LIMIT%205&${API.queryParameters.query.source}=byText&${API.queryParameters.schema.schema}=https%3A%2F%2Fwww.wikidata.org%2Fwiki%2FSpecial%3AEntitySchemaText%2FE187&${API.queryParameters.schema.engine}=ShEx&${API.queryParameters.schema.format}=ShExC&${API.queryParameters.schema.label}=Hospital&${API.queryParameters.schema.source}=byUrl&${API.queryParameters.tab}=bySchema`}
            >
              Validate entities (SPARQL)
            </NavDropdown.Item>
          </NavDropdown>
          <NavDropdown title="Settings" id="basic-nav-dropdown">
            <NavDropdown.Item
              href={mkHash(API.routes.client.changeWikibaseInputUrl)}
            >
              Change target Wikibase
            </NavDropdown.Item>
          </NavDropdown>
          <NavDropdown title="Help" id="basic-nav-dropdown" className="mr-sm-2">
            <NavDropdown.Item href="https://app.swaggerhub.com/apis-docs/labra/rdfshape/1.0.1">
              API Docs
            </NavDropdown.Item>
            <NavDropdown.Item href="https://github.com/weso/wikishape/wiki/Help">
              Help
            </NavDropdown.Item>
            <NavDropdown.Item href={mkHash(API.routes.client.about)}>
              About
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default WikishapeNavbar;
