import React from 'react';
import Container from 'react-bootstrap/Container';

class Home extends React.Component {
 render() {
     return (
       <Container>
           <p>Wikishape is Shape Expressions playground customized for Wikidata</p>
           <p>If you want a more general RDF playground you can visit <a href="http://rdfshape.weso.es">RDFShape</a></p>
           <p>With Wikishape, you can do the following:</p>
           <ul>
               <li>Validate Wikidata entities with wikidata schemas</li>
               <li>Get information about Wikidata schemas</li>
               <li>Visualize Wikidata schemas</li>
               <li>Query Wikidata entities</li>
           </ul>
           <p>You can provide feedback or suggestions through <a href="https://github.com/weso/wikishape/issues">Github issues</a></p>
           <p>The source code is available <a href="https://github.com/weso/wikishape">here</a></p>
       </Container>
     );
 }
}

export default Home;
