import React, { useState, useContext } from "react";
import logo from '../resources/img/neowatchlogo.png';
import { Link } from '../components/BasicComponents';
import { DrawLogin, DrawRegistration } from "../views/LoginRegistration";
import iconBurger from "../resources/img/burger-menu.png"
import BurgerMenu from "./BurgerMenu";
import AuthorizationContext from "../context/AuthorizationContext";
import '../assets/colors.css'
import '../assets/App.css'

export default function Header({ overlayActive, overlayHandler }) {
  const { contextUser, contextSetUser } = useContext(AuthorizationContext);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

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

  const logout = () => {
    contextSetUser({
      id: -1,
      name: "",
      role: "Guest",
      jwtToken: "",
      email: "",
      picture: null,
      bio: ""
    })
    localStorage.clear();
    sessionStorage.clear();
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
          <span className="hidden sm:flex items-center border-y-2 border-secondary rounded-md mr-1 py-1 max-w-405">
            {contextUser.id == -1 &&
              <>
                <Link className='mx-2 color-secondary text-gray-400' preventTab={overlayActive} onClick={handleLoginClick}>
                  Ulogujte se
                </Link>
              </>
            }
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