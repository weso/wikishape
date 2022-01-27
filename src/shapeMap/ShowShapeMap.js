import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider, {
  CSVExport,
  Search
} from "react-bootstrap-table2-toolkit";
import DataTransferDownloadIcon from "react-open-iconic-svg/dist/DataTransferDownloadIcon";
import API from "../API";
import { conformant } from "../results/ResultValidate";

const relativeBaseRegex = () => /^<internal:\/\/base\/(.*)>$/g;
const iriRegex = () => /^<(.*)>$/g;

// Return a node cell item
function NodeItem({ iri, link, name }) {
  return (
    <abbr title={iri}>
      <a
        href={link}
        style={{ color: "inherit" }}
        target="_blank"
      >{`:${name}`}</a>
    </abbr>
  );
}

// Return a node cell item
function NodeDescriptionItem({ resultItem: { reason, resultInfo } }) {
  return (
    <pre style={{ whiteSpace: "pre-line" }}>
      {resultInfo?.length && !resultInfo.errors ? (
        <ul>
          {resultInfo.evidences.map((evidence, index) => (
            <li key={index}>{evidence}</li>
          ))}
        </ul>
      ) : (
        <ul>
          <li>{reason || API.texts.unknownReason}</li>
        </ul>
      )}
    </pre>
  );
}

