import "./App.css";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Video from "./components/Video";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/video" element={<Video />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
