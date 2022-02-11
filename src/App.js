import React, { useEffect } from "react";
import Container from "react-bootstrap/Container";
import "./App.css";
import Routes from "./Routes.js";

function App() {
  useEffect(() => {
    document.title = "WikiShape";
  }, []);

  return (
    <Container fluid={true}>
      <Routes />
    </Container>
  );
}
export default App;
