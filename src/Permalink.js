import React from 'react';
import Button from "react-bootstrap/Button";
import qs from 'query-string';
import FormData from "form-data";


export function mkPermalink(route, params) {
    console.log(`mkPermalink: ${JSON.stringify(params)}`)
    const newUrl = getHost() +
        // "#" + // This one is added for HashBrowser
        route + "?" + qs.stringify(params)
    console.log("mkPermalink newUrl: " + newUrl);
    return newUrl ;
}

export function params2Form(params) {
    let formData = new FormData();
    Object.keys(params).forEach(key => {
        formData.append(key, params[key]);
    });
    return formData;
}

function getHost() {
    let port = window.location.port;
    return window.location.protocol + "//" +
        window.location.hostname + (port? ":" + port: "");
}

export function Permalink(props) {
    if (props.url)
        return <Button variant="secondary" href={props.url}>Permalink</Button>;

    return null
}
