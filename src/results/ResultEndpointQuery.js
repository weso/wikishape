import React, {useState} from 'react';
import BootstrapTable from "react-bootstrap-table-next";
import {cnvValueFromSPARQL, showQualified, showQualify} from "../utils/Utils";
import {wikidataPrefixes} from "../resources/wikidataPrefixes";

function ResultEndpointInfo(props) {
    const [table] = useState(parseData(props.result));

    function parseData(data) {
        if (data.head && data.head.vars && data.head.vars.length) {
            const vars = data.head.vars;
            const columns = vars.map(v => {
                return {
                    dataField: v,
                    text: v,
                    sort: true
                }});
            const rows = data.results.bindings.map( (binding,idx) => {
                let row = {_id: idx};

                for (const v of vars){
                    const b = binding[v];
                    const converted = cnvValueFromSPARQL(b);
                    // const cleanPrefixes = ["wd","wdt"];
                    const qualify = showQualify(converted, wikidataPrefixes);
                    row[v] = showQualified(qualify, wikidataPrefixes)
                }
                return row;
            });
            return {
                columns: columns,
                rows: rows
            }
        } else {
            return [];
        }
    }

    return (
        <BootstrapTable
            keyField='_id'
            data={table.rows}
            columns={table.columns}
            bootstrap4
            striped
            hover
            condensed />
    )
}

export default ResultEndpointInfo;
