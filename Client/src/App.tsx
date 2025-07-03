import "./App.css";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import CallSetup from "./components/CallSetup";
import LandingPage from "./components/Landing";
import Call from "./components/Call";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/video" element={<CallSetup />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/call" element={<Call />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
