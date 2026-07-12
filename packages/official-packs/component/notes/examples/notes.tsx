// Example handwriting lesson using the `notes` pack — reference only, copied to
// docs/examples/. A full-page pen notebook beside a prompt; import path assumes the
// pack installed its component at src/lesson/notes/.
import { Lesson, Paged, Prose } from "@faraday-academy/runtime/blocks";
import { Notebook } from "./notes/Notebook";

export default function KanjiWriting() {
  return (
    <Lesson title="Write the kanji: 水 (water)">
      <Paged
        pages={[
          {
            id: "trace",
            title: "Trace it",
            content: (
              <div className="grid h-full gap-4 lg:grid-cols-[2fr_3fr]">
                <Prose>
                  <p>
                    Watch the stroke order, then write 水 three times. Press harder
                    for the thick strokes — the pen feels it.
                  </p>
                </Prose>
                <Notebook notebookId="kanji-water-trace" height={460} />
              </div>
            ),
          },
          {
            id: "freehand",
            title: "From memory",
            content: (
              <div className="grid h-full gap-4">
                <Prose>
                  <p>Now write it once without the guide.</p>
                </Prose>
                <Notebook notebookId="kanji-water-memory" height={460} />
              </div>
            ),
          },
        ]}
      />
    </Lesson>
  );
}
