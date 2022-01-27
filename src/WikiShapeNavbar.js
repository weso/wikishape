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
              href={`${API.routes.client.wikibasePropertyInfo}?${API.queryParameters.endpoint}=https%3A%2F%2Fquery.wikidata.org%2Fsparql&${API.queryParameters.entities}=%5B%7B"label"%3A"instance%20of"%2C"id"%3A"P31"%2C"uri"%3A"http%3A%2F%2Fwww.wikidata.org%2Fentity%2FP31"%2C"descr"%3A"that%20class%20of%20which%20this%20subject%20is%20a%20particular%20example%20and%20member"%7D%5D`}
            >
              Show property (P31)
            </NavDropdown.Item>
          </NavDropdown>
          <NavDropdown title="Settings" id="basic-nav-dropdown">
            <NavDropdown.Item
              href={mkHash(API.routes.client.changeWikibaseUrl)}
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
