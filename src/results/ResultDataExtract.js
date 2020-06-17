import React from 'react';
import Code from '../components/Code'
import Alert from "react-bootstrap/Alert";

function ResultDataExtract(props) {
     const result = props.result
     let msg ;
     if (!result) {
         msg = null
     } else
     if (result.error) {
         msg =
             <div><Alert variant="danger">Error: {result.error}</Alert></div>
     } else {
         msg = <div>
             <p>{<a target="_blank" href={result.entity}>{result.entity}</a>}</p>
             {result.result && (
                 <Code
                     value={result.result}
                     mode="ShExC"
                     readonly={true}
                     linenumbers={true}
                     theme="material"
                 />
             )}
         </div>
     }

     return (
         <div>
             {msg}
             { result && <details><pre>{JSON.stringify(result)}</pre></details> }
         </div>
     );
}

export default ResultDataExtract;
