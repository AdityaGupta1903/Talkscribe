import "./App.css";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import CallSetup from "./components/CallSetup";
import LandingPage from "./components/Landing";
import Call from "./components/Call";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/video" element={<CallSetup />} />
          <Route path="/call" element={<Call />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
