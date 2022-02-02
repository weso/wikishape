import PropTypes from "prop-types";
import React, { Fragment, useEffect, useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import API from "../API";
import { Permalink } from "../Permalink";
import ShExForm from "../shex/ShexForm";
import PrintJson from "../utils/PrintJson";
import { mkInlineSvg } from "../utils/shumlex/shumlexUtils";
import { prefixMapTableColumns } from "../utils/Utils";
import ShowVisualization, {
  visualizationTypes
} from "../utils/visualization/ShowVisualization";

const WikibaseSchemaResults = ({
  result: apiResponse,
  permalink,
  disabled,
  doUml,
}) => {
  // For cases where the UML is created, have it in state
  const [svgUml, setSvgUml] = useState(null);

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

  if (apiResponse) {
    return (
      <div id="results-container">
        <Fragment>
          <div className="results-summary">
            {permalink && <Permalink url={permalink} disabled={disabled} />}
          </div>
          <hr />
          {/* Return visualization, form and prefix map */}

          <Tabs activeKey={resultTab} id="resultTabs" onSelect={setResultTab}>
            {/* Schema text */}
            {shexContent && (
              <Tab eventKey={API.tabs.text} title="Textual">
                <ShExForm
                  onChange={() => null}
                  placeholder={""}
                  readonly={true}
                  value={shexContent}
                />
              </Tab>
            )}
            {/* Schema visualize */}
            {schemaSvg && (
              <Tab eventKey={API.tabs.visualization} title="Visualization">
                {/* <PrintSVG svg={schemaSvg} controls={true} /> */}
                <ShowVisualization
                  data={schemaSvg}
                  type={visualizationTypes.svgRaw}
                  raw={false}
                  controls={true}
                  embedLink={false}
                  disabledLinks={disabled}
                />
              </Tab>
            )}
            {/* Schema prefix map */}
            {prefixMap && (
              <Tab eventKey={API.tabs.prefixMap} title="Prefix Map">
                <BootstrapTable
                  classes="results-table"
                  keyField="prefixName"
                  data={prefixMap}
                  columns={prefixMapTableColumns}
                ></BootstrapTable>
              </Tab>
            )}
            {/* Schema UML */}
            {schemaSvg && doUml && (
              <Tab
                eventKey={API.tabs.uml}
                title="UML"
                onEnter={() => !svgUml && setSvgUml(mkInlineSvg(shexContent))}
              >
                <ShowVisualization
                  data={svgUml}
                  type={visualizationTypes.svgRaw}
                  raw={false}
                  controls={true}
                  embedLink={false}
                  disabledLinks={disabled}
                />
              </Tab>
            )}
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

WikibaseSchemaResults.propTypes = {
  result: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  doUml: PropTypes.bool,
};

WikibaseSchemaResults.defaultProps = {
  disabled: false,
  doUml: true,
};

export default WikibaseSchemaResults;
