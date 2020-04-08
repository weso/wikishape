import React from 'react';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import {showQualified, showQualify} from "../utils/Utils";
import { wikidataPrefixes} from "../resources/wikidataPrefixes";
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css';

function ResultOutgoing(props) {
     const result = props.result;
     let msg ;
     if (!result || result === '') {
         msg = null
     } else
     if (result.error) {
         msg =
             <div><p>Error: {result.error}</p>
                </div>
     } else {
         const outgoing = result.children.map(r => {
             const qualifiedPred = showQualify(r.pred,wikidataPrefixes);
             return {
                 pred: showQualified(qualifiedPred, wikidataPrefixes),
                 prefPrefix: qualifiedPred.prefix,
                 localNamePrefix: qualifiedPred.localName,
                 values: r.values.map(v => {
                     return (showQualified(showQualify(v,wikidataPrefixes), wikidataPrefixes))
                })
         }}) ;

         const customSort = (cell, row) => {
             console.log(`Cell: ${cell}, Row: ${row}`);
             return `${row.prefix}:${row.localName}:${row.value}`
         };

         const columns = [{
             dataField: 'pred',
             text: 'pred',
             sort: true,
             sortValue: customSort,
         }, {
             dataField: 'values',
             text: 'Value',
         }];

         msg = <div>
             <p>Endpoint: <a href={result.endpoint}>{result.endpoint}</a></p>
             <p><a href={result.node}>{showQualified(showQualify(result.node, wikidataPrefixes), wikidataPrefixes)}</a></p>
             <BootstrapTable keyField='id'
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
             {msg}
             { result && <details><pre>{JSON.stringify(result)}</pre></details> }
         </div>
     );
}

export default ResultOutgoing;
