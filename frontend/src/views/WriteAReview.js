import React, { useEffect, useRef, useState, useContext } from 'react';
import Rating from '@mui/material/Rating';
import { TextField } from '@mui/material';
import { Exit, FormButton } from '../components/BasicComponents';
import AuthorizationContext from '../context/AuthorizationContext'
import axios from 'axios'
import '../assets/colors.css'

export default function WriteAReview({ handleExitClick, tvShowName, addToWatched }) {
  const { APIUrl, contextUser } = useContext(AuthorizationContext);
  const [review, setReview] = useState("");
  const [stars, setStars] = useState(0);
  const reviewContainerRef = useRef(null); //za click van forme

  useEffect(() => { // Za click van forme
    function handleClickOutside(event) {
      if (reviewContainerRef.current && !reviewContainerRef.current.contains(event.target)) {
        handleExitClick();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  const handleSubmitButtonOnClick = async (e) => {
    e.preventDefault();
    try {
      await addToWatched();
      await leaveAReview();
      handleExitClick();
    } catch (err) {
      console.error("Greška prilikom dodavanja serije ili recenzije:", err);
      alert("An error occurred. Please try again.");
    }
  };

  const handleSkipButtonOnClick = async (e) => {
    e.preventDefault();
    addToWatched();
    handleExitClick();
  };

  const leaveAReview = async () => {
    const reviewData = {
      username: contextUser.username,
      title: tvShowName,
      rating: stars,
      comment: review != "" ? review : null
    };
    await axios.put(APIUrl + "User/AddReview", reviewData, {
      headers: {
        Authorization: `Bearer ${contextUser.jwtToken}`,
      }
    }).then(response => {
      handleExitClick();
    }).catch(err => console.error(err));
  };

  return (
    <div className="overlay show h-screen w-screen left-0 right-0">
      <div className="flex items-center justify-center h-screen">
        <div ref={reviewContainerRef} className='w-full h-fit max-w-sm p-6 bg-[white] border-[#7832b4] border-y-4 rounded-md shadow-2xl hover:shadow-blue-500/40 fade-in'>
          <Exit
            blue
            className="ml-auto text-sm w-4"
            onClick={handleExitClick}
          />
          <form className="mt-4 p-2 grid grid-cols-4 gap-1">
            <div className="col-span-4">
              <TextField
                id="outlined-multiline-static"
                label="Your Review"
                multiline
                rows={4}
                value={review}
                onChange={(event) => { setReview(event.target.value); }}
                fullWidth
                color="#5700a2"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& .MuiOutlinedInput-notchedOutline": {
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#5700a2",
                        borderWidth: "2px",
                      },
                    },
                    "& .MuiInputLabel-outlined": {
                      color: "#2e2e2e",
                      fontWeight: "bold",
                      "&.Mui-focused": {
                        color: "#5700a2",
                        fontWeight: "bold",
                      },
                    },
                  },
                }}
              />
            </div>
            <div className="col-span-4 mt-6 flex justify-center">
              <Rating
                name="simple-controlled"
                value={stars}
                onChange={(event, newValue) => {
                  setStars(newValue);
                }}
              />
            </div>
            <div className="col-span-4 grid grid-cols-2 gap-2">
              <FormButton
                text="Submit"
                onClick={handleSubmitButtonOnClick}
                className="w-fit"
                disabled={stars === 0 | stars == null}
              />
              <FormButton
                text="Skip this step"
                onClick={handleSkipButtonOnClick}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}