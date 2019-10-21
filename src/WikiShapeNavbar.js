import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import API from './API.js'


class WikishapeNavbar extends React.Component {

    render() {
        return (
            <Navbar bg="primary" expand="md" filled="true" variant="dark">
                <Navbar.Brand href="/">WikiShape</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav>
                        <NavDropdown title="Wikidata" id="basic-nav-dropdown">
                            <NavDropdown.Item href="/wikidataSchemaInfo">Info about schema entities</NavDropdown.Item>
                            <NavDropdown.Item href="/wikidataSchemaVisual">Visualize schema entities</NavDropdown.Item>
                            <NavDropdown.Item href="/wikidataValidate">Validate entities</NavDropdown.Item>
                            <NavDropdown.Item href="/wikidataValidateSPARQL">Validate entities obtained from SPARQL queries</NavDropdown.Item>
                            <NavDropdown.Item href="/wikidataQuery">Query endpoint</NavDropdown.Item>
                            <NavDropdown.Item href="/wikidataExtract">Extract schema from entity</NavDropdown.Item>
                            <NavDropdown.Item href="/wikidataOutgoing">Outgoing arcs of entity</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav>
                        <NavDropdown title="Help" id="basic-nav-dropdown" className="mr-sm-2">
                            <NavDropdown.Item href="https://app.swaggerhub.com/apis-docs/labra/rdfshape/1.0.1">API
                                Docs</NavDropdown.Item>
                            <NavDropdown.Item
                                href="https://github.com/labra/rdfshape/wiki/RDFShape---Help">Help</NavDropdown.Item>
                            <NavDropdown.Item href="/about">About</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}

export default WikishapeNavbar;
