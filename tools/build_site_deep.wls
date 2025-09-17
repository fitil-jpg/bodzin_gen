#!/usr/bin/env wolframscript

(* Build site index with safe JSON injection *)

(* FX & Dynamics controls *)
presets = <|
  "fxDynamics" -> {
    (* Compressor/sidechain controls would appear here *)
    <|"id"->"lim_thresh","type"->"range","label"->"Limiter Threshold (dB)",
      "min"->-12,"max"->0,"step"->0.5,"value"->-1,"cmd"->"lim_thresh"|>,
    <|"id"->"lim_drums_on","type"->"select","label"->"Limiter Drums","cmd"->"lim_drums_on"|>,
    <|"id"->"lim_bass_on","type"->"select","label"->"Limiter Bass","cmd"->"lim_bass_on"|>,
    <|"id"->"lim_lead_on","type"->"select","label"->"Limiter Lead","cmd"->"lim_lead_on"|>,
    <|"id"->"lim_fx_on","type"->"select","label"->"Limiter FX","cmd"->"lim_fx_on"|>
  }
|>;

presetJSON = ExportString[presets, "JSON"];
presetBase64 = StringReplace[ExportString[presetJSON, "Base64"], {"\n" -> "", "\r" -> ""}];
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
