import React, { Fragment, useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import BootstrapTable from "react-bootstrap-table-next";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import ExternalLinkIcon from "react-open-iconic-svg/dist/ExternalLinkIcon";
import API from "../API";
import { Permalink } from "../Permalink";
import ShExForm from "../shex/ShexForm";
import PrintJson from "../utils/PrintJson";
import PrintSVG from "../utils/PrintSVG";
import { prefixMapTableColumns } from "../utils/Utils";

const WikibaseSchemaResults = ({
  result: apiResponse,
  schema: localSchemaData,
  permalink,
  disabled,
}) => {
  // Scroll results into view
  useEffect(() => {
    const resultElement = document.getElementById("results-container");
    resultElement &&
      resultElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const [resultTab, setResultTab] = useState(API.tabs.text);

  const {
    message,
    schema: { schema: shexContent },
    result: {
      format: { name: schemaFormat },
      schema: schemaSvg,
      prefixMap,
    },
  } = apiResponse;

  const { id, label, descr: description, webUri } = localSchemaData;

  if (apiResponse) {
    return (
      <div id="results-container">
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
            {permalink && <Permalink url={permalink} disabled={disabled} />}
          </div>
          <hr />
          {/* Return visualization, form and prefix map */}

          <Tabs activeKey={resultTab} id="resultTabs" onSelect={setResultTab}>
            <Tab eventKey={API.tabs.text} title="Textual">
              <ShExForm
                onChange={() => null}
                placeholder={""}
                readonly={true}
                value={shexContent}
              />
            </Tab>
            <Tab eventKey={API.tabs.visualization} title="Visualization">
              <PrintSVG svg={schemaSvg} />
            </Tab>
            <Tab eventKey={API.tabs.prefixMap} title="Prefix Map">
              <BootstrapTable
                classes="results-table"
                keyField="prefixName"
                data={prefixMap}
                columns={prefixMapTableColumns}
              ></BootstrapTable>
            </Tab>
          </Tabs>
          <hr />
          <details>
            <summary>{API.texts.responseSummaryText}</summary>
            <PrintJson json={apiResponse} />
          </details>
        </Fragment>
      </div>
    );
  }
};

WikibaseSchemaResults.defaultProps = {
  disabled: false,
};

export default WikibaseSchemaResults;
