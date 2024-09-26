import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./containers";

// 대신에 여러분이 작성한 React 컴포넌트를 렌더링합니다.
const container = document.getElementById("root")!;

const root = createRoot(container);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
