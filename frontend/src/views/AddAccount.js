import React, { useState, useRef, useEffect, useContext } from 'react'
import { Exit, FormButton, FormInput, Password } from '../components/BasicComponents'
import AuthorizationContext from '../context/AuthorizationContext';
import { useDebounce } from 'use-debounce';
import axios from 'axios';

export default function DrawAddProfile({ handleExitClick }) {
  const formRef = useRef(null); // Za click van forme
  const { APIUrl } = useContext(AuthorizationContext);

  // Osnovne informacije
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isEmailValid, setIsEmailValid] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidUsername, setInvalidUsername] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [exitForm, setExitForm] = useState(false);
  const [exitFormConfirm] = useDebounce(exitForm, 1000);

  useEffect(() => {
    if (exitFormConfirm)
      window.location.reload();
  }, [exitFormConfirm])

  const handleUsernameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
    setUsername(value);
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
    if (emailTouched)
      setIsEmailValid(validateEmail(e.target.value));
  };

  const createModeratorAccount = async () => {
    const emailResult = await axios.get(APIUrl + `Auth/CheckEmail/${email}`);
    setInvalidEmail(emailResult.data === 0 ? false : true);

    const usernameResult = await axios.get(APIUrl + `User/GetUserByUsername/${username}`);
    setInvalidUsername(usernameResult.data ? true : false);

    if (!emailResult.data && !usernameResult.data) {
      setIsLoading(true);
      await axios.post(APIUrl + "Auth/Register", {
        userName: username,
        email: email,
        password: password,
        role: "Moderator"
      })
        .then(() => {
          setSuccess(true);
          setExitForm(true);
        })
        .catch(err => console.error(err)); //ovde ako dodje do greške da se ispiše da se pokuša ponovo ili tako nesto
      setIsLoading(false);
    }
  }

  useEffect(() => { // Za click van forme
    function handleClickOutside(event) {
      if (formRef.current && !formRef.current.contains(event.target))
        handleExitClick();
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="left-0 top-0 overlay show">
      <div className="flex items-center hidescrollbar overscroll-contain justify-center h-screen overflow-y-auto">
        <div ref={formRef} className='w-96 flex flex-col max-w-2xl p-6 bg-gray-900 border-y-4 border-violet-900 rounded-lg shadow-2xl shadow-violet-500/40 fade-in'>
          <div>
            <div>
              <Exit className="w-4 ml-auto" onClick={handleExitClick} />
              <div className='mb-4 w-full justify-center flex border-b border-violet-900'>
                <p className='mb-2 text-xl text-gray-400 justify-self-center'>Create a moderator account</p>
              </div>

              <div className='mb-4'>
                <FormInput
                  text="Username:"
                  required
                  value={username}
                  onChange={handleUsernameChange}
                  alertText={"Username already exists!"}
                  alertCond={invalidUsername}
                />
                <FormInput
                  text="E-Mail:"
                  required
                  value={email}
                  onBlur={handleEmailBlur}
                  onChange={handleEmailChange}
                  alertText={"Email is already in use!"}
                  alertCond={!isEmailValid && emailTouched || invalidEmail}
                />
                <Password
                  text="Password:"
                  required
                  visibility
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <FormButton disabled={!username || (!isEmailValid && emailTouched) || !password} loading={isLoading} onClick={createModeratorAccount} text={"Create Moderator"} />
                {success ? (<p className='justify-self-center text-green-400 text-sm mt-2'>Successfully added a moderator account</p>) : null}
              </div>
            </div>

            <span className="block text-sm text-gray-700">
              <span className="text-sm text-red-600">*</span>
              These fields are required.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}