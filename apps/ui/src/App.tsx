import { useState } from "react";
import { ParamControl } from "./components/param-control";

const COMPONENTS = [
  {
    name: "param-control",
    title: "Param Control",
    description:
      "Sparse HUD slider + readout for a single manipulable STEM parameter. Safe over a fullscreen canvas.",
    registryPath: "/r/param-control.json",
  },
] as const;

export function App() {
  const [demo, setDemo] = useState(4);

  return (
    <main>
      <p style={{ letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 12, opacity: 0.7 }}>
        Faraday Academy · shadcn registry
      </p>
      <h1 className="brand">Education UI</h1>
      <p className="lede">
        Copy-only components for fullscreen 3D STEM lessons. Install via the shadcn
        registry — not <code>npm install @faraday-academy/ui</code>.
      </p>

      <div className="install">
        <code>npx shadcn@latest add http://localhost:4300/r/param-control.json</code>
      </div>

      <section className="catalog" aria-label="Component catalog">
        {COMPONENTS.map((c) => (
          <article key={c.name} className="item">
            <h2>{c.title}</h2>
            <p>{c.description}</p>
            <code>
              npx shadcn@latest add {"{origin}"}
              {c.registryPath}
            </code>
            {c.name === "param-control" ? (
              <div className="demo">
                <ParamControl
                  label="Period"
                  value={demo}
                  min={1}
                  max={12}
                  step={0.1}
                  unit="s"
                  onChange={setDemo}
                />
              </div>
            ) : null}
          </article>
        ))}
      </section>

      <p className="note">
        Registry index: <a href="/r/registry.json">/r/registry.json</a>. Used by the{" "}
        <strong>3d-stem</strong> skill when a lesson needs shared HUD chrome.
      </p>
    </main>
  );
}
