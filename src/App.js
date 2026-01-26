import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import SecurityCheck from "./Login";
import Admin from "./Admin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SecurityCheck />} />
        <Route path="/AdminBhai" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
