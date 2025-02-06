import React, { useState, useEffect, useRef, useContext } from "react";
import { Button, FileUpload, Password } from '../components/BasicComponents.js'
import EditableInput from "../components/EditableInput.js";
import AuthorizationContext from "../context/AuthorizationContext.js";
import axios from "axios";

import iconUser from '../resources/img/icon-user.png'
import { CircularProgress } from "@mui/material";

export default function DrawEditProfile({ handleExitClick, user }) {
  const { APIUrl, contextUser } = useContext(AuthorizationContext);
  const formRef = useRef(null); // Za click van forme
  const [infoEdited, setInfoEdited] = useState(false);

  const [bio, setBio] = useState(user.bio);
  const [picture, setPicture] = useState(user.picture);
  const [changedPicture, setChangedPicture] = useState("");
  const [oldPassword, setPassword] = useState("");
  const [newPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [passwordWrong, setPasswordWrong] = useState(false);

  const applyEditInfo = async () => {
    if (user.bio != bio) user.bio = bio;

    if (oldPassword != "") {
      if (user.password === oldPassword) 
        user.password = newPassword;
      else
        setPasswordWrong(true);
    }

    setIsLoading(true);
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

    if (typeof changedPicture !== 'string' || (typeof changedPicture === 'string' && user.picture.trim() !== changedPicture.trim())) {
      if (changedPicture != "") {
        const formData = new FormData();
        formData.append('file', changedPicture);
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

    setIsLoading(false);
    window.location.reload(); // Refresh stranice
  }

  const exitForm = () => {
    setBio(user.bio)
    setChangedPicture(null)
    setInfoEdited(false)
    handleExitClick();
  }

  useEffect(() => {
    if (bio != user.bio || (changedPicture != "" && changedPicture != user.picture) || (newPassword != "" && newPassword.length > 5))
      setInfoEdited(true);
    else
      setInfoEdited(false);
  }, [bio, changedPicture, newPassword])

  useEffect(() => {
    setPasswordWrong(false);
  }, [oldPassword])

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
            <EditableInput initialValue={bio} setValue={setBio} label="Description:" />
          </div>
          <div className="border border-violet-900 rounded-xl p-4 -m-1 my-2">
            <p className="text-white font-semibold justify-self-center">Profile photo:</p>
            <div className="p-2 border border-white w-fit rounded-xl mt-5 justify-self-center">
              <img
                src={changedPicture == "" ? (picture == null ? iconUser : `http://localhost:5227${picture}`) : URL.createObjectURL(changedPicture)}
                className={`${picture == null ? "filter-white" : ""} w-44`}
              />
            </div>
            <div className="justify-items-center mt-2">
              <FileUpload buttonText="Add photo" setPicture={setChangedPicture} />
            </div>
          </div>
          <div className="grid grid-cols-2 -m-1 my-2">
            <div className="col-span-1 border border-violet-900 rounded-xl p-4 mr-2">
              <Password
                text="Password"
                required
                visibility
                alertCond={passwordWrong}
                alertText={"Old password is incorrect!"}
                value={oldPassword}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="col-span-1 border border-violet-900 rounded-xl p-4 ml-2">
              <Password
                text="Confirm password"
                required
                visibility
                value={newPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-2 text-lg flex justify-end items-center">
            {isLoading && <CircularProgress size={20} className='mr-2' sx={{ 'color': 'white' }} />}
            <Button disabled={!infoEdited} className='mx-1 px-4 py-0.5 rounded-md' onClick={applyEditInfo}>Apply</Button>
            <Button className='mx-1 px-4 py-0.5 rounded-md' onClick={exitForm}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}