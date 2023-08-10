import {BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home"; 
import Boxes from "./pages/Boxes";
import Layout from "./pages/Layout";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import {Login, UserProvider} from "./Services/Login";


function App() {
  return (
    <UserProvider>
    <BrowserRouter>
    <Routes>
      <Route basename="/qrstoragev2/"></Route>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="boxes/*" element={<Boxes />} />
        <Route path="settings" element={<Settings />} />
        <Route path ="login" element={<Login />}/>
        <Route path ="profile" element= {<Profile/>}/> 
      </Route>
    </Routes>
  </BrowserRouter>
  </UserProvider>
);
}

export default App;
