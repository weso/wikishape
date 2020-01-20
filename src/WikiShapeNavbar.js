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
                        <NavDropdown title="Entity" id="basic-nav-dropdown">
                            <NavDropdown.Item href={API.wikidataOutgoingRoute}>Info about entity (outgoing arcs)</NavDropdown.Item>
                            <NavDropdown.Item href={API.wikidataValidateRoute} >Validate entities</NavDropdown.Item>
                            <NavDropdown.Item href={API.wikidataValidateSPARQLRoute}>Validate entities obtained from SPARQL queries</NavDropdown.Item>
                            <NavDropdown.Item href={API.wikidataExtractRoute}>Extract schema from entity</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav>
                        <NavDropdown title="Schema" id="basic-nav-dropdown">
                            <NavDropdown.Item href={API.wikidataSchemaInfoRoute}>Info about schema</NavDropdown.Item>
                            <NavDropdown.Item href={API.wikidataSchemaVisualRoute}>Visualize schema</NavDropdown.Item>
                            <NavDropdown.Item href={API.wikidataValidateRoute} >Validate entities</NavDropdown.Item>
                            <NavDropdown.Item href={API.wikidataValidateSPARQLRoute}>Validate entities obtained from SPARQL queries</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav>
                        <NavDropdown title="Property" id="basic-nav-dropdown">
                            <NavDropdown.Item href={API.wikidataPropertyInfoRoute}>Info about property</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav>
                        <NavDropdown title="Query" id="basic-nav-dropdown">
                            <NavDropdown.Item href={API.wikidataQueryRoute}>Query SPARQL endpoint</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav>
                        <NavDropdown title="Options" id="basic-nav-dropdown">
                            <NavDropdown.Item href={API.wikidataQueryRoute}>Change wikibase URL</NavDropdown.Item>
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
