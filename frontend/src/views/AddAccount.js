import React, { useState, useRef, useEffect, useContext } from 'react'
import { FormButton, FormInput, Password } from '../components/BasicComponents'
import AuthorizationContext from '../context/AuthorizationContext';
import axios from 'axios';

export default function DrawAddProfile({ handleExitClick, handleUserCount }) {
  const formRef = useRef(null); // Za click van forme
  const { contextUser, APIUrl } = useContext(AuthorizationContext);

  // Osnovne informacije
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isEmailValid, setIsEmailValid] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

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

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

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
              <div className='mb-4 w-full flex justify-center border-b border-violet-900'>
                <p className='mb-2 text-xl text-gray-400'>Create a moderator account</p>
              </div>

              <div className='mb-4'>
                <FormInput
                  text="Username:"
                  required
                  value={username}
                  onChange={handleUsernameChange}
                />
                <FormInput
                  text="E-Mail:"
                  required
                  value={email}
                  onBlur={handleEmailBlur}
                  onChange={handleEmailChange}
                  alertCond={!isEmailValid && emailTouched}
                />
                <Password
                  text="Password:"
                  required
                  visibility
                  value={password}
                  onChange={handlePasswordChange}
                />
                <FormButton disabled={!username || (!isEmailValid && emailTouched) || !password} text={"Create Moderator"} />
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