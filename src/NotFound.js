import React from "react";
import Button from "react-bootstrap/Button";
import Jumbotron from "react-bootstrap/Jumbotron";

function NotFound() {
  return (
    <Jumbotron className={"white-background"}>
      <h1>Not found</h1>
      <Button variant="primary" href="/">
        Go Home
      </Button>
    </Jumbotron>
  );
}

export default NotFound;
