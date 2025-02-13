import React, { useState, useEffect, useRef, useContext } from "react";
import { Exit, Input } from '../components/BasicComponents.js';
import AuthorizationContext from "../context/AuthorizationContext.js";
import axios from "axios";

import iconUser from '../resources/img/icon-user.png'
import { CircularProgress } from "@mui/material";
import { useDebounce } from "use-debounce";
import { useNavigate } from "react-router-dom";

export default function DrawSearchUsers({ handleExitClick }) {
  const { APIUrl, contextUser } = useContext(AuthorizationContext);
  const formRef = useRef(null); // Za click van forme

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 600);
  const [users, setUsers] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const openProfile = (username) => {
    navigate(`../profile/${username}/watching`);
    window.location.reload();
  }

  useEffect(() => {
    if (debouncedSearch.length < 3) return;

    setIsLoading(true);
    var route = `User/FindUsers/${debouncedSearch}/User`;

    axios.get(APIUrl + route, {
      headers: {
        Authorization: `Bearer ${contextUser.jwtToken}`,
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error("Error fetching users:", error);
        setUsers([]);
      })
      .finally(() => {
        setIsLoading(false);
      });

  }, [debouncedSearch]);

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
    <div className="left-0 overlay show">
      <div className="flex items-center hidescrollbar overscroll-contain sm:justify-center h-screen overflow-y-auto">
        <div ref={formRef} className='w-full max-w-2xl p-6 bg-gray-900 border-y-4 border-violet-900 rounded-lg shadow-2xl shadow-indigo-500/40 fade-in fade-in h-96'>
          <Exit
            blue
            className="ml-auto text-sm w-4"
            onClick={() => handleExitClick()}
          />
          <h1 className="mb-2 flex justify-center text-2xl text-white">Search for users</h1>

          <hr className="mt-2 mb-5 border border-primary" />

          <Input
            placeholder='Search for users via username...'
            value={search}
            className="rounded-xl pl-4 !bg-gray-700 mb-10"
            onChange={(e) => { setSearch(e.target.value) }}
          />

          {isLoading ? (
            <div className="flex items-center -mt-8 mb-2.5">
              <CircularProgress size={20} className='mr-2' sx={{ 'color': 'white' }} />
              <p className="text-gray-400">Loading...</p>
            </div>) : null}

          <div className="h-44 overflow-auto border border-indigo-900 rounded-md">
            {users && users.length > 0 ? (
              users.map((user, index) => (
                <div key={index} className="p-1 border-b border-gray-700 text-white">
                  <UserSlot user={user} func={openProfile} />
                </div>
              ))) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserSlot({ user, func }) {
  return (
    <a
      href="#"
      onClick={() => func(user.username)}
    >
      <div className='flex items-center border border-violet-900 hover:shadow-md hover:shadow-violet-500/50 hover:bg-violet-900 transition-all rounded-xl'>
        <img src={user.picture != null ? `http://localhost:5227${user.picture}` : iconUser} className={`w-10 h-10 p-1 border border-white rounded-full ${user.picture == null && "filter-white"}`} />
        <p className='justify-self-center p-1 text-center'>{user.username}</p>
      </div>
    </a>
  );
}