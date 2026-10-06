/**
 * Host-site embed entry.
 *
 * The main diodes.com (or other) page can load the built ESM and mount HallSim
 * into any container — no URL routing, no history API usage.
 *
 * Example (after hosting dist/):
 *   import { mountHallSim } from "./assets/embed-xxxxx.js";
 *   const stop = mountHallSim(document.getElementById("hallsim"));
 *   // later: stop();
 */
import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import "./index.css";
import App from "./App";

export type HallSimHandle = {
  unmount: () => void;
};

export function mountHallSim(container: HTMLElement): HallSimHandle {
  const root: Root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  return {
    unmount: () => {
      root.unmount();
    },
  };
}

export default mountHallSim;
