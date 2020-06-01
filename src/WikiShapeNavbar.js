import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import API from './API.js'


function WikishapeNavbar() {

    function mkHash(route) {
        return route ;
        // return "#" + route;
    }

    return (
            <Navbar bg="primary" expand="md" filled="true" variant="dark">
                <Navbar.Brand href="/">WikiShape</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <NavDropdown title="Entity" id="basic-nav-dropdown">
                            <NavDropdown.Item href={mkHash(API.wikidataOutgoingRoute)}>Info about entity (outgoing arcs)</NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title="Schema" id="basic-nav-dropdown">
                            <NavDropdown.Item href={mkHash(API.wikidataSchemaInfoRoute)}>Info about entity schema</NavDropdown.Item>
                            <NavDropdown.Item href={mkHash(API.wikidataSchemaVisualRoute)}>Visualize entity schema</NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title="Property" id="basic-nav-dropdown">
                            <NavDropdown.Item href={mkHash(API.wikidataPropertyInfoRoute)}>Info about property</NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title="Query" id="basic-nav-dropdown">
                            <NavDropdown.Item href={mkHash(API.wikidataQueryRoute)}>Query SPARQL endpoint</NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title="Validate" id="basic-nav-dropdown">
                            <NavDropdown.Item href={mkHash(API.wikidataValidateDerefRoute)} >Validate an entity (simple)</NavDropdown.Item>
                            <NavDropdown.Item href={mkHash(API.wikidataValidateRoute)} >Validate an entity (SPARQL)</NavDropdown.Item>
                            <NavDropdown.Item href={mkHash(API.wikidataValidateSPARQLRoute)}>Validate entities obtained from SPARQL queries (SPARQL)</NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title="Extract" id="basic-nav-dropdown">
                            <NavDropdown.Item href={mkHash(API.wikidataExtractRoute)}>Extract schema from entity (simple)</NavDropdown.Item>
                            <NavDropdown.Item href={mkHash(API.wikidataSheXerRoute)}>Extract schema from entity (sheXer)</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav>
                        <NavDropdown title="Examples" id="basic-nav-dropdown">
                            <NavDropdown.Item href='/wikidataOutgoing?endpoint=https%3A%2F%2Fquery.wikidata.org%2Fsparql&node=http%3A%2F%2Fwww.wikidata.org%2Fentity%2FQ42'>Show entity (Q42)</NavDropdown.Item>
                            {/*<NavDropdown.Item href='/#/wikidataSchemaInfo?id=E42&lang=en'>Show entity schema (E42)</NavDropdown.Item>*/}
                            <NavDropdown.Item href='/wikidataSchemaVisual?id=E42&lang=en'>Visualize entity schema (E42)</NavDropdown.Item>
                            <NavDropdown.Item href='/wikidataOutgoing?endpoint=https%3A%2F%2Fquery.wikidata.org%2Fsparql&node=http%3A%2F%2Fwww.wikidata.org%2Fentity%2FP31'>Property</NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title="Settings" id="basic-nav-dropdown">
                            <NavDropdown.Item href={mkHash(API.changeWikibaseURLRoute)}>Change target Wikibase</NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title="Help" id="basic-nav-dropdown" className="mr-sm-2">
                            <NavDropdown.Item href="https://app.swaggerhub.com/apis-docs/labra/rdfshape/1.0.1">API
                                Docs</NavDropdown.Item>
                            <NavDropdown.Item
                                href="https://github.com/weso/wikishape/wiki/Help">Help</NavDropdown.Item>
                            <NavDropdown.Item href={mkHash(API.aboutRoute)}>About</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>) ;
}

export default WikishapeNavbar;
