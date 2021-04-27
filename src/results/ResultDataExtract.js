import React from "react";
import { Table } from "react-bootstrap";
import Alert from "react-bootstrap/Alert";
import ExternalLinkIcon from "react-open-iconic-svg/dist/ExternalLinkIcon";
import Code from "../components/Code";
import { Permalink } from "../Permalink";

function ResultDataExtract({ result, entities, permalink, disabled }) {
  let msg;
  if (!result) {
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
    msg = (
      <div>
        <Table>
          <tbody>
            {entities.map((e) => (
              <tr key={e.id || e.uri}>
                <td>{e.label || "Unknown label"}</td>
                <td>
                  {(
                    <a target="_blank" rel="noopener noreferrer" href={e.uri}>
                      {e.uri}
                      <ExternalLinkIcon />
                    </a>
                  ) || "Unknown URI"}
                </td>
                <td>{e.descr || "No description provided"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="results-summary">
          <details>
            <pre>{JSON.stringify(result)}</pre>
          </details>
          {permalink && <Permalink url={permalink} disabled={disabled} />}
        </div>
        {result.result && (
          <Code
            value={result.result}
            mode="ShExC"
            readonly={true}
            linenumbers={true}
            theme="material"
          />
        )}
      </div>
    );
  }

  return <div>{msg}</div>;
}

ResultDataExtract.defaultProps = {
  disabled: false,
};

export default ResultDataExtract;
