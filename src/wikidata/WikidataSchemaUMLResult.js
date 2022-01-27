import React, { Fragment, useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import ExternalLinkIcon from "react-open-iconic-svg/dist/ExternalLinkIcon";
import { Permalink } from "../Permalink";
import ShExForm from "../shex/ShExForm";
import PrintSVG from "../utils/PrintSVG";
import Button from "react-bootstrap/Button";
import shumlex from "shumlex";
import $ from "jquery";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Code from "../components/Code";

const WikidataSchemaUMLResult = ({
  schema,
  result,
  schema: { id, label, description, webUri, conceptUri, shexContent },
  permalink,
  disabled,
}) => {
  let isFullscreen = false;
  
  useEffect(() => { 
		shumlex.crearDiagramaUML("umlcd", result);
		let svg64 = shumlex.base64SVG("umlcd");
		$("#descargarumlsvg").attr("href", svg64);
		$("#descargarumlsvg").attr("download", `shumlex-class-diagram.svg`);
		$("#fullscreen").click(fullscreen);
	});
	
  const [active, setActive] = useState("UML");	
	
	
  function fullscreen() {
		if(!isFullscreen) {
			$("#umlcontainer").attr("class", "fullscreen");
			$("#fullscreen").text("✖ Leave fullscreen");
			$("#umlcd").css("max-height", "91%");
			isFullscreen = true;
		} else {
			$("#umlcontainer").removeAttr("class");
			$("#fullscreen").text("Show at fullscreen");
			$("#umlcd").css("max-height", "500px");
			isFullscreen = false;
		}
	}
	
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
	  <div>
        <Tabs
          transition={false}
          id="dataTabs"
		  activeKey={active}
		  onSelect={(k) => setActive(k)}
        >
		  <Tab eventKey="UML" title="UML Diagram">
		    <div id="umlcontainer">
           <div id="umlcd" style={{overflowX: 'auto', border: "double black",}}></div>
		   <Button id="fullscreen" variant="secondary"  style={{margin: "0.5em"}}>Show at Fullscreen</Button>
		   <a id="descargarumlsvg" className="btn btn-secondary">Download UML as SVG</a>
		   </div>
          </Tab>
          <Tab eventKey="XMI" title="XMI">
            {result && (
              <Code
                value={result}
                mode="xml"
                onChange={function(val) {
                  return val;
                }}
              />
            )}
          </Tab>
        </Tabs>
      </div>
    </Fragment>
  );
};

WikidataSchemaUMLResult.defaultProps = {
  disabled: false,
  visual: false,
};

export default WikidataSchemaUMLResult;
