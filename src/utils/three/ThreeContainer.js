import sh3 from "3dshex";
import React, { useEffect } from "react";

// Custom component for rendering shex3d items

// Takes of creating the ref and handling other data so other components
// can just plug this one in
const ThreeContainer = ({ data }) => {
  // ID of the Visualization container
  const threeDId = "3dgraph";

  // When loading, create the 3D visual (silently ignore errors for now)
  useEffect(() => {
    try {
      sh3.shExTo3D(data, threeDId);
    } catch (err) {
      console.warn(err);
    }
  }, []);

  return (
    // Create the item, let useEffect perform the logic
    // The class is very important. We make the 3D visuals not overflow via CSS
    // TODO: better code handling in three.js to adapt to viewport
    <div id={threeDId} className="threed-graph-visualization-root"></div>
  );
};

export default ThreeContainer;
