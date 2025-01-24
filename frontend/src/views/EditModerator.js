import React, { useState, useEffect, useRef, useContext } from "react";
import { Button } from '../components/BasicComponents.js'
import EditableInput from "../components/EditableInput.js";
import AuthorizationContext from "../context/AuthorizationContext.js";
import axios from "axios";

export default function DrawEditModerator({ handleExitClick, user }) {
  const [username, setUsername] = useState(user.name);
  const [description, setDescription] = useState(user.description);
  const { APIUrl, contextUser } = useContext(AuthorizationContext);
  const [infoEdited, setInfoEdited] = useState(false);
  const formRef = useRef(null); // Za click van forme

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
      <div className="sm:flex sm:items-center hidescrollbar overscroll-contain sm:justify-center h-screen overflow-y-auto">
        <div ref={formRef} className='w-full max-w-2xl p-6 bg-secondary border-y-4 border-primary rounded-lg shadow-2xl shadow-blue-500/40 fade-in fade-in'>
          <h1 className="mb-2 flex justify-center text-2xl">Informacije o korisniku</h1>

          <hr className="mt-2 border border-primary" />
          <EditableInput initialValue={username} setValue={setUsername} label="Korisničko ime:" />
          <EditableInput initialValue={description} setValue={setDescription} label="Opis:" />

          {/* TODO - Za seriju da se doda */}

          <div className="mt-2 text-lg flex justify-end">
            {/* <Button disabled={infoEdited} className='mx-1 px-4 py-0.5 rounded-md' onClick={updateCredentials}>Izmeni</Button>
            <Button className='mx-1 px-4 py-0.5 rounded-md' onClick={handleExitClick}>Poništi</Button> */}
          </div>
        </div>
      </div>
    </div >
  );
}