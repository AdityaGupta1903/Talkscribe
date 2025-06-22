import "./App.css";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import { Sender } from "./components/Sender";
import { Receiver } from "./components/Receiver";
import Video from "./components/Video";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sender" element={<Sender />} />
        <Route path="/receiver" element={<Receiver />} />
        <Route path="/video" element={<Video />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
