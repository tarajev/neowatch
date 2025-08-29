import MainPage from "./views/MainPage"
import Profile from "./views/Profile"
import ModeratorPage from './views/ModeratorPage'
import AuthorizationContext from './context/AuthorizationContext';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState } from 'react';
import DrawNotFound from "./views/NotFound";
import ReviewPage from "./views/ReviewsPage";

function App() {

  const [contextUser, contextSetUser] = useState({
    username: "",
    role: "Guest",
    jwtToken: "",
    email: "",
    picture: "",
    bio: "",
  });

  const APIUrl = "http://localhost:5227/";
  const value = { APIUrl, contextUser, contextSetUser };

  var storageUser = localStorage.getItem('NeowatchUser');

  if (contextUser.role == "Guest"  && storageUser) { //ako se osvezi stranica
    var storageUserJson = JSON.parse(storageUser);
    contextSetUser(storageUserJson);
  }

  return (
    <div>
      <AuthorizationContext.Provider value={value}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/profile/:username/:tab" element={<Profile />} />
            <Route path="/moderatorpage" element={<ModeratorPage />} />
            <Route path="/reviews/:showTitle" element={<ReviewPage />} />
            <Route path="*" element={<DrawNotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthorizationContext.Provider>
    </div>
  );
}

export default App;
