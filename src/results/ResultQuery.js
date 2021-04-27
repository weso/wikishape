import PropTypes from "prop-types";
import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import { wikidataPrefixes } from "../resources/wikidataPrefixes";
import { parseData } from "./ParseQueryResult";

function ResultQuery(props) {
  const result = props.result;
  let msg;
  if (!result || result === "") {
    msg = null;
  } else if (result.result.error) {
    msg = (
      <div>
        <p>Error: {result.result.error}</p>
        <details>
          <pre>{JSON.stringify(result)}</pre>
        </details>
      </div>
    );
  } else {
    const table = parseData(result.result, wikidataPrefixes);
    msg = (
      <div>
        <BootstrapTable
          keyField="_id"
          data={table.rows}
          columns={table.columns}
          bootstrap4
          striped
          hover
          condensed
        />
        <p>{result.msg}</p>
        <details>
          <pre>{JSON.stringify(result)}</pre>
        </details>
      </div>
    );
  }

  return <div>{msg}</div>;
}

ResultQuery.propTypes = {
  result: PropTypes.object.isRequired,
};

export default ResultQuery;
