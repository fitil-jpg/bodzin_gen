#!/usr/bin/env wolframscript

(* Build site index with safe JSON injection *)
presets = <||>;

presetJSON = ExportString[presets, "JSON"];
presetBase64 = ExportString[presetJSON, "Base64"];
presetJS = "JSON.parse(atob('" <> presetBase64 <> "'))";

html = StringRiffle[{
  "<!DOCTYPE html>",
  "<html>",
  "<head>",
  "<meta charset=\"utf-8\">",
  "</head>",
  "<body>",
  "<script type=\"text/javascript\">const preset = " <> presetJS <> ";</script>",
  "</body>",
  "</html>"
}, "\n"];

Export["site/index.html", html, "Text"];
