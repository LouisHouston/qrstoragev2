import {BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home"; 
import Boxes from "./pages/Boxes";
import Layout from "./pages/Layout";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="boxes" element={<Boxes />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
}

export default App;
