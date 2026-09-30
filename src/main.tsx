
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import logo from "./imports/Photoroom_20250815_205827.PNG";
  import "./styles/index.css";

  const favicon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]') ?? document.createElement("link");
  favicon.rel = "icon";
  favicon.type = "image/png";
  favicon.href = logo;
  document.head.appendChild(favicon);

  createRoot(document.getElementById("root")!).render(<App />);
  