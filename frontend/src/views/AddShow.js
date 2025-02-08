import React, { useState, useRef, useEffect, useContext } from 'react'
import { FormButton, FormInput, Password } from '../components/BasicComponents'
import AuthorizationContext from '../context/AuthorizationContext';
import axios from 'axios';

export default function DrawAddShow({ handleExitClick, handleShowCount }) {
  const formRef = useRef(null); // Za click van forme
  const { contextUser, APIUrl } = useContext(AuthorizationContext);

  // Osnovne informacije
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [year, setYear] = useState('');
  const [numberOfSeasons, setNumberOfSeasons] = useState(1);

  const [yearTouched, setYearTouched] = useState(false);
  const [seasonsTouched, setSeasonsTouched] = useState(false);

  const handleNumberOfSeasonsChange = (e) => {
    const regex = /^\d*$/; // Samo brojevi
  
    if (regex.test(e.target.value)) {
      setNumberOfSeasons(e.target.value);
    }
  };

  const handleYearChange = (e) => {
    const regex = /^\d{0,4}$/; // 4 Broja
    
    if (regex.test(e.target.value)) {
      setYear(e.target.value);
    }
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
                <p className='mb-2 text-xl text-gray-400'>Add a show</p>
              </div>

              <div className='mb-4'>
                <FormInput
                  text="Title:"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div className='grid grid-cols-2 gap-4'>
                  <FormInput
                    text="Release year"
                    required
                    value={year}
                    onBlur={() => setYearTouched(true)}
                    onChange={handleYearChange}
                    alertCond={yearTouched && year.length != 4}
                  />
                  <FormInput
                    text="Number of seasons"
                    required
                    value={numberOfSeasons}
                    onBlur={() => setSeasonsTouched(true)}
                    onChange={handleNumberOfSeasonsChange}
                    alertCond={seasonsTouched && !numberOfSeasons}
                  />
                </div>
                <FormInput 
                  text="Description"
                  required
                  multiline
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className={"h-44"}
                />
                <FormButton disabled={!title || !desc || (yearTouched && year.length != 4) || !numberOfSeasons} text={"Add show"} />
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