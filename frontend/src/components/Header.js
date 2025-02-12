import React, { useState, useContext } from "react";
import logo from '../resources/img/neowatchlogo.png';
import { Link } from '../components/BasicComponents';
import { DrawLogin, DrawRegistration } from "../views/LoginRegistration";
import BurgerMenu from "./BurgerMenu";
import AuthorizationContext from "../context/AuthorizationContext";
import '../assets/colors.css'
import '../assets/App.css'

import iconGear from "../resources/img/icon-gear.png"
import iconBurger from "../resources/img/burger-menu.png"
import iconUser from "../resources/img/icon-user.png"
import { useNavigate } from "react-router-dom";
import Tooltip from "./Tooltip";

export default function Header({ overlayActive, overlayHandler }) {
  const { contextUser, contextSetUser } = useContext(AuthorizationContext);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const toggleRegistration = () => {
    setShowRegistration(!showRegistration);
  };

  const exitRegistration = () => {
    setShowRegistration(false);
  }

  const handleLoginClick = () => {
    setShowLogin(!showLogin);
    if (overlayHandler != null)
      overlayHandler(!showLogin);
  };

  const openProfile = (username) => {
    navigate(`../profile/${username}/watching`);
    window.location.reload();
  }

  const handleLogout = () => {
    contextSetUser({
      username: "",
      role: "Guest",
      jwtToken: "",
      email: "",
      picture: null,
      bio: ""
    })
    localStorage.clear();
    sessionStorage.clear();

    navigate("/");
    window.location.reload();
  }

  // TODO - BurgerMenu itemList da se uradi
  // TODO - contextUser da se uradi dinamicki Header

  return (
    <div className={`pt-16 sticky top-0 z-50`}>
      {showLogin && <div className="overlay" onClick={handleLoginClick}></div>}
      {showLogin && <DrawLoginForm showRegistration={showRegistration} exitRegistration={exitRegistration} toggleRegistration={toggleRegistration} handleLoginClick={handleLoginClick} />}
      <nav className="absolute shadow-xl top-0 left-0 w-full border-b border-black bg-indigo-950 md:flex-row md:flex-nowrap md:justify-start flex items-center p-2">
        <div className="w-full mx-auto items-center flex justify-between md:flex-nowrap flex-wrap md:px-10 px-2">
          <Link route="/" preventTab={overlayActive}>
            <img
              className="w-auto h-12 cursor-pointer"
              src={logo}
            />
          </Link>
          <span className="block sm:hidden">
            <BurgerMenu preventTab={overlayActive} icon={iconBurger} listItemArray={null} grouped size={10} />
          </span>
          <span className="hidden sm:flex items-center border-y-2 border-gray-400 rounded-md mr-1 py-1 max-w-405">
            {contextUser.role == "Guest" ? (
              <Link className='mx-2 text-white' preventTab={overlayActive} onClick={handleLoginClick}>
                Log in
              </Link>) : null}

            {contextUser.role == "User" ? (
              <>
                <Link className='mx-1 ml-2' onClick={() => openProfile(contextUser.username)} preventTab={overlayActive}>
                  <div className="flex flex-wrap items-center">
                    <img src={contextUser.picture != null ? `http://localhost:5227${contextUser.picture}` : iconUser} className={`${contextUser.picture == null && "filter-white"} border border-indigo rounded-full w-7 h-7 mr-2`} />
                    <div className="text-nowrap truncate text-white max-w-160">
                      {contextUser.username}
                    </div>
                  </div>
                </Link>
                <span className="text-gray-400 mb-1 mx-1">|</span>
              </>
            ) : null}

            {contextUser.role == "Moderator" ? (
              <>
                <Link className='!text-white mx-1 ml-2' route="/moderatorpage" preventTab={overlayActive}>
                  <div className="flex flex-wrap items-center">
                    <Tooltip text="Moderator Page">
                      <img src={iconGear} className="filter-white border border-indigo rounded-full w-7 h-7 mr-2" />
                    </Tooltip>
                  </div>
                </Link>
                <span className="text-gray-400 mb-1 mr-1">|</span>
              </>
            ) : null}

            {contextUser.role != "Guest" ? (
              <Link className='mx-2 text-white' preventTab={overlayActive} onClick={handleLogout}>
                Log out
              </Link>) : null}
          </span>
        </div>
      </nav>
    </div>
  );
}

function DrawLoginForm({ showRegistration, exitRegistration, toggleRegistration, handleLoginClick }) {
  return (
    <>
      {showRegistration ? (
        <DrawRegistration onLoginClick={toggleRegistration} exitRegistration={exitRegistration} handleLoginClick={handleLoginClick} />
      ) : (
        <DrawLogin onRegisterClick={toggleRegistration} handleLoginClick={handleLoginClick} />
      )}
    </>
  );
}