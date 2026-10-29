"use client";
import { useEffect, useMemo, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { RangeSetBuilder, StateEffect, StateField, type Extension } from "@codemirror/state";
import { Decoration, type DecorationSet } from "@codemirror/view";
import { tags } from "@lezer/highlight";
const theme = EditorView.theme({ "&": { color: "#d5e1df", backgroundColor: "#121d22" }, ".cm-gutters": { border: "none" }, ".cm-panels": { backgroundColor: "#1d2b30", color: "#c6d3d4" }, ".cm-searchMatch": { backgroundColor: "#dfbd9140" } }, { dark: true });
const highlighting = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.keyword, color: "#c5a8d4" }, { tag: tags.string, color: "#dfbd91" },
  { tag: tags.number, color: "#dbb793" }, { tag: tags.function(tags.variableName), color: "#91d5c5" },
  { tag: tags.comment, color: "#718b94", fontStyle: "italic" }, { tag: tags.operator, color: "#a8c0c6" },
  { tag: tags.bool, color: "#dfbd91" }, { tag: tags.variableName, color: "#d5e1df" },
]));
const setHighlight = StateEffect.define<number | null>();
const highlightField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(value, transaction) {
    value = value.map(transaction.changes);
    for (const effect of transaction.effects) if (effect.is(setHighlight)) {
      const line = effect.value;
      if (!line || line > transaction.state.doc.lines) value = Decoration.none;
      else { const builder = new RangeSetBuilder<Decoration>(); const start = transaction.state.doc.line(line).from; builder.add(start, start, Decoration.line({ class: "cm-suspicious-line" })); value = builder.finish(); }
    }
    return value;
  },
  provide: (field) => EditorView.decorations.from(field),
});
export default function CodeEditor({ code, onChange, highlightLine, onRun, readOnly = false }: { code: string; onChange: (code: string) => void; highlightLine: number | null; onRun: () => void; readOnly?: boolean }) {
  const viewRef = useRef<EditorView | null>(null);
  useEffect(() => { viewRef.current?.dispatch({ effects: setHighlight.of(highlightLine) }); }, [highlightLine]);
  const extensions = useMemo<Extension[]>(() => [python(), theme, highlighting, highlightField, EditorView.lineWrapping, EditorView.contentAttributes.of({ "aria-label": "Python code editor", "spellcheck": "false" }), EditorView.domEventHandlers({ keydown: (event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); onRun(); return true; } return false; } })], [onRun]);
  return <div className="editor-shell"><CodeMirror value={code} onCreateEditor={(view) => { viewRef.current = view; view.dispatch({ effects: setHighlight.of(highlightLine) }); }} height="370px" theme="dark" extensions={extensions} onChange={onChange} editable={!readOnly} basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true, highlightActiveLineGutter: true, autocompletion: true, bracketMatching: true, closeBrackets: true, searchKeymap: true, tabSize: 4 }} /></div>;
}
