import LandingPage from "./views/LandingPage"
import MainPage from "./views/MainPage"
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