// For a given node resulting of a schema validation, get its name to be shown in
// the results table (abbreviated if possible)
export function mkCellElement(node, prefixMap) {
  const matchedBase = relativeBaseRegex().exec(node);

  // Raw internal node, show full qualified name
  if (matchedBase) {
    const rawNode = matchedBase[1];
    return `<${rawNode}>`;
  }

  // Else, process the node IRI
  const matchedIri = iriRegex().exec(node);
  // Node is an IRI, extract the short name (IRI ending)
  // and return an abbreviation with the full IRI
  if (matchedIri) {
    const nodeIRI = matchedIri[0]; // Get the node's full name with '<' and '>'
    const nodeNameFull = matchedIri[1]; // Get the node's full name without '<' and '>'

    // For each prefix, if it is the one used in the node, return an '<abbr>' element
    for (const prefix in prefixMap) {
      if (nodeNameFull.startsWith(prefixMap[prefix])) {
        const nodeNameLocal = nodeNameFull.slice(prefixMap[prefix].length); // Get the node's short local name
        return NodeItem({
          iri: nodeIRI,
          link: nodeNameFull,
          name: nodeNameLocal,
        });
      }
    }
    // If no prefix matched, try to parse the IRI slashes for a friendly name
    return NodeItem({
      iri: nodeIRI,
      link: nodeNameFull,
      name: nodeNameFull.split("/").pop(),
    });
  }
  // Exceptional case for inner nodes
  if (node.match(/^[0-9"'_]/)) return node;

  // No matches, return the node as it is, logging the error
  console.error("Unknown format for node: " + node);
  return node;
}

// Function generating the symbol for ordering data in a table
export const sortCaretGen = (order) => (
  <button className="discrete">{order === "desc" ? "↓" : "↑"}</button>
);

function ShowShapeMap({ shapeMap, nodesPrefixMap, shapesPrefixMap }) {
  // Given the shapeMap resulting from a schema validation, map each result to an object
  // compatible with Bootstrap table
  function mkTableItems(shapeMap) {
    return shapeMap.map((item, index) => ({
      id: index,
      node: item.node,
      shape: item.shape,
      status:
        item.status === conformant
          ? API.texts.validationResults.nodeValid
          : API.texts.validationResults.nodeInvalid,
      reason: item.reason,
      resultInfo: item.appInfo,
    }));
  }

  if (!Array.isArray(shapeMap)) return <></>;
  const tableItems = mkTableItems(shapeMap);

  // Settings for the data appearing in the table columns
  const columns = [
    {
      dataField: "id",
      text: "Id",
      sort: true,
      hidden: true,
    },
    {
      dataField: "node",
      text: "Node",
      formatter: (nodeIRI, _) => mkCellElement(nodeIRI, nodesPrefixMap),
      sort: true,
      sortCaret: sortCaretGen,
      sortValue: (nodeIRI, _) => nodeIRI, // Short by node name
    },
    {
      dataField: "shape",
      text: "Shape",
      formatter: (shapeIRI, _) => mkCellElement(shapeIRI, shapesPrefixMap),
      sort: true,
      sortCaret: sortCaretGen,
      sortValue: (shapeIRI, _) => shapeIRI, // Short by shape name
    },
    {
      dataField: "status",
      text: "Status",
      searchable: false,
      sort: true,
      sortCaret: sortCaretGen,
      sortValue: (status, _) => status, // Short by validation status
    },
    {
      dataField: "reason", // "reason" field contains the string summary of why the node is (in)valid
      text: "Reason",
      searchable: false,
      hidden: true,
    },
  ];

  // Settings for dynamic row expansion
  const rowExpandSettings = {
    // Function specifying what is rendered in the expanded row
    renderer: (resultItem) => <NodeDescriptionItem resultItem={resultItem} />,
    showExpandColumn: true,
    expandByColumnOnly: true,
    expandColumnPosition: "left",
    expandColumnRenderer: ({ expanded }) => (expanded ? "−" : "+"),
    expandHeaderColumnRenderer: ({ isAnyExpands }) =>
      isAnyExpands ? "−" : "+",
    className: "table-item expanded-child",
    parentClassName: "expanded-parent",
  };

  // Function defining the class of each row
  const rowClassesFn = (resultItem, _) =>
    `table-item ${
      resultItem.status == API.texts.validationResults.nodeValid
        ? "green"
        : "red"
    }`;

  // Settings for exporting the table results to CSV
  // https://react-bootstrap-table.github.io/react-bootstrap-table2/docs/export-csv-props.html
  const csvSettings = {
    fileName: "validation.csv",
    separator: ";",
    ignoreHeader: false,
    noAutoBOM: false,
  };

  // Settings for pagination
  // https://react-bootstrap-table.github.io/react-bootstrap-table2/docs/pagination-props.html
  const paginationSettings = {
    sizePerPage: 5,
    paginationSize: 3,
    hidePageListOnlyOnePage: true,
    sizePerPageList: [
      ...[5, 10, 15, 20, 25, 30]
        .filter((n) => n < tableItems.length)
        .map((n) => ({
          text: n.toString(),
          value: n,
        })),
      { text: "All", value: tableItems.length },
    ],
    sizePerPageOptionRenderer: ({ text, page, onSizePerPageChange }) => (
      <li
        key={text}
        role="presentation"
        className="dropdown-item size-per-page-dropdown"
        onMouseDown={(e) => {
          e.preventDefault();
          onSizePerPageChange(page);
        }}
      >
        <a href="#" tabIndex="-1" role="menuitem" data-page={page}>
          {text}
        </a>
      </li>
    ),
  };

  // Settings for searching the results
  const searchSettings = {};

  return (
    <>
      {/* https://react-bootstrap-table.github.io/react-bootstrap-table2/ */}
      {/* https://react-bootstrap-table.github.io/react-bootstrap-table2/storybook/index.html */}
      <ToolkitProvider
        keyField="id"
        data={tableItems}
        columns={columns}
        exportCSV={csvSettings}
        search={searchSettings}
      >
        {(props) => (
          <>
            <div className="table-options">
              <Search.SearchBar
                {...props.searchProps}
                className="search-form"
              />
              <CSVExport.ExportCSVButton
                {...props.csvProps}
                className="btn-secondary btn-export-csv"
              >
                <span>CSV</span>
                <DataTransferDownloadIcon className="white-icon" />
              </CSVExport.ExportCSVButton>
            </div>
            <BootstrapTable
              {...props.baseProps}
              classes="results-table"
              expandRow={rowExpandSettings}
              rowClasses={rowClassesFn}
              pagination={paginationFactory(paginationSettings)}
              condensed
              responsive
              tabIndexCell={true}
            />
          </>
        )}
      </ToolkitProvider>
    </>
  );
}

export default ShowShapeMap;
