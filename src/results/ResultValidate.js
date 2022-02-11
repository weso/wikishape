import React, { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import API from "../API";
import { Permalink } from "../Permalink";
import { wikidataPrefixes } from "../resources/wikidataPrefixes";
import ShowShapeMap from "../shapeMap/ShowShapeMap";
import PrintJson from "../utils/PrintJson";
import { equalsIgnoreCase, scrollToResults, showQualify } from "../utils/Utils";

export const conformant = "conformant"; // Status of conformant nodes
export const nonConformant = "nonconformant"; // Status of non-conformant nodes
export const unknown = "?"; // Status of non-conformant nodes

function showStatus(status) {
  switch (status) {
    case conformant:
      return "";
    case nonConformant:
      return "!";
    case unknown:
      return "?";
    default:
      return status;
  }
}

export function showShapeMap(shapeMap) {
  if (shapeMap.length) {
    if (Array.isArray(shapeMap))
      return shapeMap
        .map((row) => `${row.node}@${showStatus(row.status)}${row.shape}`)
        .join("\n");
    else return shapeMap;
  } else {
    return `No shape map`;
  }
}

export function showResult(result, msg) {
  return `${msg ? msg : ""}\n ${
    result ? `Result: ${JSON.stringify(result)}\n}` : "null"
  }`;
}

export function showRow(row) {
  return row ? `Row: ${row.node}@${row.shape}` : null;
}

function mergeStatus(status, newStatus) {
  return newStatus; // TODO: check if previous status was nonconformant and new status is conformant?
}

function mergeRow(row, shapeMap) {
  const values = shapeMap.filter(
    (r) => r.node === row.node && r.shape === row.shape
  );
  if (values && values.length) {
    const newRow = values[0];
    return { ...newRow, status: mergeStatus(row.status, newRow.status) };
  } else {
    return row;
  }
}

function rowIn(row, shapeMap) {
  return (
    shapeMap.filter((r) => r.node === row.node && r.shape === row.shape)
      .length >= 1
  );
}

export function mergeShapeMap(shapeMap1, shapeMap2, shapesPrefixMap) {
  if (shapeMap2 && shapeMap2.length && Array.isArray(shapeMap2)) {
    const qualifiedShapeMap2 = shapeMap2.map((sm) => {
      return { ...sm, shape: showQualify(sm.shape, shapesPrefixMap).str };
    });
    const qualifiedShapeMap1 = shapeMap1.map((sm) => {
      return { ...sm, shape: showQualify(sm.shape, shapesPrefixMap).str };
    });
    const mergedValues = qualifiedShapeMap1.map((row) =>
      mergeRow(row, qualifiedShapeMap2, shapesPrefixMap)
    );
    const newValues = qualifiedShapeMap2.filter(
      (row) => !rowIn(row, qualifiedShapeMap1)
    );
    return mergedValues.concat(newValues);
  } else return shapeMap1;
}

export function mergeResult(result, newResult, shapesPrefixMap) {
  if (!result) {
    return newResult;
  }
  if (newResult) {
    const mergedShapeMap = mergeShapeMap(
      result.shapeMap,
      newResult.shapeMap,
      shapesPrefixMap
    );
    let newErrors;
    if (newResult.error) {
      newErrors = [newResult.error];
    } else if (newResult.errors) {
      newErrors = newResult.errors;
    } else {
      newErrors = [];
    }
    const mergedResult = {
      valid: newResult.valid,
      type: "Result",
      message: newResult.message,
      shapeMap: mergedShapeMap,
      errors: newErrors.concat(result.errors),
      nodesPrefixMap: wikidataPrefixes,
      shapesPrefixMap: newResult.shapesPrefixMap,
    };
    return mergedResult;
  } else {
    return result;
  }
}

function ResultValidate({
  result: validateResponse,
  options,
  entities,
  permalink,
  disabled,
}) {
  // Destructure the items nested in the API response
  const { operationData, wikibase, result: validateResult } = validateResponse;

  const { entity: validatedEntity, result: apiResult } = validateResult;

  const {
    data,
    schema,
    trigger,
    result: {
      valid,
      errors,
      shapeMap: resultsMap,
      nodesPrefixMap,
      shapesPrefixMap,
    },
  } = apiResult;

  // Store the resulting nodes in state, plus the invalid ones
  const [nodes] = useState(resultsMap);
  const [invalidNodes, setInvalidNodes] = useState([]);

  // Scroll results into view
  useEffect(scrollToResults, []);

  // Update invalid nodes on node changes
  useEffect(() => {
    const nonConformantNodes = nodes.filter((node) =>
      equalsIgnoreCase(node.status, nonConformant)
    );
    setInvalidNodes(nonConformantNodes);
  }, [nodes]);

  if (validateResponse) {
    return (
      <div id={API.resultsId}>
        {nodes?.length && (
          <ShowShapeMap
            shapeMap={resultsMap}
            nodesPrefixMap={nodesPrefixMap}
            shapesPrefixMap={shapesPrefixMap}
            options={options}
          />
        )}

        <details>
          <summary>{API.texts.responseSummaryText}</summary>
          <PrintJson json={validateResponse} />
        </details>
        {permalink && <Permalink url={permalink} disabled={disabled} />}
      </div>
    );
  }
}

function showErrors(es) {
  if (Array.isArray(es)) {
    es.map((e, idx) => {
      let msgErr;
      if (e.type) {
        msgErr = (
          <Alert id={idx} variant="danger">
            {e.type}: {e.error}
          </Alert>
        );
      } else {
        msgErr = (
          <Alert id={idx} variant="danger">
            {e}
          </Alert>
        );
      }
      return msgErr;
    });
  } else {
    return <Alert variant="danger">{es}</Alert>;
  }
}

ResultValidate.defaultProps = {
  disabled: false,
};

export default ResultValidate;
