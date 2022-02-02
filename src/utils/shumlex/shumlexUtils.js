import shumlex from "shumlex";

// Given a schema's raw SVG, use Shumlex to compute its
// UML counterpart's raw SVG.
// Input: SVG of schema
// Output: SVG of the UML representation of the schema
export function mkInlineSvg(rawSchema) {
  const rawXmi = shumlex.shExToXMI(rawSchema);

  const dummyId = "dummy-uml-placeholder";

  // Create a dummy HTML element to put the SVG into
  const dummy = document.createElement("div");
  dummy.id = dummyId;
  document.body.appendChild(dummy);

  // Use Shumlex to create the SVG data (binary)...
  shumlex.crearDiagramaUML(dummyId, rawXmi);
  const svg64 = shumlex.base64SVG(dummyId);
  // ...and decode the binary to get the inline SVG element to be represented
  const inlineSvg = Buffer.from(
    svg64.replace("data:image/svg+xml;base64,", ""),
    "base64"
  ).toString();

  // Remove dummy element and return
  dummy.remove();

  return sanitizeXmi(inlineSvg);
}

// Remove problematic characters resulting from applying shumlex
// that create errors when downloading SVGs
function sanitizeXmi(xmi) {
  const stringsBlackList = ["&lt;", "&gt;"];
  const regexBlackList = [/g\s+id="[a-zA-Z_:0-9<>]+"/gim];

  xmi = stringsBlackList.reduce((prev, curr) => prev.replaceAll(curr, ""), xmi);
  xmi = regexBlackList.reduce(
    (prev, curr) =>
      prev.replaceAll(curr, (res) =>
        res.replaceAll("<", "").replaceAll(">", "")
      ),
    xmi
  );

  return xmi;
}
