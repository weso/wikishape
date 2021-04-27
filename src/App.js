import React, { useEffect } from "react";
import Container from "react-bootstrap/Container";
import "./App.css";
import Routes from "./Routes.js";
import WikiShapeNavbar from "./WikiShapeNavbar";

function App() {
  useEffect(() => {
    document.title = "WikiShape";
  }, []);

  return (
    <Container fluid={true}>
      <WikiShapeNavbar />
      <Routes />
    </Container>
  );
}
export default App;
