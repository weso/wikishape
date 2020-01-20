import React from 'react';
import Alert from "react-bootstrap/Alert";
import ShowShapeMap from "../shapeMap/ShowShapeMap"
import {wikidataPrefixes} from "../resources/wikidataPrefixes";
import {showQualify} from "../Utils";

function showStatus(status) {
    switch (status) {
        case 'conformant': return ''
        case 'nonconformant': return '!'
        case '?': return '? '
        default: return status
    }
}

export function showShapeMap(shapeMap) {
    if (shapeMap.length) {
       if (Array.isArray(shapeMap))
        return shapeMap.map(row => `${row.node}@${showStatus(row.status)}${row.shape}`).join('\n');
       else
        return shapeMap;
    } else {
        return `No shape map`
    }
}

export function showResult(result, msg) {
    return `${msg? msg: ''}, ${result? `ShapeMap:\n ${showShapeMap(result.shapeMap)}`: 'null'}`;
}

export function showRow(row) {
    return row? `Row: ${row.node}@${row.shape}` : null ;
}


function mergeStatus(status,newStatus) {
    return newStatus; // TODO: check if previous status was nonconformant and new status is conformant?
}

function mergeRow(row, shapeMap) {
    console.log(`mergeRow: ${showRow(row)} in ${showShapeMap(shapeMap)}`)
    const values = shapeMap.filter(r => r.node === row.node && r.shape === row.shape)
    if (values && values.length) {
        const newRow = values[0];
        console.log(`Values matched found: ${showRow(newRow)}`)
        return { ...newRow, status: mergeStatus(row.status, newRow.status) }
    } else {
        console.log(`No values matched...`)
        return row
    }
}

function rowIn(row, shapeMap) {
    return shapeMap.filter(r => (r.node === row.node && r.shape === row.shape)).length >= 1
}

function mergeShapeMap(shapeMap1, shapeMap2, shapesPrefixMap) {
 if (shapeMap2.length && Array.isArray(shapeMap2)) {
    const qualifiedShapeMap = shapeMap2.map(sm => {
        return { ...sm,
            shape: showQualify(sm.shape,shapesPrefixMap).str }
    });
    const mergedValues = shapeMap1.map(row => mergeRow(row, qualifiedShapeMap, shapesPrefixMap))
    const newValues = qualifiedShapeMap.filter(row => !rowIn(row, shapeMap1))
    return mergedValues.concat(newValues);
 } else
      return shapeMap1
}


export function mergeResult(result, newResult, shapesPrefixMap) {
    if (!result) {
        console.log(`No previous result?: returning newResult: ${showResult(newResult, 'New')}`)
        return newResult;
    }
    if (newResult) {
        console.log(`Merging. ${showResult(result, 'Previous')}\nNew: \n${showResult(newResult, 'New')}`)
        const mergedShapeMap = mergeShapeMap(result.shapeMap, newResult.shapeMap, shapesPrefixMap)
        const mergedResult = {
            valid: newResult.valid,
            type: 'Result',
            message: newResult.message,
            shapeMap: mergedShapeMap,
            errors: result.errors.concat(newResult.errors),
            nodesPrefixMap: wikidataPrefixes,
            shapesPrefixMap: newResult.shapesPrefixMap
        };
        console.log(`${showResult(mergedResult,'Merged')}`)
        return mergedResult;
    } else {
        console.log(`Previous result=null! ${showResult(result,'New')}`)
        return result;
    }
}


function ResultValidate(props) {

    let result = props.result ;
    console.log("ResultQuery" + JSON.stringify(result));
    let msg ;
    if (result === "") {
        msg = null
    } else
    if (result.error) {
        msg =
            <div><p>Error: {result.error}</p>
                <details><pre>{JSON.stringify(result)}</pre></details>
            </div>
    } else {
        msg = <div>
            { result.message && <Alert variant="success">{result.message} </Alert> }
            { result.errors && <div> { result.errors.map((e,idx) => <Alert id={idx} variant="danger">{e.type}: {e.error}</Alert> )}</div>
            }
            { result.shapeMap && <ShowShapeMap
                shapeMap={result.shapeMap}
                nodesPrefixMap={result.nodesPrefixMap}
                shapesPrefixMap={result.shapesPrefixMap}
            /> }
            <details><pre>{JSON.stringify(result)}</pre></details>
        </div>
    }

    return (
        <div>{msg}</div>
    );
}

export default ResultValidate;
