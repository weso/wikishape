import React, {useEffect, useState} from 'react';
import Container from 'react-bootstrap/Container';
import Alert from "react-bootstrap/Alert";
import InputSchemaEntityByText from "./InputSchemaEntityByText";
import Table from "react-bootstrap/Table";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import DataTabs from "./DataTabs";
import Button from "react-bootstrap/Button";
import API from "./API";
import {mkPermalink, params2Form, Permalink} from "./Permalink";
import axios from "axios";
import ResultShExInfo from "./results/ResultShExInfo";
import Pace from "react-pace-progress";
import ShExForm from "./ShExForm";

function WikidataSchemaInfo(props) {
    const [permalink,setPermalink] = useState(null)
    const [shExContent,setShExContent] = useState(null);
    const [schemaId, setSchemaId] = useState('');
    const [schemaLabel, setSchemaLabel] = useState('');
    const [schemaDescr, setSchemaDescr] = useState('')
    const [schemaWebUri, setSchemaWebUri] = useState('');
    const [error,setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [schemaEntity,setSchemaEntity] = useState([]);

    function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        if (schemaEntity && schemaEntity.length) {
            const entity = schemaEntity[0];
            axios.get(entity.conceptUri)
                .then(result => result.data)
                .then(result => {
                    setLoading(false);
                    setSchemaId(entity.id);
                    setSchemaLabel(entity.label);
                    setSchemaDescr(entity.descr);
                    setSchemaWebUri(entity.webUri);
                    setShExContent(result)
                })
                .catch((error) => {
                    setLoading(false);
                    setError(`Error doing request to ${entity}`)
                });
        } else {
            setError("No entity selected")
        }
    }

    return (
       <Container>
         <h1>Info about Wikidata Schema entity</h1>
         <InputSchemaEntityByText onChange={setSchemaEntity} entity={schemaEntity} />
         <Form onSubmit={handleSubmit}>
               <Button variant="primary" type="submit">Info about schema entity</Button>
         </Form>
          {loading ? <Pace color="#27ae60"/> : null }
          { error? <Alert variant="danger">{error}</Alert>: null }
          { shExContent?
              <div>
                  <h1>{schemaId} - {schemaLabel}</h1>
                  <p>{schemaDescr}</p>
                  <p><code><a href={schemaWebUri}>{schemaWebUri}</a></code></p>
              <ShExForm onChange={()=>null} placeholder={''} readonly={true} value={shExContent} />
              </div>
              : null
          }
          { permalink? <Permalink url={permalink} />: null }
       </Container>
    );
}

export default WikidataSchemaInfo;
