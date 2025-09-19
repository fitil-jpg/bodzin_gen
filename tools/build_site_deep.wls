(* Build site script stub *)

(* Existing header generation block *)
header = StringJoin[
  "<header>",
  (* Existing buttons may go here *)
  "<button id=\"projSaveBtn\" class=\"btn\">📦 Export Project (.zip)</button>",
  "<button id=\"projLoadBtn\" class=\"btn\">📦 Import Project (.zip)</button>",
  "<input id=\"projFile\" type=\"file\" accept=\"application/zip\" />",
  "<button id=\"abSaveA\" class=\"btn\">🔵 Save A</button>",
  "<button id=\"abSaveB\" class=\"btn\">🟣 Save B</button>",
  "<button id=\"abToggle\" class=\"btn\">◀▶ A/B</button>",
  "</header>"
];

Print[header];
