import React, {useEffect, useState} from 'react';
import Container from 'react-bootstrap/Container';
import Alert from "react-bootstrap/Alert";
import InputEntitiesByText from "../components/InputEntitiesByText";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import API from "../API";
import {mkPermalink, mkPermalinkLong, Permalink} from "../Permalink";
import axios from "axios";
import ResultOutgoing from "../results/ResultOutgoing";
import qs from "query-string";
import {ReloadIcon} from "react-open-iconic-svg";
import ProgressBar from "react-bootstrap/ProgressBar";


function WikidataOutgoing(props) {

    const [entities,setEntities] = useState([]);
    const [node,setNode] = useState('');
    const [lastNode,setLastNode] = useState('');
    const [endpoint,setEndpoint] = useState(API.currentEndpoint);
    const [permalink,setPermalink] = useState('');
    const [result,setResult] = useState('');
    const [error,setError] = useState(null);
    const [loading,setLoading] = useState(false);
    const [progressPercent,setProgressPercent] = useState(0);

    const ApiEndpoint = API.dataOutgoing

    useEffect(() => {
            if (props.location.search) {
                const params = qs.parse(props.location.search);
                if (params.endpoint) {
                    setEndpoint(params.endpoint)
                }
                if (params.node) {
                    setEntities([
                        {
                            uri: params.node
                        }]
                    );
                    setNode(params.node)
                    setLastNode(params.node)
                } else {
                    setError(`No value for parameter node`)
                }
            }
        },
        [props.location.search]
    );

    useEffect( () => {
        if (node) {
            // Remove results / errors / permalink from previous query
            resetState()
            // Update history
            setUpHistory()
            getOutgoing()
        }
    }, [node])

    function handleChange(es) {
        setEntities(es);
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (entities && entities.length > 0 && entities[0].uri) {
            setNode(entities[0].uri)
        } else {
            setError(`No entity selected`)
        }
    }

    function getOutgoing(cb) {
        setLoading(true);
        const params = {
            endpoint: endpoint,
            node: node
        }
        setProgressPercent(30)
        axios.get(ApiEndpoint,{
            params: params,
            headers: { 'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            }})
            .then (response => {
                setProgressPercent(70)
                return response.data
            })
            .then(async (data) => {
                setResult(data)
                setProgressPercent(100)
                setPermalink(await mkPermalink(API.wikidataOutgoingRoute, params));
                if (cb) cb()
            })
            .catch((error) => {
                setError(`Error processing ${ApiEndpoint}: ${error.message}`)
            })
            .finally( () => setLoading(false) );

    }

    function setUpHistory() {
        // Store the last search URL in the browser history to allow going back
        if (lastNode && lastNode.localeCompare(node) !== 0){
            // eslint-disable-next-line no-restricted-globals
            history.pushState(null, document.title, mkPermalinkLong(API.wikidataOutgoingRoute, {
                node: lastNode,
                endpoint: endpoint
            }))
        }
        // Change current url for shareable links
        // eslint-disable-next-line no-restricted-globals
        history.replaceState(null, document.title ,mkPermalinkLong(API.wikidataOutgoingRoute, {
            node: node,
            endpoint: endpoint
        }))

        setLastNode(node)

    }

    function resetState() {
        setResult(null)
        setPermalink(null)
        setError(null)
        setEndpoint(API.currentEndpoint())
        setProgressPercent(0)
    }

    return (
       <Container>
         <h1>Outgoing arcs from Wikibase entity</h1>
           <h4>Target Wikibase: <a target="_blank" href={API.currentUrl()}>{API.currentUrl()}</a></h4>
         <InputEntitiesByText onChange={handleChange} multiple={false} entities={entities} />
         <Table>
             <tbody>
               { entities.map(e =>
                   <tr key={e.id || e.uri}>
                       <td>{e.label || "Unknown label"}</td>
                       <td>{<a target="_blank" href={e.uri}>{e.uri}</a> || "Unknown URI"}</td>
                       <td>{e.descr || "No description provided"}</td>
                   </tr>
                )
               }
             </tbody>
         </Table>
         <Form onSubmit={handleSubmit}>
               <Button className={"btn-with-icon " + (loading ? "disabled" : "")}
                       variant="primary" type="submit" disabled={loading}>
                   Get outgoing arcs
                   <ReloadIcon className="white-icon"/>
               </Button>
         </Form>
          {loading ? <ProgressBar striped animated variant="info" now={progressPercent}/> : null }
          {permalink? <Permalink url={permalink} />: null }
          { error? <Alert variant="danger">${error}</Alert>: null }
         <ResultOutgoing result={result} />
       </Container>
    );
}

export default WikidataOutgoing;
