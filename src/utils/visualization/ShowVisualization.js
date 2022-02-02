import cytoscape from "cytoscape";
import svg from "cytoscape-svg";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import format from "xml-formatter";
import API from "../../API";
import {
  breadthfirst,
  cytoscapeMaxZoom,
  cytoscapeMinZoom,
  stylesheetCytoscape
} from "../cytoscape/cytoUtils";
import PrintJson from "../PrintJson";
import PrintSVG from "../PrintSVG";
import PrintXml from "../PrintXml";
import VisualizationLinks from "./VisualizationLinks";

// "cytoscape-svg" package
// https://www.npmjs.com/package/cytoscape-svg
cytoscape.use(svg);

export const visualizationTypes = {
  svgObject: "svg",
  svgRaw: "svgRaw",
  image: "image",
  json: "json",
  cytoscape: "cyto",
  text: "text",
  object: "object",
};

// Unified class for showing data visualizations
function ShowVisualization({
  data,
  type,
  raw,
  zoom: defaultZoom,
  embedLink,
  disabledLinks,
  controls,
}) {
  // CSS-applied zoom on the element
  const [zoom, setZoom] = useState(defaultZoom || 1);
  const [fullscreen, setFullscreen] = useState(false);

  // React element with the visualization
  const [visualization, setVisualization] = useState(<></>);
  // Download link, may change when the visualization changes
  const [downloadLink, setDownloadLink] = useState({});

  // Cyto object for controlled updates if using cytoscape
  const [cytoObject, setCytoObject] = useState(null);

  useEffect(() => {
    setVisualization(generateVisualElement());
    setDownloadLink(generateDownloadLink());
  }, [data, type]);

  useEffect(() => {
    setDownloadLink(generateDownloadLink(data, type));
  }, [cytoObject]);

  const generateVisualElement = (vData = data, vType = type) => {
    switch (vType) {
      case visualizationTypes.svgObject:
        return <div dangerouslySetInnerHTML={{ __html: vData.outerHTML }} />;

      case visualizationTypes.svgRaw:
        return <PrintSVG svg={vData} />;

      case visualizationTypes.cytoscape:
        return (
          <CytoscapeComponent
            elements={vData.elements}
            stylesheet={[...stylesheetCytoscape, ...(vData.stylesheet || [])]} // Overwrite default styles with user styles, if any
            minZoom={cytoscapeMinZoom}
            maxZoom={cytoscapeMaxZoom}
            wheelSensitivity={0.4}
            className={"cyto-container"}
            layout={vData.layout || breadthfirst}
            cy={(cy) => {
              cy.ready(() => {
                vData.refCyto.current = cy;
                setCytoObject(cy);
              });
            }}
          />
        );

      case visualizationTypes.image:
        return <img src={vData.src} />;

      case visualizationTypes.json:
      case visualizationTypes.object:
        return <PrintJson json={vData} overflow={false}></PrintJson>;

      // DOT, PS, (String)
      case visualizationTypes.text:
      default:
        return <PrintXml xml={vData} overflow={false}></PrintXml>;
    }
  };

  const generateDownloadLink = (vData = data, vType = type) => {
    switch (vType) {
      case visualizationTypes.svgRaw:
      case visualizationTypes.svgObject:
        return () => ({
          link: URL.createObjectURL(
            new Blob([vData?.outerHTML || vData], {
              type: "image/svg+xml;charset=utf-8",
            })
          ),
          type: API.formats.svg.toLowerCase(),
        });

      case visualizationTypes.cytoscape:
        // "cytoscape-svg" package
        if (!cytoObject) return;

        return () => {
          const svgVisualization = cytoObject.svg({
            full: true,
          });
          return {
            link: URL.createObjectURL(
              new Blob([svgVisualization], {
                type: "image/svg+xml;charset=utf-8",
              })
            ),
            type: API.formats.svg.toLowerCase(),
          };
        };

      case visualizationTypes.image:
        return () => ({
          link: vData.src,
          type: API.formats.png.toLowerCase(),
        });

      case visualizationTypes.json:
      case visualizationTypes.object:
        return () => ({
          link: URL.createObjectURL(
            new Blob([JSON.stringify(vData, null, 2)], {
              type: "application/json;charset=utf-8",
            })
          ),
          type: API.formats.json.toLowerCase(),
        });

      case visualizationTypes.text:
      default:
        return () => ({
          link: URL.createObjectURL(
            new Blob([format(vData)], {
              type: "application/xml;charset=utf-8",
            })
          ),
          type: API.formats.txt.toLowerCase(),
        });
    }
  };

  return (
    <div
      style={{ position: "relative" }}
      className={`width-100 height-100 ${raw ? "" : "border"} ${
        fullscreen ? "fullscreen" : ""
      }`}
    >
      <VisualizationLinks
        generateDownloadLink={generateDownloadLink}
        embedLink={raw ? false : embedLink}
        disabled={raw ? true : disabledLinks}
        controls={controls}
        zoomControls={[zoom, setZoom]}
        fullscreenControls={[fullscreen, setFullscreen]}
      />

      <div
        style={{ overflow: raw ? "inherit" : "auto" }}
        className={raw ? "width-100v height-100v" : "width-100 height-100"}
      >
        {/* // Basic div changing with the zoom level with the final contents */}
        <div className="width-100 height-100">
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
          >
            {visualization}
          </div>
        </div>
      </div>
    </div>
  );
}

ShowVisualization.propTypes = {
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  zoom: PropTypes.number,
  raw: PropTypes.bool,
  embedLink: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  disabledLinks: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  setZoom: PropTypes.func,
  fullscreen: PropTypes.bool,
};

ShowVisualization.defaultProps = {
  zoom: 1,
  raw: false,
  controls: false, // Show or hide zoom controls
  fullscreen: false,
};
export default ShowVisualization;
