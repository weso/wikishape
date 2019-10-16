import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import NotFound from './NotFound.js';
import About from './About.js';
import Home from './Home.js';

import WikidataValidate from './WikidataValidate.js';
import WikidataQuery from './WikidataQuery.js';
import WikidataSchemaInfo from './WikidataSchemaInfo.js';
import WikidataExtract from './WikidataExtract.js';
import API from './API.js';


function Routes() {

  return (
      <Router>
      <Switch>
      <Route path="/" exact component={Home} />
      <Route path={API.wikidataSchemaInfo} component={WikidataSchemaInfo} />
      <Route path={API.wikidataQueryRoute} component={WikidataQuery} />
      <Route path={API.wikidataValidateRoute} component={WikidataValidate} />
      <Route path={API.wikidataExtractRoute} component={WikidataExtract} />
      <Route path={API.aboutRoute} component={About} />

      <Route component={NotFound} />
      </Switch>
     </Router>
  );
}

export default Routes;
