import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import Alert from "react-bootstrap/Alert";

// TODO: Replace by utils/showQualify
function showQualifyShapeMap(node, prefix) {
  if (!node) return <code>?</code>;
  if (node === "<http://www.w3.org/ns/shex#Start>") return <code>START</code>;
  const relativeBaseRegex = /^<internal:\/\/base\/(.*)>$/g;
  const matchBase = relativeBaseRegex.exec(node);
  if (matchBase) {
    const rawNode = matchBase[1];
    return "<" + rawNode + ">";
  } else {
    const iriRegexp = /^<(.*)>$/g;
    const matchIri = iriRegexp.exec(node);
    if (matchIri) {
      const rawNode = matchIri[1];
      for (const key in prefix) {
        if (rawNode.startsWith(prefix[key])) {
          const localName = rawNode.slice(prefix[key].length);
          return <a href={rawNode}>{key + ":" + localName}</a>;
        }
      }
      return <a href={rawNode}>{"<" + rawNode + ">"}</a>;
    }
    if (node.match(/^[0-9"'_]/)) return node;
    if (node === "START") return node;
    console.error("Unknown format for node: " + node);
    return node;
  }
}

function shapeMap2Table(shapeMap, nodesPrefixMap, shapesPrefixMap) {
  return shapeMap.map((assoc, key) => ({
    id: key,
    node: showQualifyShapeMap(assoc.node, nodesPrefixMap),
    shape: showQualifyShapeMap(assoc.shape, shapesPrefixMap),
    status: assoc.status,
    details: assoc.reason,
  }));
}

function shapeFormatter(cell, row) {
  switch (row.status) {
    case "conformant":
      return <span style={{ color: "green" }}>{cell}</span>;
    case "?":
      return <span style={{ color: "orange" }}>?{cell}</span>;
    case "nonconformant":
      return <span style={{ color: "red" }}>!{cell}</span>;
    default:
      return (
        <span style={{ color: "blue" }}>
          unknown status: ${row.status}: {cell}
        </span>
      );
  }
}

function detailsFormatter(cell, row) {
  return (
    <details>
      <pre>{row.details}</pre>
    </details>
  );
}

function ShowShapeMap(props) {
  const shapeMap = props.shapeMap;
  if (typeof shapeMap === "string") {
    return <Alert variant="info">{shapeMap}</Alert>;
  } else {
    const table = shapeMap2Table(
      shapeMap,
      props.nodesPrefixMap,
      props.shapesPrefixMap
    );
    const columns = [
      {
        dataField: "id",
        text: "Id",
        sort: true,
      },
      {
        dataField: "node",
        text: "Node",
        sort: true,
      },
      {
        dataField: "shape",
        text: "Shape",
        sort: true,
        formatter: shapeFormatter,
      },
      {
        dataField: "status",
        hidden: true,
      },
      {
        dataField: "evidence",
        text: "Details",
        formatter: detailsFormatter,
      },
    ];

    return (
      <BootstrapTable
        keyField="id"
        data={table}
        columns={columns}
        striped
        hover
        condensed
      />
    );
  }
}

export default ShowShapeMap;
