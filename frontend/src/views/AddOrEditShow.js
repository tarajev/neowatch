import React, { useState, useRef, useEffect, useContext } from 'react'
import { FormButton, FormInput, FileUpload, Exit } from '../components/BasicComponents'
import AuthorizationContext from '../context/AuthorizationContext';
import { useDebounce } from 'use-debounce';
import axios from 'axios';

import iconShow from "../resources/img/icon-series.png"

export default function DrawAddOrEditShow({ handleExitClick, handleShowCount, editShow }) {
  const formRef = useRef(null); // Za click van forme
  const { contextUser, APIUrl } = useContext(AuthorizationContext);

  // Osnovne informacije
  const [title, setTitle] = useState(editShow ? editShow.title : '');
  const [desc, setDesc] = useState(editShow ? editShow.desc : '');
  const [year, setYear] = useState(editShow ? editShow.year : '');
  const [picture, setPicture] = useState(editShow ? editShow.imageUrl : null);
  const [numberOfSeasons, setNumberOfSeasons] = useState(editShow ? editShow.numberOfSeasons : 1);
  const [genres, setGenres] = useState(editShow ? editShow.genres : []);
  const [cast, setCast] = useState(editShow ? editShow.cast : []);

  const [currentActorWithoutRole, setCurrentActor] = useState("");
  const [confirmDeletion, setConfirmDeletion] = useState(false);
  const [changedPicture, setChangedPicture] = useState("");
  const [oldTitle, setOldTitle] = useState(editShow ? editShow.title : '');

  const [inputGenre, setInputGenre] = useState('');
  const [inputCastOrRole, setInputCastOrRole] = useState('');
  const [addShowEnabled, setAddShowEnabled] = useState(false);
  const [yearTouched, setYearTouched] = useState(false);
  const [seasonsTouched, setSeasonsTouched] = useState(false);
  const [genresTouched, setGenresTouched] = useState(false);
  const [castTouched, setCastTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [exitForm, setExitForm] = useState(false);
  const [exitFormConfirm] = useDebounce(exitForm, 1000);

  useEffect(() => {
    if (title && desc && year.length == 4 && numberOfSeasons > 0 && (picture || changedPicture != "") && genres.length != 0 && cast.length != 0)
      setAddShowEnabled(true);
    else
      setAddShowEnabled(false);
  }, [title, desc, year, numberOfSeasons, picture, changedPicture, genres, cast])

  useEffect(() => {
    if (exitFormConfirm)
      handleExitClick();
  }, [exitFormConfirm])

  const handleNumberOfSeasonsChange = (e) => {
    const regex = /^\d*$/; // Samo brojevi

    if (regex.test(e.target.value)) {
      setNumberOfSeasons(e.target.value);
    }
  };

  const handleGenresChange = (e) => {
    const regex = /^[A-Za-z]*$/; // Samo slova

    if (regex.test(e.target.value)) {
      setInputGenre(e.target.value);
    }
  };

  const handleYearChange = (e) => {
    const regex = /^\d{0,4}$/; // 4 Broja

    if (regex.test(e.target.value)) {
      setYear(e.target.value);
    }
  };

  const handleGenreKeyPress = (e) => {
    if (e.key === 'Enter') {
      addGenre();
      setInputGenre("");
    }
  };

  const handleCastOrRoleInput = (e) => {
    const regex = /^[A-Za-z\s]*$/; // Samo slova i razmak

    if (regex.test(e.target.value)) {
      setInputCastOrRole(e.target.value);
    }
  }

  const handleCastOrRoleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (currentActorWithoutRole == "") {
        setCurrentActor(inputCastOrRole);
      }
      else {
        if (inputCastOrRole == "") return;

        const newActedIn = {
          actor: { name: currentActorWithoutRole },
          role: inputCastOrRole
        }

        addCast(newActedIn);
        setCurrentActor("");
      }

      setInputCastOrRole("");
    }
  }

  const addGenre = () => {
    const formattedGenre = inputGenre.charAt(0).toUpperCase() + inputGenre.slice(1).toLowerCase(); // Prvo slovo uppercase, ostala lowercase
    const genreObject = { name: formattedGenre.trim() };

    if (genreObject.name !== '' && !genres.some(g => g.name === genreObject.name))
      setGenres([...genres, genreObject]);
  };

  const removeGenre = (indeks) => {
    const newList = genres.filter((_, index) => index !== indeks);
    setGenres(newList);
  };

  const addCast = (newActor) => {
    if (!cast.includes(newActor))
      setCast([...cast, newActor]);
  };

  const removeCast = (indeks) => {
    const newList = cast.filter((_, index) => index !== indeks);
    setCast(newList);
  };

  const addShow = async () => {
    var route = "Show/CreateAShow";

    const newShow = {
      title: title.trim(),
      desc: desc.trim(),
      year: year.toString(),
      numberOfSeasons: numberOfSeasons,
      genres: genres,
      cast: cast
    }

    setIsLoading(true);
    var route = `Show/CreateAShow`;
    await axios.post(APIUrl + route, newShow, {
      headers: {
        Authorization: `Bearer ${contextUser.jwtToken}`,
        "Content-Type": "application/json"
      }
    })
      .then(result => {
        handleShowCount();
        setExitForm(true);
      })
      .catch(error => {
        console.log(error);
      })

    if (typeof changedPicture !== 'string' || (typeof changedPicture === 'string' && picture.trim() !== changedPicture.trim() && changedPicture != "")) {
      const formData = new FormData();
      formData.append('file', changedPicture);
      route = `Show/UploadShowThumbnail/${title}`;

      await axios.put(APIUrl + route, formData, {
        headers: {
          Authorization: `Bearer ${contextUser.jwtToken}`,
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(result => {
          console.log(result);
        })
        .catch(error => {
          console.log(error)
        })
    }

    setIsLoading(false);
  }

  const updateShow = async () => {
    if (oldTitle == '') return;

    var route = `Show/UpdateAShow/${oldTitle}`;
    const updatedShow = {
      title: title.trim(),
      desc: desc.trim(),
      year: year.toString(),
      numberOfSeasons: numberOfSeasons,
      genres: genres,
      cast: cast
    }

    setIsLoading(true);
    await axios.put(APIUrl + route, updatedShow, {
      headers: {
        Authorization: `Bearer ${contextUser.jwtToken}`,
        "Content-Type": "application/json"
      }
    })
      .then(() => {
        setExitForm(true);
      })
      .catch(error => {
        console.log(error);
      })

    if (typeof changedPicture !== 'string' || (typeof changedPicture === 'string' && picture.trim() !== changedPicture.trim() && changedPicture != "")) {
      const formData = new FormData();
      formData.append('file', changedPicture);
      route = `Show/UploadShowThumbnail/${title}`;

      await axios.put(APIUrl + route, formData, {
        headers: {
          Authorization: `Bearer ${contextUser.jwtToken}`,
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(result => {
          console.log(result.data)
        })
        .catch(error => {
          console.log(error)
        })
    }

    setIsLoading(false);
  }

  const deleteShow = async () => {
    if (!editShow || !editShow.title) {
      console.error("No show selected for deletion.");
      return;
    }

    var route = `Show/DeleteAShow/${editShow.title}`;

    await axios.delete(APIUrl + route, {
      headers: {
        Authorization: `Bearer ${contextUser.jwtToken}`
      }
    })
      .then(result => {
        console.log("Show deleted successfully:", result.data);
        window.location.reload();
      })
      .catch(error => {
        console.error("Error deleting the show:", error);
      });
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
        <div ref={formRef} className='w-250 flex flex-col p-6 bg-gray-900 border-y-4 border-violet-900 rounded-lg shadow-2xl shadow-violet-500/40 fade-in'>
          <div className='mb-4 w-full flex justify-center border-b border-violet-900'>
            <p className='mb-2 text-xl text-gray-400'>Add a show</p>
          </div>

          <div className='grid grid-cols-3'>
            <div className="border border-violet-900 rounded-xl p-4 my-2 mr-2">
              <div className='flex justify-center'>
                <p className="text-gray-400">Thumbnail:</p>
                <p className='text-red-600'>*</p>
              </div>
              <div className="p-2 border border-white w-56 h-96 rounded-xl mt-5 justify-self-center flex items-center justify-center">
                <img
                  src={changedPicture == "" ? (picture == null ? iconShow : `http://localhost:5227${picture}`) : URL.createObjectURL(changedPicture)}
                  className={`${picture == null && changedPicture == "" ? "filter-white" : ""} w-26`}
                />
              </div>
              <div className="justify-items-center mt-2">
                <FileUpload buttonText={`${editShow ? "Update" : "Add"} Photo`} setPicture={setChangedPicture} />
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
                  text="Release year:"
                  required
                  value={year}
                  onBlur={() => setYearTouched(true)}
                  onChange={handleYearChange}
                  alertCond={yearTouched && year.length != 4}
                />
                <FormInput
                  text="Seasons:"
                  required
                  value={numberOfSeasons}
                  onBlur={() => setSeasonsTouched(true)}
                  onChange={handleNumberOfSeasonsChange}
                  alertCond={seasonsTouched && !numberOfSeasons}
                />
              </div>
              <div className="border border-violet-900 rounded-xl pt-0 px-1 pb-1 -m-2 my-3">
                <FormInput
                  text="Genres:"
                  required
                  value={inputGenre}
                  onBlur={() => setGenresTouched(true)}
                  onChange={handleGenresChange}
                  onKeyDown={handleGenreKeyPress}
                  alertCond={genresTouched && genres.length == 0}
                />
                <div className='flex flex-wrap text-gray-400 mt-1 px-1 rounded-l bg-indigo-950 h-20 overflow-auto'>
                  <DrawGenreTags />
                </div>
              </div>
              <div className="border border-violet-900 rounded-xl px-1 pb-1 -m-2 my-3">
                <FormInput
                  text={`${(currentActorWithoutRole ? `${currentActorWithoutRole}'s Role:` : "Cast:")}`}
                  required
                  value={inputCastOrRole}
                  onBlur={() => setCastTouched(true)}
                  className="!mt-0"
                  onChange={handleCastOrRoleInput}
                  onKeyDown={handleCastOrRoleKeyPress}
                  alertCond={castTouched && cast.length == 0}
                />
                <div className='flex flex-wrap text-gray-400 mt-1 px-1 rounded-l bg-indigo-950 h-20 overflow-x-visible overflow-y-auto'>
                  <DrawCastTags />
                </div>
              </div>
            </div>

            <div className="border border-violet-900 rounded-xl p-4 my-2 ml-2">
              <FormInput
                text="Description:"
                required
                multiline
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className={`${editShow ? "h-80" : "h-96"}`}
              />

              <FormButton disabled={!addShowEnabled} loading={isLoading} className="justify-self-center" onClick={editShow ? updateShow : addShow} text={`${editShow ? "Update" : "Add"} Show`} />
              {editShow ? (
                <FormButton className="justify-self-center !bg-red-900 hover:!bg-red-600" onClick={confirmDeletion ? () => deleteShow() : () => setConfirmDeletion(true)} text={`${confirmDeletion ? "Really Delete?" : "Delete Show"}`} />
              ) : null}
              {exitForm ? (
                <span className="block text-sm text-green-400 mt-2">
                  Successfully {editShow ? "updated" : "added"} a show
                </span>
              ) : (
                <span className="block text-sm text-gray-500 mt-2">
                  <span className="text-sm text-red-600">*</span>
                  These fields are required.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function DrawGenreTags() {
    return genres.map((item, index) => (
      <GenreTag key={index} genre={item} onDelete={() => removeGenre(index)} />
    ));
  }

  function GenreTag({ genre, onDelete }) {
    return (
      <div className='mr-2 my-1 px-2 py-1 bg-violet-900 h-fit rounded-lg flex flex-wrap items-center'>
        {genre.name}
        <Exit
          blue
          onClick={onDelete}
          className="ml-2 w-2"
        />
      </div>
    );
  }

  function DrawCastTags() {
    return cast.map((item, index) => (
      <CastTag key={index} cast={item} onDelete={() => removeCast(index)} />
    ));
  }

  function CastTag({ cast, onDelete }) {
    const [hovered, setHovered] = useState(false);

    return (
      <div
        className='my-1 px-2 py-1 bg-violet-900 rounded-lg h-fit !w-full flex flex-wrap items-center'
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered ? cast.role : cast.actor.name}
        <Exit
          blue
          onClick={onDelete}
          className="ml-2 w-2"
        />
      </div>
    );
  }
}
