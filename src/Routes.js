import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import About from "./About.js";
import API from "./API";
import "./App.css";
import VisualizeRaw from "./components/VisualizeRaw";
import Home from "./Home.js";
import NotFound from "./NotFound.js";
import PermalinkReceiver from "./PermalinkReceiver.js";
import ChangeWikibaseURL from "./settings/ChangeWikibaseURL";
import WikibaseExtract from "./wikibase/WikibaseExtract";
import WikibaseItem from "./wikibase/WikibaseItem";
import WikibaseQuery from "./wikibase/WikibaseQuery";
import WikibaseSchemaInfo from "./wikibase/WikibaseSchemaInfo";
import WikibaseValidate from "./wikibase/WikibaseValidate";
import WikibaseValidateSparql from "./wikibase/WikibaseValidateSparql.js";
import WikishapeNavbar from "./WikiShapeNavbar.js";

function Routes() {
  const renderWithNavbar = (Component, props) => {
    return (
      <>
        <WikishapeNavbar />
        {renderWithoutNavbar(Component, props)}
      </>
    );
  };

  const renderWithoutNavbar = (Component, props) => {
    // eslint-disable-next-line no-restricted-globals
    const loc = location;
    return <Component location={loc} {...props} />;
  };

  return (
    <Router basename="/">
      <Switch>
        <Route path="/" exact render={() => renderWithNavbar(Home)} />
        <Route
          path={API.routes.client.about}
          render={() => renderWithNavbar(About)}
        />
        <Route
          path={API.routes.client.wikibaseItem}
          render={() =>
            renderWithNavbar(WikibaseItem, {
              [API.propNames.wbEntityTypes.propName]:
                API.propNames.wbEntityTypes.item,
            })
          }
        />
        <Route
          path={API.routes.client.wikibasePropertyInfo}
          render={() =>
            renderWithNavbar(WikibaseItem, {
              [API.propNames.wbEntityTypes.propName]:
                API.propNames.wbEntityTypes.property,
            })
          }
        />
        <Route
          path={API.routes.client.wikibaseSchemaInfo}
          render={() => renderWithNavbar(WikibaseSchemaInfo)}
        />
        <Route
          path={API.routes.client.wikibaseQuery}
          render={() => renderWithNavbar(WikibaseQuery)}
        />
        <Route
          path={API.routes.client.wikibaseValidate}
          render={() => renderWithNavbar(WikibaseValidate)}
        />
        <Route
          path={API.routes.client.wikibaseExtract}
          render={() =>
            renderWithNavbar(WikibaseExtract, {
              [API.propNames.useShexer]: false,
            })
          }
        />
        {/* Omitted SheXer functionality */}
        {/* <Route
          path={API.routes.client.wikibaseSheXer}
          render={() =>
            renderWithNavbar(WikibaseExtract, {
              [API.propNames.useShexer]: true,
            })
          }
        /> */}
        <Route
          path={API.routes.client.wikibaseValidateSparql}
          render={() => renderWithNavbar(WikibaseValidateSparql)}
        />
        <Route
          path={API.routes.client.changeWikibaseInputUrl}
          render={() => renderWithNavbar(ChangeWikibaseURL)}
        />
        {/* Raw visualizations for embeddings */}
        <Route
          path={API.routes.client.visualizeRawRoute}
          render={() => renderWithoutNavbar(VisualizeRaw)}
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
