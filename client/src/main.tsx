import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set document language based on default account mode
document.documentElement.lang = "pt-BR";

createRoot(document.getElementById("root")!).render(<App />);
