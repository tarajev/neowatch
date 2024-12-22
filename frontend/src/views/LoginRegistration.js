import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, Exit, FormInput, Password, FormButton, Checkbox } from '../components/BasicComponents';
import CircularProgress from '@mui/material/CircularProgress';
import logo from '../resources/img/neowatchlogo.png';
import '../assets/colors.css';
import '../assets/animations.css';
import '../assets/App.css'
import axios from 'axios';
//import AuthorizationContext from '../context/AuthorizationContext';

export function DrawRegistration({ onLoginClick, exitRegistration, handleLoginClick }) {
  //const { APIUrl } = useContext(AuthorizationContext);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jmbg, setJMBG] = useState('');
  const [isJmbgValid, setJMBGValid] = useState(true);
  const [jmbgTouched, setJMBGTouched] = useState(false);
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [invalidJMBG, setInvalidJMBG] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const formRef = useRef(null); // Za click van forme

  const handleFirstNameChange = (e) => {
    const value = e.target.value.replace(/[0-9\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, '');
    setFirstName(value);
  };

  const handleLastNameChange = (e) => {
    const value = e.target.value.replace(/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/g, ''); // Space ne izbacujemo u slucaju da korisnik ima 2 prezimena
    setLastName(value);
  };

  const handleJMBGChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 13);
    setJMBG(value);
    setInvalidJMBG(false);
  };

  const handleJMBGBlur = () => {
    setJMBGTouched(true);
    setJMBGValid(jmbg.length === 13);
  };

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
    return !firstName ||
      !lastName ||
      !jmbg ||
      !email ||
      !password ||
      !confirmPassword ||
      !isEmailValid ||
      !passwordMatch;
  }


  const handleRegisterSubmit = async (event) => {
    event.preventDefault();

    //const jmbgResult = await axios.get(APIUrl + `Authentication/CheckJMBG/${jmbg}`);
    //const emailResult = await axios.get(APIUrl + `Authentication/CheckEmail/${email}`);

    //setInvalidJMBG(jmbgResult.data);
    // setInvalidEmail(emailResult.data);

    // if (!jmbgResult.data && !emailResult.data) {
    //   await axios.post(APIUrl + "Authentication/Register", {
    //     name: (firstName + " " + lastName),
    //     password: password,
    //     email: email,
    //     jmbg: jmbg
    //   })
    //     .then(response => {
    //       response.json()
    //     })
    //     .then(response => {
    //       console.log(response);
    //     })
    //     .catch(err => console.log(err));

    //   exitRegistration();
    // }
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
        <div ref={formRef} className='w-full max-w-sm p-6 bg-white mx-auto rounded-md shadow-2xl fade-in'>
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
              text="Ime"
              required
              value={firstName}
              onChange={handleFirstNameChange}
              pattern="[A-Za-z]*"
            />
            <FormInput
              text="Prezime"
              required
              value={lastName}
              onChange={handleLastNameChange}
              pattern="[A-Za-z ]*"
            />
            <FormInput
              text="JMBG"
              required
              value={jmbg}
              onBlur={handleJMBGBlur}
              onChange={handleJMBGChange}
              pattern="\d{13}"
              alertCond={(!isJmbgValid && jmbgTouched) || invalidJMBG}
              alertText={invalidJMBG ? "JMBG je već u upotrebi!" : "JMBG mora imati 13 cifara!"}
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
              <span className="block text-sm text-gray-700">
                <span className="text-sm text-red-600">*</span>
                Ova polja su obavezna.
              </span>
              <span className="text-sm text-gray-700">
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
    // await axios.post(APIUrl + "Authentication/Login", {
    //   email: email,
    //   password: password,
    // })
    //   .then(request => {
    //     let data = { ...request.data };

    //     var user = {
    //       ...data.user,
    //       jwtToken: data.jwtToken
    //     };

    //     delete user.password;
        
    //     contextSetUser(user);

    //     if (rememberLogin) {
    //       var now = new Date();
    //       now.setHours(now.getHours() + 6);
    //       localStorage.setItem('AptusMedicaUser', JSON.stringify(user));
    //       localStorage.setItem('AptusMedicaExpiryDate', now);
    //     }
    //     else {
    //       var now = new Date();
    //       now.setHours(now.getHours() + 6);
    //       sessionStorage.setItem('AptusMedicaUser', JSON.stringify(user));
    //       sessionStorage.setItem('AptusMedicaExpiryDate', now);
    //     }

    //     localStorage.setItem('AptusMedicaRememberLogin', rememberLogin);
    //     handleLoginClick();
    //   })
    //   .catch(error => {
    //     console.log(error);
    //     setLoginError("Pogrešan E-Mail ili Šifra!");
    //   })
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
    try {
      var route = `Guest/SendLoginCredentials/${email}`;

      setShowThrobber(true);
      // await axios.post(APIUrl + route, {},
      //   {
      //     headers: {
      //       Authorization: `Bearer ${contextUser.jwtToken}`
      //     }
      //   }
      // );

      setShowThrobber(false);
      setForgottenInfoSent(true);
    } catch (error) {
      setShowThrobber(false);
      console.log(error);
      setForgottenInfoError(error.response.status);
    }
  }

  return (
    <div className="overlay show">
      <div className="flex items-center justify-center h-screen">
        <div ref={formRef} className='w-full max-w-sm p-6 bg-white rounded-md shadow-2xl fade-in'>
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
              <span className="block text-sm text-gray-700">
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