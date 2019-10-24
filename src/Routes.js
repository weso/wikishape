import React from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import NotFound from './NotFound.js';
import About from './About.js';
import Home from './Home.js';

import WikidataValidate from './WikidataValidate';
import WikidataValidateSPARQL from './WikidataValidateSPARQL';
import WikidataQuery from './WikidataQuery';
import WikidataSchemaInfo from './WikidataSchemaInfo';
import WikidataSchemaVisual from './WikidataSchemaVisual';
import WikidataExtract from './WikidataExtract';
import WikidataOutgoing from './WikidataOutgoing';
import WikidataProperty from "./WikidataProperty";

function Routes() {

    return (
        <Router>
            <Switch>
                <Route path="/" exact component={Home}/>
                <Route path="/wikidataSchemaInfo" component={WikidataSchemaInfo}/>
                <Route path="/wikidataSchemaVisual" component={WikidataSchemaVisual}/>
                <Route path="/wikidataQuery" component={WikidataQuery}/>
                <Route path="/wikidataValidate" component={WikidataValidate}/>
                <Route path="/wikidataExtract" component={WikidataExtract}/>
                <Route path="/wikidataOutgoing" component={WikidataOutgoing}/>
                <Route path="/wikidataPropertyInfo" component={WikidataProperty}/>
                <Route path="/about" component={About}/>
                <Route path="/wikidataValidateSPARQL" component={WikidataValidateSPARQL}/>
                <Route component={NotFound}/>
            </Switch>
        </Router>
    );
}

export default Routes;
