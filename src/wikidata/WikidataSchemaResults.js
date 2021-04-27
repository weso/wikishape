import React, { Fragment } from "react";
import { Table } from "react-bootstrap";
import ExternalLinkIcon from "react-open-iconic-svg/dist/ExternalLinkIcon";
import { Permalink } from "../Permalink";
import ShExForm from "../shex/ShExForm";
import PrintSVG from "../utils/PrintSVG";

const WikidataSchemaResults = ({
  visual,
  schema,
  result,
  schema: { id, label, description, webUri, conceptUri, shexContent },
  permalink,
  disabled,
}) => {
  return (
    <Fragment>
      <Table>
        <tbody>
          <tr key={id}>
            <td>{label || "Unknown label"}</td>
            <td>
              {(
                <a target="_blank" rel="noopener noreferrer" href={webUri}>
                  {webUri}
                  <ExternalLinkIcon />
                </a>
              ) || "Unknown URI"}
            </td>
            <td>{description || "No description provided"}</td>
          </tr>
        </tbody>
      </Table>
      <div className="results-summary">
        <details>
          <pre>{JSON.stringify(schema)}</pre>
        </details>
        {permalink && <Permalink url={permalink} disabled={disabled} />}
      </div>
      <hr />
      {/* Return visualization or form depending on what was asked */}
      {visual ? (
        <div>
          {result ? <PrintSVG svg={result.svg} /> : null}
          <hr />
          <h4>Textual schema</h4>
          <ShExForm
            onChange={() => null}
            placeholder={""}
            readonly={true}
            value={shexContent}
          />
        </div>
      ) : (
        <ShExForm
          onChange={() => null}
          placeholder={""}
          readonly={true}
          value={shexContent}
        />
      )}
    </Fragment>
  );
};

WikidataSchemaResults.defaultProps = {
  disabled: false,
  visual: false,
};

export default WikidataSchemaResults;
