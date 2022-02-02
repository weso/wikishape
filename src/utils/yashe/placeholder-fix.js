import YATE from "perfectkb-yate";
import YASHE from "yashe/dist/yashe.bundled.min";

// Quickfix for placeholders in YASHE

(function(mod) {
  mod(YATE);
  mod(YASHE)
})(function(YAlib) {
  YAlib.defineOption("placeholder", "", function(cm, val, old) {
    var prev = old && old !== YAlib.Init;
    if (val && !prev) {
      cm.on("blur", onBlur);
      cm.on("change", onChange);
      cm.on("swapDoc", onChange);
      YAlib.on(
        cm.getInputField(),
        "compositionupdate",
        (cm.state.placeholderCompose = function() {
          onComposition(cm);
        })
      );
      onChange(cm);
    } else if (!val && prev) {
      cm.off("blur", onBlur);
      cm.off("change", onChange);
      cm.off("swapDoc", onChange);
      YAlib.off(
        cm.getInputField(),
        "compositionupdate",
        cm.state.placeholderCompose
      );
      clearPlaceholder(cm);
      var wrapper = cm.getWrapperElement();
      wrapper.className = wrapper.className.replace(" CodeMirror-empty", "");
    }

    if (val && !cm.hasFocus()) onBlur(cm);
  });

  function clearPlaceholder(cm) {
    if (cm.state.placeholder) {
      cm.state.placeholder.parentNode.removeChild(cm.state.placeholder);
      cm.state.placeholder = null;
    }
  }
  function setPlaceholder(cm) {
    clearPlaceholder(cm);
    var elt = (cm.state.placeholder = document.createElement("pre"));
    elt.style.cssText = "height: 0; overflow: visible";
    elt.style.direction = cm.getOption("direction");
    elt.className = "CodeMirror-placeholder CodeMirror-line-like";
    var placeHolder = cm.getOption("placeholder");
    if (typeof placeHolder == "string")
      placeHolder = document.createTextNode(placeHolder);
    elt.appendChild(placeHolder);
    cm.display.lineSpace.insertBefore(elt, cm.display.lineSpace.firstChild);
  }

  function onComposition(cm) {
    setTimeout(function() {
      var empty = false;
      if (cm.lineCount() == 1) {
        var input = cm.getInputField();
        empty =
          input.nodeName == "TEXTAREA"
            ? !cm.getLine(0).length
            : !/[^\u200b]/.test(
                input.querySelector(".CodeMirror-line").textContent
              );
      }
      if (empty) setPlaceholder(cm);
      else clearPlaceholder(cm);
    }, 20);
  }

  function onBlur(cm) {
    if (isEmpty(cm)) setPlaceholder(cm);
  }
  function onChange(cm) {
    var wrapper = cm.getWrapperElement(),
      empty = isEmpty(cm);
    wrapper.className =
      wrapper.className.replace(" CodeMirror-empty", "") +
      (empty ? " CodeMirror-empty" : "");

    if (empty) setPlaceholder(cm);
    else clearPlaceholder(cm);
  }

  function isEmpty(cm) {
    return cm.lineCount() === 1 && cm.getLine(0) === "";
  }
});
