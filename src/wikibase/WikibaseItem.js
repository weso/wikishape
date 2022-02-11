import axios from "axios";
import PropTypes from "prop-types";
import qs from "query-string";
import React, { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import ProgressBar from "react-bootstrap/ProgressBar";
import { ReloadIcon } from "react-open-iconic-svg";
import API from "../API";
import InputEntitiesByText from "../components/InputEntitiesByText";
import InputPropertiesByText from "../components/InputPropertiesByText";
import { mkPermalinkLong } from "../Permalink";
import ResultOutgoing from "../results/ResultOutgoing";
import { mkError } from "../utils/ResponseError";

function WikibaseItem(props) {
  const [entities, setEntities] = useState([]);
  const [lastEntities, setLastEntities] = useState([]);
  const [node, setNode] = useState("");
  const [endpoint, setEndpoint] = useState(API.currentEndpoint());
  const [permalink, setPermalink] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const itemType = props[API.propNames.wbEntityTypes.propName];
  const urlServer = API.routes.server.dataOutgoing;

  useEffect(() => {
    if (props.location.search) {
      const queryParams = qs.parse(props.location.search);
      if (queryParams[API.queryParameters.wikibase.endpoint]) {
        setEndpoint(queryParams[API.queryParameters.wikibase.endpoint]);
      }
      if (queryParams[API.queryParameters.wikibase.entities]) {
        let entitiesFromUrl = [];
        try {
          entitiesFromUrl = JSON.parse(
            queryParams[API.queryParameters.wikibase.entities]
          );
        } catch (err) {
          setError(API.texts.errorParsingUrl);
        }
        setEntities(entitiesFromUrl);
        setLastEntities(entitiesFromUrl);
        if (entitiesFromUrl.length) setNode(entitiesFromUrl[0].uri);
      }
    }
  }, [props.location.search]);

  useEffect(() => {
    if (node) {
      // Remove results / errors / permalink from previous query
      resetState();
      // Update history
      setUpHistory();
      getOutgoing();
    }
  }, [node]);

  function handleChange(es) {
    setEntities(es);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (entities && entities.length > 0) {
      setNode(entities[0].uri);
    } else {
      resetState();
      setError("No entity selected");
    }
  }

  async function getOutgoing(cb) {
    setLoading(true);
    const params = {
      [API.queryParameters.wikibase.endpoint]: endpoint,
      [API.queryParameters.wikibase.node]: node,
    };

    setProgressPercent(30);

    try {
      const { data: entityOutgoing } = await axios.get(urlServer, { params });
      setProgressPercent(80);
      setResult(entityOutgoing);
      setPermalink(
        mkPermalinkLong(API.routes.client.wikibaseItem, {
          ...params,
          entities: JSON.stringify(entities),
        })
      );
    } catch (err) {
      setError(mkError(err, urlServer));
    } finally {
      setLoading(false);
    }
  }

  function setUpHistory() {
    // Store the last search URL in the browser history to allow going back
    if (
      lastEntities &&
      entities &&
      JSON.stringify(lastEntities) !== JSON.stringify(entities)
    ) {
      // eslint-disable-next-line no-restricted-globals
      history.pushState(
        null,
        document.title,
        mkPermalinkLong(API.routes.client.wikibaseItem, {
          [API.queryParameters.wikibase.entities]: JSON.stringify(lastEntities),
          [API.queryParameters.wikibase.endpoint]: endpoint,
        })
      );
    }
    // Change current url for shareable links
    // eslint-disable-next-line no-restricted-globals
    history.replaceState(
      null,
      document.title,
      mkPermalinkLong(API.routes.client.wikibaseItem, {
        entities: JSON.stringify(entities),
        endpoint: endpoint,
      })
    );

    setLastEntities(entities);
  }

  function resetState() {
    setResult(null);
    setPermalink(null);
    setError(null);
    setEndpoint(API.currentEndpoint());
    setProgressPercent(0);
  }

  return (
    <Container>
      <h1>
        {itemType === API.propNames.wbEntityTypes.item
          ? API.texts.pageHeaders.entityInfo
          : API.texts.pageHeaders.propertyInfo}
      </h1>
      <h4>
        Target Wikibase:{" "}
        <a target="_blank" rel="noopener noreferrer" href={API.currentUrl()}>
          {API.currentUrl()}
        </a>
      </h4>

      {itemType === API.propNames.wbEntityTypes.item ? (
        <InputEntitiesByText
          onChange={handleChange}
          multiple={false}
          entities={entities}
        />
      ) : (
        <InputPropertiesByText
          onChange={handleChange}
          multiple={false}
          entities={entities}
        />
      )}

      <Form onSubmit={handleSubmit} style={{ marginBottom: "10px" }}>
        <Button
          className={"btn-with-icon " + (loading ? "disabled" : "")}
          variant="primary"
          type="submit"
          disabled={loading}
        >
          {API.texts.actionButtons.getOutgoing}
          <ReloadIcon className="white-icon" />
        </Button>
      </Form>
      {loading ? (
        <ProgressBar striped animated variant="info" now={progressPercent} />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : result ? (
        <ResultOutgoing
          entities={entities}
          result={result}
          permalink={permalink}
        />
      ) : null}
    </Container>
  );
}

WikibaseItem.propTypes = {
  // Whether to search for items, properties, etc. in the form
  [API.propNames.wbEntityTypes.propName]: PropTypes.string.isRequired,
};

WikibaseItem.defaultProps = {
  [API.propNames.wbEntityTypes.propName]: API.propNames.wbEntityTypes.item,
};

export default WikibaseItem;
