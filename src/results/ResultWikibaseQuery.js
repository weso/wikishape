import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import API from "../API";
import { Permalink } from "../Permalink";
import { wikidataPrefixes } from "../resources/wikidataPrefixes";
import PrintJson from "../utils/PrintJson";
import { cnvValueFromSPARQL, scrollToResults, showQualified, showQualify } from "../utils/Utils";

function ResultWikibaseQuery({ result: serverResponse, permalink, disabled }) {
  // Destructure API response
  const { operationData, wikibase, result: queryResult } = serverResponse;
  const {
    head,
    results: { bindings: queryResultBindings },
  } = queryResult;

  const [table] = useState(parseData());

  // Scroll results into view
  useEffect(scrollToResults, []);

  // From the wikibase response, return a object with the rows and columns
  // of the result's table
  function parseData() {
    if (head?.vars?.length) {
      const vars = head.vars;
      const columns = vars.map((v) => {
        return {
          dataField: v,
          text: v,
          sort: true,
        };
      });
      const rows = queryResultBindings.map((binding, idx) => {
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

  if (serverResponse) {
    return (
      <>
        <div id="results-summary">
          {permalink && <Permalink url={permalink} disabled={disabled} />}
        </div>
        <hr />
        <div id="results">
          <BootstrapTable
            keyField="_id"
            data={table?.rows}
            columns={table?.columns}
            bootstrap4
            striped
            hover
            condensed
            classes="results-table"
          />
        </div>
        <details>
          <summary>{API.texts.responseSummaryText}</summary>
          <PrintJson json={serverResponse} />
        </details>
      </>
    );
  }
}

ResultWikibaseQuery.propTypes = {
  result: PropTypes.object.isRequired,
  permalink: PropTypes.string,
  disabled: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
};

ResultWikibaseQuery.defaultProps = {
  disabled: false,
};

export default ResultWikibaseQuery;
