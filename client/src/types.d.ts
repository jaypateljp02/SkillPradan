// Add global declarations for node.js polyfills
interface Window {
  global: Window;
  process: {
    env: Record<string, string>;
  };
}