import "./App.css";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Video from "./components/Video";
import LandingPage from "./components/Landing";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/video" element={<Video />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
