import React, { useState } from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import NotFound from './NotFound.js';
import About from './About.js';
import Home from './Home.js';
import API  from './API';
import WikidataValidate from './WikidataValidate';
import WikidataValidateSPARQL from './WikidataValidateSPARQL';
import WikidataQuery from './WikidataQuery';
import WikidataSchemaInfo from './WikidataSchemaInfo';
import WikidataSchemaVisual from './WikidataSchemaVisual';
import WikidataExtract from './WikidataExtract';
import WikidataOutgoing from './WikidataOutgoing';
import WikidataProperty from "./WikidataProperty";
import ChangeWikibaseURL from "./ChangeWikibaseURL";

function Routes() {

    return (
        <Router>
            <Switch>
                <Route path="/" exact component={Home}/>
                <Route path={API.aboutRoute} component={About}/>
                <Route path={API.wikidataSchemaInfoRoute} component={WikidataSchemaInfo}/>
                <Route path={API.wikidataSchemaVisualRoute} component={WikidataSchemaVisual}/>
                <Route path={API.wikidataQueryRoute} component={WikidataQuery}/>
                <Route path={API.wikidataValidateRoute} component={WikidataValidate}/>
                <Route path={API.wikidataExtractRoute} component={WikidataExtract}/>
                <Route path={API.wikidataOutgoingRoute} component={WikidataOutgoing}/>
                <Route path={API.wikidataPropertyInfoRoute} component={WikidataProperty}/>
                <Route path={API.wikidataValidateSPARQLRoute} component={WikidataValidateSPARQL}/>
                <Route path={API.changeWikibaseURLRoute} component={ChangeWikibaseURL}/>
                <Route component={NotFound}/>
            </Switch>
        </Router>
    );
}

export default Routes;
