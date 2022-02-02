import React, { useEffect } from "react";
import API from "../API";
import ByText from "../components/ByText";
import { Permalink } from "../Permalink";
import PrintJson from "../utils/PrintJson";
import { yasheNoButtonsOptions } from "../utils/Utils";

function ResultSchemaExtract({
  result: serverResponse,
  entities,
  permalink,
  disabled,
}) {
  // Destructure server response
  const {
    operationData,
    wikibase,
    result: { result: rawSchemaExtracted },
  } = serverResponse;

  // Scroll results into view
  useEffect(() => {
    const resultElement = document.getElementById("results-container");
    resultElement &&
      resultElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (serverResponse) {
    return (
      <div id="results-container">
        {serverResponse.result && (
          <ByText
            textAreaValue={rawSchemaExtracted.trim()}
            textFormat={API.formats.shexc}
            fromParams={false}
            options={{ ...yasheNoButtonsOptions }}
          />
        )}
        <div className="results-summary">
          <details>
            <summary>{API.texts.responseSummaryText}</summary>
            <PrintJson json={serverResponse} />
          </details>
          {permalink && <Permalink url={permalink} disabled={disabled} />}
        </div>
      </div>
    );
  }
}

ResultSchemaExtract.defaultProps = {
  disabled: false,
};

export default ResultSchemaExtract;
