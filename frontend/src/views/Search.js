import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { useDebounce } from 'use-debounce';
import { Page, Input, Link } from '../components/BasicComponents';
import axios from 'axios';
import qs from 'qs';
import AuthorizationContext from '../context/AuthorizationContext';
import '../assets/colors.css'
import '../assets/animations.css'
import Select from "react-select";
import ShowInfo from './ShowInfo';

export default function DrawSearchTvShows() {
  const { APIUrl, contextUser } = useContext(AuthorizationContext);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [searched, setSearched] = useState(false);
  const [debouncedSearch] = useDebounce(search, 300);
  //const [tvShows, setTvShows] = useState(null);
  const [keyDown, setKeyDown] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [mostWatchedShows, setMostWatchedShows] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [currentSeries, setCurrentSeries] = useState([]);
  const seriesPerPage = 8; // Broj serija po stranici

  const [showsByGenre, setShowsByGenre] = useState(null);
  const [showsByName, setShowsByName] = useState(null);
  const [filteredShows, setFilteredShows] = useState(false); //samo true/false
  const [genreOptions, setGenreOptions] = useState([]);
  const [selectedTvShow, setSelectedTvShow] = useState(null);


  const handleDropdownChange = (selectedOptions) => {
    setSelectedGenres(selectedOptions ? selectedOptions.map((option) => option.value) : []);
  };

  useEffect(() => {
    if (mostWatchedShows == null) {
      findMostWatchedShows();
    }
    if (mostWatchedShows && currentSeries == null) {
      setCurrentSeries(mostWatchedShows);
    }
  }, [currentSeries, mostWatchedShows]);

  useEffect(() => {
    getAllGenres();
  }, []);

  useEffect(() => {
    const filteredShows = (showsByName && showsByGenre)
      ? showsByName.filter(showByName =>
        showsByGenre.some(showByGenre => showByName.title === showByGenre.title)
      )
      : showsByName || showsByGenre; // Ako je samo jedno prisutno, koristi ga
    if (filteredShows) {
      const indexOfLastSeries = currentPage * seriesPerPage;
      const indexOfFirstSeries = indexOfLastSeries - seriesPerPage;
      setCurrentSeries(filteredShows.slice(indexOfFirstSeries, indexOfLastSeries));
      setFilteredShows(true);
    }
    else {
      setCurrentSeries(mostWatchedShows);
      setFilteredShows(false);
    }
  }, [showsByGenre, showsByName, currentPage]);

  const handleTvShowClick = (show) => {
    setSelectedTvShow(show);
  };

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      if (search.trim() === "") {
        setShowsByName(null);
        return;
      }
      searchTvShowsByName(search);
    }
  };

  const searchTvShowsByGenre = async (genres) => {
    try {
      const result = await axios.get(`${APIUrl}Show/SearchShowsByGenre`, {
        params: { genres },
        paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' }),
      });
      setShowsByGenre(result.data);
    } catch (error) {
      console.error(error);
    }
  };

  const findMostWatchedShows = async () => {
    try {
      const result = await axios.get(`${APIUrl}Show/GetMostWatchedShows`);
      setMostWatchedShows(result.data);
    } catch (error) {
      console.error(error);
      setMostWatchedShows([]);
    }
  };

  const searchTvShowsByName = async (query) => {
    try {
      const result = await axios.get(`${APIUrl}Show/SearchShowByTitle/${query}`);
      setShowsByName(result.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getAllGenres = async () => {
    try {
      const result = await axios.get(`${APIUrl}Genre/GetAllGenres/`);
      setGenreOptions(result.data.map((genre) => ({ value: genre.name, label: genre.name })));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedGenres != null && selectedGenres.length > 0) {
      searchTvShowsByGenre(selectedGenres);
    }
    else
      setShowsByGenre(null);
  }, [selectedGenres])

  return (
    <div className="bg-gradient-to-tl from-violet-800 to-purple-900 rounded-2xl min-h-full"> {/*br-sky-50 */}
      <div className='grid grid-cols-8 h-fit auto-rows-auto'>
        <div className="shadow-sm grid w-full col-span-8 border-violet-800 border-4  rounded-2xl mb-1 ">
          <Input
            placeholder='Search'
            value={search}
            className="rounded-xl pl-4 text-white"
            onChange={(e) => { setSearch(e.target.value) }}
            onKeyDown={handleKeyDown}
          />
          {/*{(currentSeries && filteredShows==false) && ((currentSeries ? (currentSeries.length == 0 ? true : false) : false) || notFound) && <p className='p-2 text-gray-500 text-sm bg-transparent'>No Series found that match the criteria.</p>}*/}
        </div>
        <div className='col-span-8 mb-2'>
          {genreOptions && genreOptions.length > 0 ? (
            <Select
              id="genreDropdown"
              options={genreOptions}
              isMulti
              value={genreOptions.filter((option) => selectedGenres.includes(option.value))}
              onChange={handleDropdownChange}
              placeholder="Choose genres..."
              className="border-violet-800 border-4 rounded-2xl"
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  borderRadius: "0.5rem",
                  border: "#5b21b6",
                  backgroundColor: "#111827",
                  width: "100%"
                }),
                option: (provided, state) => ({
                  ...provided,
                  "&:hover": {
                    backgroundColor: "#5b21b6",
                  },
                }),
                multiValue: (provided) => ({
                  ...provided,
                  backgroundColor: "#5b21b6", // Pozadina taga
                }),
                multiValueLabel: (provided) => ({
                  ...provided,
                  color: "white", // Tekst taga
                }),
              }}
            />) : (
            <p className="text-gray-400 text-sm">Loading genres...</p>
          )}
        </div>
      </div>
      <div className='  mx-4 grid gap-6 grid-cols-12 h-fit auto-rows-auto mb-2'>
        {currentSeries && currentSeries.map((tvShow, index) => (
          <div
            key={tvShow.id + "_" + index}
            className="relative grid col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 place-items-center cursor-pointer drop-shadow-[0_5px_5px_rgba(0,0,0,0.55)] transition ease-in-out delay-150"
            onClick={() => handleTvShowClick(tvShow)}
          >
            <img
              src={`http://localhost:5227${tvShow.imageUrl}`}
              className="w-full h-full object-cover rounded-lg transition duration-300 ease-in-out"
            />
            <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
              <div className="text-center text-white font-semibold">
                <div className="text-lg">{tvShow.title}</div>
                <div className="text-sm">{tvShow.year}</div>
              </div>
            </div>
          </div>
        ))}
        {selectedTvShow && (
          <ShowInfo
            show={selectedTvShow}
            handleExitClick={() => setSelectedTvShow(null)}
          />
        )}
      </div>
      <div className="flex justify-center items-center mt-3 mb-1 space-x-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="w-6 h-6 color-button flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition duration-200 disabled:opacity-50"
        >
          <span className="text-white">&larr;</span> {/* Strelica levo */}
        </button>
        <span className="text-black-700 text-lg">
          {currentPage} / {currentSeries ? (Math.ceil(currentSeries.length / seriesPerPage)) : 1}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, currentSeries ? Math.ceil(currentSeries.length / seriesPerPage) : 1))
          }
          disabled={currentPage === Math.ceil(currentSeries ? currentSeries.length : 1 / seriesPerPage)}
          className="w-6 h-6 color-button flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition duration-200 disabled:opacity-50"
        >
          <span className="text-white">&rarr;</span> {/* Strelica desno */}
        </button>
      </div>

    </div>
  );
}