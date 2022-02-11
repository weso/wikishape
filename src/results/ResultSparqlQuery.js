import React, { Fragment, useEffect } from "react";
import { Alert } from "react-bootstrap";
import API from "../API";
import { Permalink } from "../Permalink";
import ShowQueryItems from "../query/ShowQueryItems";
import PrintJson from "../utils/PrintJson";
import { scrollToResults } from "../utils/Utils";

function ResultSparqlQuery({ result: serverResponse, permalink, disabled }) {
  // De-structure results
  const { message, data, query, result: queryResult } = serverResponse;

  const {
    head: { vars: resultColumns },
    results: { bindings: resultRows },
  } = queryResult;

  useEffect(scrollToResults, []);

  if (serverResponse) {
    return (
      <div id={API.resultsId}>
        {/* Warning if no results! */}
        {Array.isArray(resultRows) && resultRows.length === 0 ? (
          <Alert variant="warning">{API.texts.queryResults.noData}</Alert>
        ) : (
          <ShowQueryItems query={query} result={queryResult} />
        )}

        <details>
          <summary>{API.texts.responseSummaryText}</summary>
          <PrintJson json={serverResponse} />
        </details>
        {permalink && (
          <Fragment>
            <hr />
            <Permalink url={permalink} disabled={disabled} />
          </Fragment>
        )}
      </div>
    );
  }
}

export default ResultSparqlQuery;
