import React, { useState, useEffect, useRef, useContext } from "react";
import { Button, FileUpload, FormInput, Password } from '../components/BasicComponents.js'
import EditableInput from "../components/EditableInput.js";
import AuthorizationContext from "../context/AuthorizationContext.js";
import axios from "axios";

import iconUser from '../resources/img/icon-user.png'

export default function DrawEditProfile({ handleExitClick, user }) {
  const { APIUrl, contextUser } = useContext(AuthorizationContext);
  const formRef = useRef(null); // Za click van forme
  const [infoEdited, setInfoEdited] = useState(false);

  const [description, setDescription] = useState(user.bio);
  const [picture, setPicture] = useState(user.picture);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const setProfilePicture = (picture) => {
    setPicture(URL.createObjectURL(picture)) // Da bi slika mogla da se prikaze korisniku
  }

  const applyEditInfo = async () => {
    if (user.bio != description) user.bio = description;
    if (user.password != password) user.password = password;

    var route = `User/UpdateUser`;
    await axios.put(APIUrl + route, user, {
      headers: {
        Authorization: `Bearer ${contextUser.jwtToken}`,
        "Content-Type": "application/json"
      }
    })
      .then(result => {
        console.log(result.data)
      })
      .catch(error => {
        console.log(error);
      })

    if (typeof picture !== 'string' || (typeof picture === 'string' && user.picture.trim() !== picture.trim())) {
      const formData = new FormData();
      formData.append('file', picture);
      route = `User/UploadProfilePicture/${contextUser.username}`;

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
  }

  const exitForm = () => {
    setDescription(user.bio)
    setPicture(user.picture)
    setInfoEdited(false)
    handleExitClick();
  }

  useEffect(() => {
    if (description != user.bio || picture != user.picture || (password != "" && password.length > 5 && password === confirmPassword))
      setInfoEdited(true);
    else
      setInfoEdited(false);
  }, [description, picture, password, confirmPassword])

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
        <div ref={formRef} className='w-full max-w-2xl p-6 bg-gray-900 border-y-4 border-violet-900 rounded-lg shadow-2xl shadow-indigo-500/40 fade-in fade-in'>
          <h1 className="mb-2 flex justify-center text-2xl text-white">Edit profile information</h1>

          <hr className="mt-2 mb-5 border border-primary" />

          <div className="border border-violet-900 rounded-xl p-4 -m-1 my-2">
            <EditableInput initialValue={description} setValue={setDescription} label="Description:" />
          </div>
          <div className="border border-violet-900 rounded-xl p-4 -m-1 my-2">
            <p className="text-white font-semibold justify-self-center">Profile photo:</p>
            <div className="p-2 border border-white w-fit rounded-xl mt-5 justify-self-center">
              <img src={picture == null ? iconUser : picture} className={`${picture == null ? "filter-white" : ""} w-44`} />
            </div>
            <div className="justify-items-center mt-2">
              <FileUpload buttonText="Add photo" setPicture={setProfilePicture} />
            </div>
          </div>
          <div className="grid grid-cols-2 -m-1 my-2">
            <div className="col-span-1 border border-violet-900 rounded-xl p-4 mr-2">
              <Password
                text="Password"
                required
                visibility
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="col-span-1 border border-violet-900 rounded-xl p-4 ml-2">
              <Password
                text="Confirm password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-2 text-lg flex justify-end">
            <Button disabled={!infoEdited} className='mx-1 px-4 py-0.5 rounded-md' onClick={applyEditInfo}>Apply</Button>
            <Button className='mx-1 px-4 py-0.5 rounded-md' onClick={exitForm}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}