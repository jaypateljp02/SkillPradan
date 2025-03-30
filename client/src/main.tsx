// Polyfill globals for peer.js and other node modules
// This needs to be at the top before any imports
window.global = window;
window.process = { env: {} };

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
