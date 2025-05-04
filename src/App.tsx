import { RouterProvider } from "react-router-dom";
import { router } from "./lib/router";
import { registerCompositionsFromConfig } from "./lib/registry";
import { compositions } from "./compositions.config";

// Register all compositions when the app starts
registerCompositionsFromConfig(compositions);

export default function App() {
  return <RouterProvider router={router} />;
}
