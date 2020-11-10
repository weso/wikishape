import React from 'react';
import PropTypes from "prop-types";
import BootstrapTable from "react-bootstrap-table-next";
import {parseData} from "./ParseQueryResult";
import {wikidataPrefixes} from "../resources/wikidataPrefixes";


function ResultQuery(props)  {
    const result = props.result;
    console.log("ResultQuery " + JSON.stringify(result));
    let msg ;
    if (!result || result === '') {
        msg = null
    } else
    if (result.result.error) {
        msg =
            <div><p>Error: {result.result.error}</p>
                <details><pre>{JSON.stringify(result)}</pre></details>
            </div>
    } else {
        const table = parseData(result.result, wikidataPrefixes);
//      console.log(`ResultQuery. Table = ${JSON.stringify(table)}`);
        msg = <div>
            <BootstrapTable
                keyField='_id'
                data={table.rows}
                columns={table.columns}
                bootstrap4
                striped
                hover
                condensed />
            <p>{result.msg}</p>
            <details><pre>{JSON.stringify(result)}</pre></details>
        </div>
    }

    return (
        <div>
            {msg}
        </div>
    );
}

ResultQuery.propTypes = {
    result: PropTypes.object.isRequired,
};

export default ResultQuery;
