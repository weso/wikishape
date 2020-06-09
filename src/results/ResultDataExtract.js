import React from 'react';
import Code from '../components/Code'

function ResultDataExtract(props) {
     const result = props.result
     let msg ;
     if (!result) {
         msg = null
     } else
     if (result.error) {
         msg =
             <div><p>Error: {result.error}</p>
                </div>
     } else {
         msg = <div>
             <p>{result.entity}</p>
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
