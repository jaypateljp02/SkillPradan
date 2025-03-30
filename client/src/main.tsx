// Polyfill globals for peer.js and other node modules
// This needs to be at the top before any imports
window.global = window;
// Adding minimal process implementation to avoid TypeScript errors
window.process = { 
  env: {} as Record<string, string>,
  // Add minimal Process interface properties to satisfy TypeScript
  stdout: null,
  stderr: null,
  stdin: null,
  argv: [],
  argv0: '',
  execArgv: [],
  execPath: ''
} as any;

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
