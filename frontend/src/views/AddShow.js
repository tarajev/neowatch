import React, { useState, useRef, useEffect, useContext } from 'react'
import { FormButton, FormInput, FileUpload } from '../components/BasicComponents'
import AuthorizationContext from '../context/AuthorizationContext';
import axios from 'axios';

import iconShow from "../resources/img/icon-series.png"

export default function DrawAddShow({ handleExitClick }) {
  const formRef = useRef(null); // Za click van forme
  const { contextUser, APIUrl } = useContext(AuthorizationContext);

  // Osnovne informacije
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [year, setYear] = useState('');
  const [picture, setPicture] = useState(null);
  const [numberOfSeasons, setNumberOfSeasons] = useState(1);
  const [genres, setGenres] = useState([]);
  const [cast, setCast] = useState([]);

  const [inputGenre, setInputGenre] = useState('');
  const [inputCast, setInputCast] = useState('');
  const [inputRole, setInputRole] = useState('');
  const [addShowEnabled, setAddShowEnabled] = useState(false);
  const [yearTouched, setYearTouched] = useState(false);
  const [seasonsTouched, setSeasonsTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (title && desc && (yearTouched && year.length == 4) && numberOfSeasons < 1 && picture && genres.length != 0 && cast.length != 0)
      setAddShowEnabled(true);
    else
      setAddShowEnabled(false);
  }, [title, desc, year, picture, numberOfSeasons])

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

  const addGenre = () => {
    if (inputGenre.trim() !== '' && !genres.includes(inputGenre))
      setGenres([...genres, inputGenre]);
  };

  const removeGenre = (indeks) => {
    const newList = genres.filter((_, index) => index !== indeks);
    setGenres(newList);
  };

  const addCast = () => { // Treba da se doda koji role je koji glumac imao
    if (inputCast.trim() !== '' && !cast.includes(inputCast))
      setGenres([...cast, inputCast]);
  };

  const removeCast = (indeks) => {
    const newList = cast.filter((_, index) => index !== indeks);
    setGenres(newList);
  };

  const addShow = async () => {
    var route = "Show/CreateAShow";
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
        <div ref={formRef} className='w-200 flex flex-col max-w-2xl p-6 bg-gray-900 border-y-4 border-violet-900 rounded-lg shadow-2xl shadow-violet-500/40 fade-in'>
          <div>
            <div>
              <div className='mb-4 w-full flex justify-center border-b border-violet-900'>
                <p className='mb-2 text-xl text-gray-400'>Add a show</p>
              </div>

              <div className='grid grid-cols-2'>
                <div className="border border-violet-900 rounded-xl p-4 my-2 mr-2">
                  <p className="text-white font-semibold justify-self-center">Profile photo:</p>
                  <div className="p-2 border border-white w-56 h-96 rounded-xl mt-5 justify-self-center flex items-center justify-center">
                    <img
                      src={picture == null ? iconShow : URL.createObjectURL(picture)}
                      className={`${picture == null ? "filter-white" : ""} w-26`}
                    />
                  </div>
                  <div className="justify-items-center mt-2">
                    <FileUpload buttonText="Add photo" setPicture={setPicture} />
                  </div>
                </div>
                <div className="border border-violet-900 rounded-xl p-4 my-2 ml-2">
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
                      text="Seasons"
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
                  
                </div>
                <div className='col-span-2 justify-items-center'>
                  <div>
                    <FormButton disabled={!addShowEnabled} loading={isLoading} className="justify-self-center !w-96" text={"Add show"} />
                    <span className="block text-sm text-gray-700 mt-2">
                      <span className="text-sm text-red-600">*</span>
                      These fields are required.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}