import React from 'react';
// import Table from "react-bootstrap/Table";
import BootstrapTable from 'react-bootstrap-table-next';
import Alert from "react-bootstrap/Alert";
import { showQualify } from './Utils';

function shapeMap2Table(shapeMap, nodesPrefixMap, shapesPrefixMap) {
   console.log("ShapeMap: " + shapeMap)
   return shapeMap.map((assoc,key) => ({
      'id': key,
      'node': showQualify(assoc.node, nodesPrefixMap).str,
      'shape': showQualify(assoc.shape, shapesPrefixMap).str,
      'status': assoc.status,
      'details': assoc.reason
    }))
}

function shapeFormatter(cell, row) {
    if (row.status ==='conformant') {
        return (<span style={ { color:'green'} }>{cell}</span> );
    } else
        return (<span style={ {color: 'red'}}>!{cell}</span> );
}

function nodeFormatter(cell, row) {
    if (row.status ==='conformant') {
        return (<span style={ { color:'green'} }>{cell}</span> );
    } else
        return (<span style={ {color: 'red'}}>{cell}</span> );
}


function detailsFormatter(cell, row) {
    console.log("DetailsFormatter, cell: " + cell + " Row: " + row)
    return (
        <details>
         <pre>{row.details}</pre>
        </details> );
}

function ShowShapeMap(props) {
    const shapeMap = props.shapeMap
    console.log(`ShapeMap: ${shapeMap} isString? ${typeof shapeMap}`)
    if (typeof shapeMap === 'string') {
       return <Alert variant="info">{shapeMap}</Alert>
    } else {
        const table = shapeMap2Table(shapeMap, props.nodesPrefixMap, props.shapesPrefixMap)
        console.log("Table data: " + table)
        const columns = [
            {
                dataField: 'id',
                text: "Id",
                sort: true
            },
            {
                dataField: 'node',
                text: "Node",
                sort: true,
                formatter: nodeFormatter
            },
            {
                dataField: 'shape',
                text: "Shape",
                sort: true,
                formatter: shapeFormatter
            },
            {
                dataField: 'status',
                hidden: true
            },
            {
                dataField: 'evidence',
                text: "Details",
                formatter: detailsFormatter
            },
        ];

        return <BootstrapTable
            keyField='id'
            data={table}
            columns={columns}
            bootstrap4
            striped
            hover
            condensed />
    }
}

export default ShowShapeMap;
