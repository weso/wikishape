import React from 'react';
import './App.css';
import WikiShapeNavbar from "./WikiShapeNavbar";
import Container from 'react-bootstrap/Container';
import Routes from './Routes.js';
import API from "./API";

function App() {

  return (
      <Container fluid={true}>
        <WikiShapeNavbar />
        <Routes />
      </Container>
  );
}
export default App;
