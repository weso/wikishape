import PropTypes from "prop-types";
import React, { Fragment, useEffect, useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import shumlex from "shumlex";
import API from "../API";
import ByText from "../components/ByText";
import { shaclEngines } from "../components/SelectEngine";
import { mkEmbedLink, Permalink } from "../Permalink";
import { InitialShex, paramsFromStateShex } from "../shex/Shex";
import { InitialUML, mkSvgElement, paramsFromStateUML } from "../uml/UML";
import { shumlexCytoscapeStyle } from "../utils/cytoscape/cytoUtils";
import PrintJson from "../utils/PrintJson";
import {
  prefixMapTableColumns,
  scrollToResults,
  yasheResultButtonsOptions
} from "../utils/Utils";
import ShowVisualization, {
  visualizationTypes
} from "../utils/visualization/ShowVisualization";

const WikibaseSchemaResults = ({
  result: { resultInfo, resultSvg, resultUml },
  permalink,
  disabled,
  doUml,
  doCyto,
  do3D,
}) => {
  // De-structure results
  const {
    schema: {
      content: schemaRaw,
      format: { name: schemaFormat },
      engine: schemaEngine,
    },
    result: { shapes, prefixMap },
  } = resultInfo;

  const {
    targetSchemaFormat: { name: schemaSvgFormat },
    result: { content: schemaSvg },
  } = resultSvg;

  const umlXmi = doUml ? resultUml : null;

  const embedLinkType = shaclEngines.includes(schemaEngine)
    ? API.queryParameters.visualization.types.shacl
    : API.queryParameters.visualization.types.shex;

  // For cases where the UML is created, have it in state
  const [svgUml, setSvgUml] = useState(null);

  // For cases where Cytoscape visuals are created, have their data in state
  const [cytoElements, setCytoElements] = useState([]);
  const [cytoVisual, setCytoVisual] = useState(null);
  const [threedVisual, setThreedVisual] = useState(null);

  // Create cyto elements from results
  useEffect(() => {
    // If using ShEx, to to create CytoVisual and 3D visual
    if (schemaEngine === API.engines.shex) {
      try {
        // We used shumlex to create CytoVisuals for ShEx
        // Does "crearGrafo" keep existing?
        setCytoElements(shumlex.crearGrafo(schemaRaw));
      } catch (err) {
        console.warn(err);
        setCytoElements([]);
      }
    }
  }, []);

  // Forcibly render the cyto when entering the tab for accurate dimensions
  function renderCytoVisual() {
    setCytoVisual(
      <ShowVisualization
        data={{
          elements: cytoElements,
          stylesheet: shumlexCytoscapeStyle,
        }}
        type={visualizationTypes.cytoscape}
        embedLink={mkEmbedLink(stateSchemaParams, {
          visualizationType: embedLinkType,
          visualizationTarget: API.queryParameters.visualization.targets.cyto,
        })}
      />
    );
  }

  // Forcibly render the 3D when entering the tab for accurate dimensions
  function render3DVisual() {
    setThreedVisual(
      <ShowVisualization
        data={schemaRaw}
        type={visualizationTypes.threeD}
        // No embed link for 3D for now
      />
    );
  }

  // Scroll results into view
  useEffect(scrollToResults, []);

  // Active tab controls
  const [resultTab, setResultTab] = useState(API.tabs.text);
  const [visualTab, setVisualTab] = useState(API.tabs.visualizationDot);
  const [umlTab, setUmlTab] = useState(API.tabs.xmi);

  // Params of the fetched schema, used to create the embed link
  const stateSchemaParams = paramsFromStateShex({
    ...InitialShex,
    activeSource: API.sources.byText,
    textArea: schemaRaw,
    format: schemaFormat,
    engine: API.engines.shex,
  });

  // Params of the converted uml, used to create the embed link
  const stateUmlParams = doUml
    ? paramsFromStateUML({
        ...InitialUML,
        activeSource: API.sources.byText,
        textArea: umlXmi,
      })
    : null;

  function createUmlVisualization() {
    if (schemaEngine !== API.engines.shex) return;
    const svg = mkSvgElement(umlXmi);
    setSvgUml(svg);
  }

  if (resultInfo) {
    return (
      <div id={API.resultsId}>
        <Fragment>
          <div className="results-summary">
            {permalink && <Permalink url={permalink} disabled={disabled} />}
          </div>
          <hr />
          {/* Return visualization, form and prefix map */}

          <Tabs
            activeKey={resultTab}
            id="resultTabs"
            onSelect={setResultTab}
            mountOnEnter={true}
          >
            {/* Schema text */}
            {schemaRaw && (
              <Tab eventKey={API.tabs.text} title={API.texts.resultTabs.schema}>
                <ByText
                  textAreaValue={schemaRaw}
                  textFormat={schemaFormat}
                  readOnly={true}
                  options={{ ...yasheResultButtonsOptions }}
                />
              </Tab>
            )}
            {/* Schema prefix map */}
            {prefixMap && (
              <Tab
                eventKey={API.tabs.prefixMap}
                title={API.texts.resultTabs.prefixMap}
              >
                <div className="marginTop">
                  <BootstrapTable
                    classes="results-table"
                    keyField="prefixName"
                    data={prefixMap}
                    columns={prefixMapTableColumns}
                  ></BootstrapTable>
                </div>
              </Tab>
            )}

            {/* Schema visualizations */}
            <Tab
              eventKey={API.tabs.visualizations}
              title={API.texts.resultTabs.visualizations}
            >
              <Tabs
                activeKey={visualTab}
                id="visualizationTabs"
                onSelect={setVisualTab}
                mountOnEnter={true}
              >
                {/* SVG visualize */}
                {schemaSvg && (
                  <Tab
                    eventKey={API.tabs.visualizationDot}
                    title={API.texts.resultTabs.visualizationDot}
                  >
                    <ShowVisualization
                      data={schemaSvg}
                      type={visualizationTypes.svgRaw}
                      embedLink={mkEmbedLink(stateSchemaParams, {
                        visualizationType:
                          API.queryParameters.visualization.types.shex,
                        visualizationTarget:
                          API.queryParameters.visualization.targets.svg,
                      })}
                    />
                  </Tab>
                )}
                {/* Cytoscape visualization */}
                {doCyto && cytoElements?.length > 0 && (
                  <Tab
                    eventKey={API.tabs.visualizationCyto}
                    title={API.texts.resultTabs.visualizationCyto}
                    onEnter={renderCytoVisual}
                  >
                    {cytoVisual}
                  </Tab>
                )}
                {/* 3D visualization */}
                {do3D && schemaRaw && schemaEngine === API.engines.shex && (
                  <Tab
                    eventKey={API.tabs.visualization3d}
                    title={API.texts.resultTabs.graph3d}
                    onEnter={render3DVisual}
                  >
                    {threedVisual}
                  </Tab>
                )}
              </Tabs>
            </Tab>

            {/* UML - Xmi and Render */}
            {doUml && umlXmi && (
              <Tab
                eventKey={API.tabs.uml}
                title={API.texts.resultTabs.uml}
                mountOnEnter={true}
              >
                <Tabs activeKey={umlTab} id="umlTabs" onSelect={setUmlTab}>
                  {/* XMI */}
                  <Tab eventKey={API.tabs.xmi} title={API.texts.resultTabs.xmi}>
                    <ByText
                      textAreaValue={umlXmi}
                      textFormat={API.formats.xml}
                      readonly={true}
                      handleByTextChange={function(val) {
                        return val;
                      }}
                      options={{ ...yasheResultButtonsOptions }}
                    />
                  </Tab>
                  {/* Schema UML */}
                  <Tab
                    eventKey={API.tabs.uml}
                    title={API.texts.resultTabs.render}
                    onEnter={() => !svgUml && createUmlVisualization()}
                  >
                    <ShowVisualization
                      data={svgUml}
                      type={visualizationTypes.svgRaw}
                      embedLink={mkEmbedLink(stateUmlParams, {
                        visualizationType:
                          API.queryParameters.visualization.types.uml,
                        visualizationTarget:
                          API.queryParameters.visualization.targets.svg,
                      })}
                    />
                  </Tab>
                </Tabs>
              </Tab>
            )}
          </Tabs>
          <hr />
          <details>
            <summary>{API.texts.responseSummaryText}</summary>
            <PrintJson json={resultInfo} />
          </details>
        </Fragment>
      </div>
    );
  }
};

WikibaseSchemaResults.propTypes = {
  result: PropTypes.object.isRequired,
  disabled: PropTypes.bool.isRequired,
  doUml: PropTypes.bool.isRequired,
  doCyto: PropTypes.bool.isRequired,
  do3D: PropTypes.bool.isRequired,
};

WikibaseSchemaResults.defaultProps = {
  disabled: false,
  doUml: true,
  doCyto: true,
  do3D: true,
};

export default WikibaseSchemaResults;
