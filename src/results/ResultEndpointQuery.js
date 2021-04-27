import React, { Fragment, useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import { Permalink } from "../Permalink";
import { wikidataPrefixes } from "../resources/wikidataPrefixes";
import { cnvValueFromSPARQL, showQualified, showQualify } from "../utils/Utils";

function ResultEndpointQuery({ result, permalink, disabled }) {
  const [table] = useState(parseData(result));

  function parseData(data) {
    if (data.head && data.head.vars && data.head.vars.length) {
      const vars = data.head.vars;
      const columns = vars.map((v) => {
        return {
          dataField: v,
          text: v,
          sort: true,
        };
      });
      const rows = data.results.bindings.map((binding, idx) => {
        let row = { _id: idx };

        for (const v of vars) {
          const b = binding[v];
          const converted = cnvValueFromSPARQL(b);
          // const cleanPrefixes = ["wd","wdt"];
          const qualify = showQualify(converted, wikidataPrefixes);
          row[v] = showQualified(qualify, wikidataPrefixes);
        }
        return row;
      });
      return {
        columns: columns,
        rows: rows,
      };
    } else {
      return [];
    }
  }

  return (
    <Fragment>
      <hr />
      {permalink && <Permalink url={permalink} disabled={disabled} />}
      <BootstrapTable
        keyField="_id"
        data={table.rows}
        columns={table.columns}
        bootstrap4
        striped
        hover
        condensed
        classes="results-table"
      />
    </Fragment>
  );
}

ResultEndpointQuery.defaultProps = {
  disabled: false,
  visual: false,
};

export default ResultEndpointQuery;
