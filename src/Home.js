import React from 'react';
import Container from 'react-bootstrap/Container';

class Home extends React.Component {
 render() {
     return (
       <Container>
           <p>Wikishape is a playground customized for Wikidata and Wikibase instances</p>
           <p>If you want a more general RDF playground you can visit <a href="http://rdfshape.weso.es">RDFShape</a></p>
           <p>With Wikishape, you can do the following:</p>
           <ul>
               <li>Get information about entities, properties and entity schemas</li>
               <li>Visualize entity schemas</li>
               <li>Query entities</li>
               <li>Validate entities with entity schemas (ShEx)</li>
               <li>Extract/infer schemas from entities</li>
           </ul>
           <p>You can provide feedback or suggestions through <a href="https://github.com/weso/wikishape/issues">Github issues</a>.</p>
           <p>The source code is available <a href="https://github.com/weso/wikishape">here</a>.</p>
       </Container>
     );
 }
}

export default Home;
