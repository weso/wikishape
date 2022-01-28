import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import About from "./About.js";
import API from "./API";
import "./App.css";
import Home from "./Home.js";
import NotFound from "./NotFound.js";
import PermalinkReceiver from "./PermalinkReceiver.js";
import ChangeWikibaseURL from "./settings/ChangeWikibaseURL";
import WikibaseExtract from "./wikibase/WikibaseExtract";
import WikibaseItem from "./wikibase/WikibaseItem";
import WikibaseQuery from "./wikibase/WikibaseQuery";
import WikibaseSchemaInfo from "./wikibase/WikibaseSchemaInfo";
import WikibaseSheXer from "./wikibase/WikibaseSheXer";
import WikibaseValidate from "./wikibase/WikibaseValidate";
import WikibaseValidateSparql from "./wikibase/WikibaseValidateSparql.js";

function Routes() {
  const renderComponent = (Component, props) => {
    // eslint-disable-next-line no-restricted-globals
    const loc = location;
    return (
      <>
        <Component location={loc} {...props} />
      </>
    );
  };

  return (
    <Router basename="/">
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path={API.routes.client.about} component={About} />
        <Route
          path={API.routes.client.wikibaseItem}
          render={() =>
            renderComponent(WikibaseItem, {
              [API.wbEntityTypes.propName]: API.wbEntityTypes.item,
            })
          }
        />
        <Route
          path={API.routes.client.wikibasePropertyInfo}
          render={() =>
            renderComponent(WikibaseItem, {
              [API.wbEntityTypes.propName]: API.wbEntityTypes.property,
            })
          }
        />
        <Route
          path={API.routes.client.wikibaseSchemaInfo}
          component={WikibaseSchemaInfo}
        />
        <Route
          path={API.routes.client.wikibaseQuery}
          component={WikibaseQuery}
        />
        <Route
          path={API.routes.client.wikibaseValidate}
          component={WikibaseValidate}
        />
        <Route
          path={API.routes.client.wikibaseExtract}
          component={WikibaseExtract}
        />
        <Route
          path={API.routes.client.wikibaseSheXer}
          component={WikibaseSheXer}
        />

        <Route
          path={API.routes.client.wikibaseValidateSparql}
          component={WikibaseValidateSparql}
        />
        <Route
          path={API.routes.client.changeWikibaseInputUrl}
          component={ChangeWikibaseURL}
        />
        <Route
          path={API.routes.client.permalink}
          component={PermalinkReceiver}
        />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

export default Routes;
