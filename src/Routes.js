import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import About from "./About.js";
import API from "./API";
import "./App.css";
import Home from "./Home.js";
import NotFound from "./NotFound.js";
import PermalinkReceiver from "./PermalinkReceiver.js";
import ChangeWikibaseURL from "./settings/ChangeWikibaseURL";
import WikidataExtract from "./wikidata/WikidataExtract";
import WikidataOutgoing from "./wikidata/WikidataOutgoing";
import WikidataProperty from "./wikidata/WikidataProperty";
import WikidataQuery from "./wikidata/WikidataQuery";
import WikidataSchemaInfo from "./wikidata/WikidataSchemaInfo";
import WikidataSchemaVisual from "./wikidata/WikidataSchemaVisual";
import WikidataSheXer from "./wikidata/WikidataSheXer";
import WikidataValidate from "./wikidata/WikidataValidate";
import WikidataValidateDeref from "./wikidata/WikidataValidateDeref";
import WikidataValidateSPARQL from "./wikidata/WikidataValidateSPARQL";

function Routes() {
  return (
    <Router basename="/">
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path={API.aboutRoute} component={About} />
        <Route
          path={API.wikidataSchemaInfoRoute}
          component={WikidataSchemaInfo}
        />
        <Route
          path={API.wikidataSchemaVisualRoute}
          component={WikidataSchemaVisual}
        />
        <Route path={API.wikidataQueryRoute} component={WikidataQuery} />
        <Route path={API.wikidataValidateRoute} component={WikidataValidate} />
        <Route
          path={API.wikidataValidateDerefRoute}
          component={WikidataValidateDeref}
        />
        <Route path={API.wikidataExtractRoute} component={WikidataExtract} />
        <Route path={API.wikidataSheXerRoute} component={WikidataSheXer} />
        <Route path={API.wikidataOutgoingRoute} component={WikidataOutgoing} />
        <Route
          path={API.wikidataPropertyInfoRoute}
          component={WikidataProperty}
        />
        <Route
          path={API.wikidataValidateSPARQLRoute}
          component={WikidataValidateSPARQL}
        />
        <Route
          path={API.changeWikibaseURLRoute}
          component={ChangeWikibaseURL}
        />
        <Route path={API.permalinkRoute} component={PermalinkReceiver} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

export default Routes;
