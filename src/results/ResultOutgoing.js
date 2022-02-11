import React, { Fragment, useEffect } from "react";
import { Table } from "react-bootstrap";
import BootstrapTable from "react-bootstrap-table-next";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css";
import Alert from "react-bootstrap/Alert";
import ExternalLinkIcon from "react-open-iconic-svg/dist/ExternalLinkIcon";
import API from "../API";
import { Permalink } from "../Permalink";
import { wikidataPrefixes } from "../resources/wikidataPrefixes";
import PrintJson from "../utils/PrintJson";
import { scrollToResults, showQualified, showQualify } from "../utils/Utils";

function ResultOutgoing({ entities, result, permalink, disabled }) {
  // Scroll results into view
  useEffect(scrollToResults, []);

  let msg;
  if (!result || result === "") {
    msg = null;
  } else if (result.error) {
    msg = (
      <div>
        <Alert variant="danger">Error: {result.error}</Alert>
        <details>
          <pre>{JSON.stringify(result)}</pre>
        </details>
      </div>
    );
  } else {
    const outgoing = result.children.map((resultItem, idx) => {
      const qualifiedPred = showQualify(resultItem.pred, wikidataPrefixes);
      return {
        id: resultItem.pred,
        pred: showQualified(qualifiedPred, wikidataPrefixes),
        prefPrefix: qualifiedPred.prefix,
        localNamePrefix: qualifiedPred.localName,
        values: resultItem.values.map((v) =>
          showQualified(showQualify(v, wikidataPrefixes), wikidataPrefixes)
        ),
      };
    });

    const columns = [
      {
        dataField: "pred",
        text: "Predicate",
        sort: true,
        sortFunc: (a, b, order, dataField, rowA, rowB) => {
          if (!rowA.id || !rowB.id) return 0;
          let ret = 0;
          if (!rowA.id.includes("prop")) ret = 1;
          else if (!rowB.id.includes("prop")) ret = -1;
          else {
            let idA = rowA.id.replace("/direct", "").split("prop/")[1];
            let idB = rowB.id.replace("/direct", "").split("prop/")[1];
            if (idA && idB) {
              idA = idA.substring(1, idA.length - 1);
              idB = idB.substring(1, idB.length - 1);
              try {
                idA = parseInt(idA);
                idB = parseInt(idB);
                if (idA > idB) ret = 1;
                if (idA < idB) ret = -1;
                else ret = rowA.id.localeCompare(rowB.id);
              } catch {
                ret = 0;
              }
            } else ret = rowA.id.localeCompare(rowB.id);
          }

          if (order === "asc") ret *= -1;
          return ret;
        },
      },
      {
        dataField: "values",
        text: "Value",
      },
    ];

    msg = (
      <div id={API.resultsId}>
        <Fragment>
          <Table>
            <tbody>
              {entities.map(({ id, uri, label, descr }) => (
                <tr key={id || uri}>
                  <td>{label || "Unknown label"}</td>
                  <td>
                    {(
                      <a target="_blank" rel="noopener noreferrer" href={uri}>
                        {uri}
                        <ExternalLinkIcon />
                      </a>
                    ) || "Unknown URI"}
                  </td>
                  <td>{descr || "No description provided"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div id="results-summary">
            {permalink && <Permalink url={permalink} disabled={disabled} />}
          </div>

          <BootstrapTable
            keyField={"id"}
            data={outgoing}
            columns={columns}
            bootstrap4
            striped
            hover
            condensed
            classes="results-table"
          />

          <details>
            <summary>{API.texts.responseSummaryText}</summary>
            <PrintJson json={result} />
          </details>
        </Fragment>
      </div>
    );
  }

  return <div>{msg}</div>;
}

ResultOutgoing.defaultProps = {
  disabled: false,
};

export default ResultOutgoing;
