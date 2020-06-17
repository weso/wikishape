import React from 'react';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import {showQualified, showQualify} from "../utils/Utils";
import { wikidataPrefixes} from "../resources/wikidataPrefixes";
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css';
import Alert from "react-bootstrap/Alert";

function ResultOutgoing(props) {
    const result = props.result
    let msg ;
     if (!result || result === '') {
         msg = null
     } else
     if (result.error) {
         msg =
             <div><Alert variant="danger">Error: {result.error}</Alert></div>
     } else {
         const outgoing = result.children.map(r => {
             const qualifiedPred = showQualify(r.pred,wikidataPrefixes);
             return  {
                 id: r.pred,
                 pred: showQualified(qualifiedPred, wikidataPrefixes),
                 prefPrefix: qualifiedPred.prefix,
                 localNamePrefix: qualifiedPred.localName,
                 values: r.values.map(v =>
                     showQualified(showQualify(v,wikidataPrefixes), wikidataPrefixes)
                )
             }
         });

         const columns = [{
             dataField: 'pred',
             text: 'Predicate',
             sort: true,
             sortFunc: (a, b, order, dataField, rowA, rowB) => {
                 if (!rowA.id || !rowB.id) return 0
                 let ret = 0
                 if (!rowA.id.includes("prop")) ret = 1
                 else if (!rowB.id.includes("prop")) ret = -1

                 else {
                     let idA = rowA.id.replace("/direct", "").split('prop/')[1]
                     let idB = rowB.id.replace("/direct", "").split('prop/')[1]
                     if (idA && idB) {
                         idA = idA.substring(1, idA.length - 1);
                         idB = idB.substring(1, idB.length - 1);
                         try {
                             idA = parseInt(idA)
                             idB = parseInt(idB)
                             if (idA > idB) ret = 1
                             if (idA < idB) ret = -1
                             else ret = rowA.id.localeCompare(rowB.id)
                         }
                         catch {
                             ret = 0
                         }
                     }
                     else ret = rowA.id.localeCompare(rowB.id)
                 }
                 // else ret = rowA.id.localeCompare(rowB.id)
                 // console.log(idA, idB)

                 if (order === 'asc') ret *=-1
                 return ret
             }
         }, {
             dataField: 'values',
             text: 'Value',
         }];

         msg = <div>
             <p>Link to entity: {showQualified(showQualify(result.node, wikidataPrefixes), wikidataPrefixes)}</p>
             <BootstrapTable keyField="id"
                             data={ outgoing }
                             columns={ columns }
                             bootstrap4
                             striped
                             hover
                             condensed
             />
             </div>
     }

     return (
         <div>
             { result && <details><pre>{JSON.stringify(result)}</pre></details> }
             {msg}
         </div>
     );
}

export default ResultOutgoing;
