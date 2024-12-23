import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, Exit, FormInput, Password, FormButton, Checkbox } from '../components/BasicComponents';
import CircularProgress from '@mui/material/CircularProgress';
import logo from '../resources/img/neowatchlogo.png';
import '../assets/colors.css';
import '../assets/animations.css';
import '../assets/App.css'
import axios from 'axios';
import AuthorizationContext from '../context/AuthorizationContext';

export function DrawRegistration({ onLoginClick, exitRegistration, handleLoginClick }) {
  const { APIUrl } = useContext(AuthorizationContext);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const formRef = useRef(null); // Za click van forme
  
  const handleUsernameChange = (e) => {
    setUserName(e.target.value); // Treba regex da se uradi
  }

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)$/;
    return emailRegex.test(email);
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setIsEmailValid(validateEmail(email));
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setInvalidEmail(false);
    if (emailTouched)
      setIsEmailValid(validateEmail(e.target.value));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setPasswordMatch(e.target.value === password);
  };

  const disableSubmit = () => {
    return !userName ||
      !email ||
      !password ||
      !confirmPassword ||
      !isEmailValid ||
      !passwordMatch;
  }


  const handleRegisterSubmit = async (event) => {
    event.preventDefault();

    const emailResult = await axios.get(APIUrl + `Authentication/CheckEmail/${email}`);

    setInvalidEmail(emailResult.data);

    if (!emailResult.data) {
      await axios.post(APIUrl + "Authentication/Register", {
        userName: userName,
        email: email,
        password: password
      })
        .then(response => {
          response.json()
        })
        .then(response => {
          console.log(response);
        })
        .catch(err => console.log(err));

      exitRegistration();
    }
  }

  const exitRegistrationForm = () => {
    handleLoginClick();
    exitRegistration();
  }

  useEffect(() => { // Za click van forme
    function handleClickOutside(event) {
      if (formRef.current && !formRef.current.contains(event.target))
        exitRegistrationForm();
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleLoginClick]);

  return (
    <div className="overlay show">
      <div className="sm:flex sm:items-center hidescrollbar sm:justify-center h-screen overflow-y-auto">
        <div ref={formRef} className='w-full max-w-sm p-6 bg-gray-900 mx-auto rounded-md shadow-2xl fade-in'>
          <Exit
            blue
            className="ml-auto text-sm w-4"
            onClick={exitRegistrationForm}
          />
          <img
            className="mx-auto w-auto h-16"
            src={logo}
          />
          <form className="mt-4" onSubmit={handleRegisterSubmit}>
            <FormInput
              text="Korisničko ime"
              required
              value={userName}
              onChange={handleUsernameChange}
            />
            <FormInput
              text="EMail"
              type="email"
              required
              value={email}
              onBlur={handleEmailBlur}
              onChange={handleEmailChange}
              alertCond={(!isEmailValid && emailTouched) || invalidEmail}
              alertText={invalidEmail ? "Email je već u upotrebi!" : "Neispravan email format!"}
            />
            <Password
              text="Šifra"
              required
              visibility
              value={password}
              onChange={handlePasswordChange}
            />
            <Password
              text="Ponovite šifru"
              required
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              onBlur={handlePasswordBlur}
              alertCond={!passwordMatch && passwordTouched}
              alertText="Šifre se ne podudaraju!"
            />
            <FormButton
              text="Registrujte se"
              disabled={disableSubmit()}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="block text-sm text-gray-400">
                <span className="text-sm text-red-600">*</span>
                Ova polja su obavezna.
              </span>
              <span className="text-sm text-gray-400">
                Imate nalog?
                <Link href="#" className="text-sm ml-1" onClick={onLoginClick}>
                  Ulogujte se.
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function DrawLogin({ onRegisterClick, handleLoginClick }) {
  //const { APIUrl, contextUser, contextSetUser } = useContext(AuthorizationContext);
  const [loginError, setLoginError] = useState("");
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState('');
  const [rememberLogin, setRememberLogin] = useState(false);
  const [forgottenInfo, setForgottenInfo] = useState(false);
  const [forgottenInfoSent, setForgottenInfoSent] = useState(false);
  const [forgottenInfoError, setForgottenInfoError] = useState(null);
  const [showThrobber, setShowThrobber] = useState(false);

  const formRef = useRef(null); // Za click van forme
  const isFormValid = email.trim() !== '' && password.trim() !== '';

  useEffect(() => {
    setTimeout(() => {
      setForgottenInfoError(null);
      setForgottenInfoSent(false);
    }, 3000);
  }, [forgottenInfoSent, forgottenInfoError])

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailTouched)
      setIsEmailValid(validateEmail(e.target.value));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setIsEmailValid(validateEmail(email));
  };

  const handleRememberLogin = () => {
    setRememberLogin(!rememberLogin);
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    
    // TODO
  }

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)$/;
    return emailRegex.test(email);
  };

  useEffect(() => { // Za click van forme
    function handleClickOutside(event) {
      if (formRef.current && !formRef.current.contains(event.target))
        handleLoginClick();
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleLoginClick]);

  useEffect(() => {
    if (forgottenInfo) {
      forgottenLoginCredentials(email);
    }
    setForgottenInfo(false);
  }, [forgottenInfo]);

  const forgottenLoginCredentials = async (email) => {
    // TOOD
  }

  return (
    <div className="overlay show">
      <div className="flex items-center justify-center h-screen">
        <div ref={formRef} className='w-full max-w-sm p-6 bg-gray-900 rounded-md shadow-2xl fade-in'>
          <Exit
            blue
            className="ml-auto text-sm w-4"
            onClick={handleLoginClick}
          />

          <div className="flex items-center justify-center">
            <img
              className="w-auto h-16"
              src={logo}
            />
          </div>

          <form onSubmit={handleLoginSubmit} className="mt-4">
            <FormInput
              text="EMail"
              type="email"
              value={email}
              alertCond={!isEmailValid}
              alertText="Neispravan email format!"
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
            />

            <Password
              text="Šifra"
              visibility
              value={password}
              onChange={handlePasswordChange}
            />

            <div className="flex items-center justify-between mt-4">
              <Checkbox value={rememberLogin} onChange={handleRememberLogin}>
                Zapamti me
              </Checkbox>

              <Link href="#" onClick={() => setForgottenInfo(true)} disabled={isEmailValid ? false : true} className="text-sm">
                Zaboravili ste šifru?
              </Link>
            </div>

            <FormButton text="Ulogujte se" disabled={!isFormValid} />

            <div className="flex justify-end mt-3">
              <span className="block text-sm text-gray-400">
                Nemate nalog?
              </span>
              <Link href="#" className="text-sm ml-1" onClick={onRegisterClick}>
                Registrujte se.
              </Link>
            </div>
            <div className="flex justify-center mt-3 color-primary">
              {showThrobber && <CircularProgress color="inherit" size="1.5rem" />}
              {loginError.length > 0 && <span className="text-red-500"> {loginError} </span>}
              {forgottenInfoSent && !forgottenInfoError && <span className='color-primary'>Uspešno poslata šifra na mail-u!</span>}
              {forgottenInfoError && <span className='text-red-500'>{forgottenInfoError !== 400 ? "Unesite mail u odgovarajućem polju." : "Korisnik nije pronadjen."}</span>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}