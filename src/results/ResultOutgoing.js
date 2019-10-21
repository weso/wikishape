import React from 'react';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { showQualify } from "../Utils";
import { wikidataPrefixes} from "../resources/wikidataPrefixes";
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css';
import API from "../API";
import { ExternalLinkIcon } from 'react-open-iconic-svg';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';

const internalPrefixes = ["prn", "prv", "pqv", "pq", "pr", "psn", "psv", "ps", "wdata", "wdno", "wdref", "wds", "wdt", "wdtn", "wdv", "wd", "p"]

function showQualified(qualified) {
    console.log(`showQualified`)
    switch (qualified.type) {
        case 'RelativeIRI': return <span>{qualified.str}</span>
        case 'QualifiedName':
            console.log(`QualifiedName: ${qualified.prefix}`)
            if (internalPrefixes.includes(qualified.prefix)) {
            return <fragment>
                <a href={API.wikidataOutgoingRoute + "?node=" + encodeURIComponent(qualified.uri)}>{qualified.str}</a>
                <a href={qualified.uri}><ExternalLinkIcon /></a>
            </fragment>
        } else {
            return <fragment>{qualified.str} <a href={qualified.uri}><ExternalLinkIcon/></a></fragment>
        }
        case 'FullIRI': return <a href={qualified.uri}>{qualified.str}</a>
        case 'Literal' : return <span>{qualified.str}</span>
        case 'LangLiteral' : return <span>{qualified.str}</span>
        default:
            console.log(`Unknown type for qualified value`)
            return <span>qualified.str</span>
    }
}

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
                 pred: showQualified(qualifiedPred),
                 prefPrefix: qualifiedPred.prefix,
                 localNamePrefix: qualifiedPred.localName,
                 values: r.values.map(v => {return showQualified(showQualify(v,wikidataPrefixes)) })
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
             <p><a href={result.node}>{showQualified(showQualify(result.node, wikidataPrefixes))}</a></p>
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
