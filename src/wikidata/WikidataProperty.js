import React, {useEffect, useState} from 'react';
import Container from 'react-bootstrap/Container';
import Alert from "react-bootstrap/Alert";
import InputPropertiesByText from "../components/InputPropertiesByText";
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

function WikidataProperty(props) {

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
                if (params.endpoint)
                    setEndpoint(params.endpoint)
                if (params.node) {
                    console.log("=====> PARAMS: ", params)
                    setEntities([{uri: params.node}]);
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
            setError(`No property selected`)
        }
    }

    function getOutgoing(cb) {
        setLoading(true);
        setProgressPercent(20)
        const params = {
            endpoint: endpoint,
            node: node
        }
        axios.get(ApiEndpoint,{
            params: params,
            headers: { 'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            }})
            .then (response => {
                setProgressPercent(70)
                return response.data
            })
            .then( async data => {
                setResult(data);
                setPermalink(await mkPermalink(API.wikidataOutgoingRoute, params));
                if (cb) cb()
                setProgressPercent(100)
            })
            .catch((error) => {
                console.log(`Error processing request: ${ApiEndpoint}: ${error.message}`);
                setError(`Error processing ${ApiEndpoint}: ${error.message}`);
            })
            .finally( () => setLoading(false));

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
        setProgressPercent(0)
        setEndpoint(API.currentEndpoint())
    }

    return (
       <Container>
         <h1>Info about wikidata properties</h1>
         <InputPropertiesByText onChange={handleChange} multiple={false} entities={entities} />
         <Table>
             <tbody>
                 { entities.map(e =>
                     <tr key={e.id || e.uri}>
                         <td>{e.label || 'Unknown label'}</td>
                         <td>{<a target={'_blank'} href={e.uri}>{e.uri}</a> || 'Unknown URI'}</td>
                         <td>{e.descr || 'No description provided'}</td>
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
          { loading ? <ProgressBar striped animated variant="info" now={progressPercent}/> : null }
          { permalink? <Permalink url={permalink} />: null }
          { error? <Alert variant="danger">${error}</Alert>: null }
         <ResultOutgoing result={result} />
       </Container>
    );
}

export default WikidataProperty;
