import React, { useState, useContext } from "react";
import logo from '../resources/img/neowatchlogo.png';
import { Link } from '../components/BasicComponents';
import { DrawLogin, DrawRegistration } from "../views/LoginRegistration";
import Tooltip from "../components/Tooltip";
import iconSearch from "../resources/img/icon-search.png"
import iconBurger from "../resources/img/burger-menu.png"
import iconGears from "../resources/img/icon-gears.png"
import imagePlaceholder from "../resources/img/image-placeholder.png"
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
      jmbg: "",
      picture: null,
      description: ""
    })
    localStorage.clear();
    sessionStorage.clear();
  }

  // Nizovi potrebni za lepo inicijalizovanje BurgerMenija za telefon.
  const itemsPhone = [];
  switch (contextUser.role) {
    case "Nurse":
      itemsPhone.push(
        {
          label: 'Opcije profila', items: [
            { route: '/profile/', param: contextUser.id, name: "Profil" },
            { route: '/', onClick: logout, name: "Izlogujte se" },
          ]
        },
        {
          label: 'Pretraga',
          items: [
            { route: '/', name: "Pretraga bolesti" },
            { route: '/searchMedicine', name: "Pretraga lekova" },
            { route: '/searchDoctors', name: "Pretraga lekara" },
            { route: '/searchMedicalRecords', name: "Pretraga medicinskih kartona" },
          ]
        },
        {
          label: 'Karton',
          items: [
            { route: '/medicalRecord', name: "Medicinski karton" },
          ]
        },
      );
      break;
    case "Doctor":
      itemsPhone.push(
        {
          label: 'Opcije profila', items: [
            { route: '/profile/', param: contextUser.id, name: "Profil" },
            { route: '/', onClick: logout, name: "Izlogujte se" },
          ]
        },
        {
          label: 'Pretraga',
          items: [
            { route: '/', name: "Pretraga bolesti" },
            { route: '/searchMedicine', name: "Pretraga lekova" },
            { route: '/searchDoctors', name: "Pretraga lekara" },
            { route: '/searchMedicalRecords', name: "Pretraga medicinskih kartona" },
          ]
        },
        {
          label: 'Karton',
          items: [
            { route: '/medicalRecord', name: "Medicinski karton" },
          ]
        },
      );
      break;
    case "Moderator":
      itemsPhone.push(
        {
          label: 'Opcije profila', items: [
            { route: '/profile/', param: contextUser.id, name: "Profil" },
            { route: '/', onClick: logout, name: "Izlogujte se" },
          ]
        },
        {
          label: 'Pretraga',
          items: [
            { route: '/', name: "Pretraga bolesti" },
            { route: '/searchDoctors', name: "Pretraga lekara" },
          ]
        },
        {
          label: 'Upravljanje',
          items: [
            { route: '/adminPanel', name: "Administrativni panel" },
          ]
        },
      );
      break;
    case "Patient":
      itemsPhone.push(
        {
          label: 'Opcije profila', items: [
            { route: '/profile/', param: contextUser.id, name: "Profil" },
            { route: '/', onClick: logout, name: "Izlogujte se" },
          ]
        },
        {
          label: 'Pretraga',
          items: [
            { route: '/', name: "Pretraga bolesti" },
            { route: '/searchDoctors', name: "Pretraga lekara" },
          ]
        },
      );
      break;
    default:
      if (contextUser.id != -1) {
        itemsPhone.push(
          {
            label: 'Opcije profila', items: [
              { route: '/profile/', param: contextUser.id, name: "Profil" },
              { route: '/', onClick: logout, name: "Izlogujte se" },
            ]
          },
        );
      }
      else {
        itemsPhone.push(
          {
            label: 'Opcije profila', items: [
              { route: '/', onClick: handleLoginClick, name: "Ulogujte se" }
            ]
          }
        );
      }
      break;
  }

  const items = [
    { route: '/', name: "Pretraga bolesti" },
    ...(contextUser.role === "Nurse" || contextUser.role === "Doctor" ? [
      { route: '/searchMedicine', name: "Pretraga lekova" },
      { route: '/searchMedicalRecords', name: "Pretraga medicinskih kartona" },
    ] : []),
    { route: '/searchDoctors', name: "Pretraga lekara" },
  ];

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
            <BurgerMenu preventTab={overlayActive} icon={iconBurger} listItemArray={itemsPhone} grouped size={10} />
          </span>
          <span className="hidden sm:flex items-center border-y-2 border-secondary rounded-md mr-1 py-1 max-w-405">
            {contextUser.id != -1 ? (
              <>
                <Link className='mx-1 ml-2' route="/profile/" param={contextUser.id} preventTab={overlayActive}>
                  <div className="flex flex-wrap items-center">
                    <img src={contextUser.picture != null ? "http://localhost:5054" + contextUser.picture : imagePlaceholder} className="border border-primary rounded-full w-7 h-7 mr-2" />
                    <div className="text-nowrap truncate max-w-160">
                      {contextUser.name}
                    </div>
                  </div>
                </Link>
                <span className="color-primary mb-1 mx-1">|</span>
              </>
            ) : null}

            {contextUser.id != -1 ?
              <>
                <BurgerMenu preventTab={overlayActive} icon={iconSearch} hoverText="Pretražite..." filter listItemArray={items} xOffset={-10} yOffset={10} size={6} className={`${contextUser.id == -1 ? 'ml-1' : ''} mr-1`} />
                <span className="color-primary mb-1">|</span>
              </> : null}

            {contextUser.role == "Moderator" ?
              <>
                <Link preventTab={overlayActive} route='/adminPanel' className='px-2 py-1 flex items-center'>
                  <Tooltip text="Administrativni panel">
                    <img
                      tabIndex={-1}
                      src={iconGears}
                      className='h-6 w-6 outline-none filter-primary'
                    />
                  </Tooltip>
                </Link>
                <span className="color-primary mb-1 mr-1">|</span>
              </> : null}

            {contextUser.id != -1 &&
              <>
                <Link className="mx-2" route="/" onClick={logout} preventTab={overlayActive}    >
                  Izlogujte se
                </Link>
              </>
            }

            {contextUser.id == -1 &&
              <>
                <Link className='mx-2 color-secondary text-gray-400' preventTab={overlayActive} onClick={handleLoginClick}>
                  Ulogujte se
                </Link>
              </>}
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