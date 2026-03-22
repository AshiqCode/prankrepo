import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import SAPPortal from "./Login";
import Admin from "./Admin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SAPPortal />} />
        <Route path="/AdminBhai006" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
