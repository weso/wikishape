import React, {useEffect} from 'react';
import './App.css';
import WikiShapeNavbar from "./WikiShapeNavbar";
import Container from 'react-bootstrap/Container';
import Routes from './Routes.js';

function App() {

  useEffect(() => {
      document.title = "WikiShape";
  }, [])

  return (
      <Container fluid={true}>
        <WikiShapeNavbar />
        <Routes />
      </Container>
  );
}
export default App;
