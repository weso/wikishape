import React from "react";
import Alert from "react-bootstrap/Alert";
import { wikidataPrefixes } from "../resources/wikidataPrefixes";
import ShowShapeMap from "../shapeMap/ShowShapeMap";
import { showQualify } from "../utils/Utils";

function showStatus(status) {
  switch (status) {
    case "conformant":
      return "";
    case "nonconformant":
      return "!";
    case "?":
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
    console.log(
      `No previous result?: returning newResult: ${showResult(
        newResult,
        "New"
      )}`
    );
    return newResult;
  }
  if (newResult) {
    console.log(
      `Merging. ${showResult(result, "Previous")}\nNew: \n${showResult(
        newResult,
        "New"
      )}`
    );
    const mergedShapeMap = mergeShapeMap(
      result.shapeMap,
      newResult.shapeMap,
      shapesPrefixMap
    );
    console.log(`newResult error ${newResult}`);
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
    console.log(`${showResult(mergedResult, "Merged")}`);
    return mergedResult;
  } else {
    console.log(`Previous result=null! ${showResult(result, "New")}`);
    return result;
  }
}

function ResultValidate({ result }) {
  let msg;
  if (result === "") {
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
    const {
      message,
      errors,
      shapeMap,
      nodesPrefixMap,
      shapesPrefixMap,
    } = result;
    msg = (
      <div>
        {message && <Alert variant="success">{message} </Alert>}
        {errors && <div> {showErrors(errors)} </div>}
        {shapeMap && (
          <ShowShapeMap
            shapeMap={shapeMap}
            nodesPrefixMap={nodesPrefixMap}
            shapesPrefixMap={shapesPrefixMap}
          />
        )}
        <details>
          <pre>{JSON.stringify(result)}</pre>
        </details>
      </div>
    );
  }

  return <div style={{ width: "100%" }}>{msg}</div>;
}

function showErrors(es) {
  if (Array.isArray(es)) {
    es.map((e, idx) => {
      let msgErr;
      console.error(`Errors: ${es} e: ${e}`);
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
