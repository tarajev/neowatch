import React, { useState, useRef, useEffect, useContext } from "react";
import axios from 'axios'
import { Button, Exit } from "../components/BasicComponents";
import { Rating } from '@mui/material';
import AuthorizationContext from '../context/AuthorizationContext'
import WriteAReview from "./WriteAReview";
import DeleteReviewPopUp from "../components/DeleteReviewPopUp";

export default function ShowInfo({ show, handleExitClick }) {
    const formRef = useRef(null); // Za click van forme
    const { APIUrl, contextUser } = useContext(AuthorizationContext);
    const [addReview, setAddReview] = useState(false);
    const [deleteReviewPopUp, setDeleteReviewPopUp] = useState(false);
    const [pendingFunction, setPendingFunction] = useState(null);

    const handleExitAddReview = () => {
        setAddReview(false);
    };

    const handleExitDeleteReviewPopUp = () => {
        setDeleteReviewPopUp(false);
    }

    const handleDeleteAndMove = async () => {
        await handleDeleteReview();
        await pendingFunction();
    }

    const handleDeleteReview = async () => {
        console.log(contextUser.jwtToken);
        const data = {
            username: contextUser.username,
            tvShowTitle: show.title
        };
        await axios.delete(APIUrl + "User/DeleteReview", {
            headers: {
                Authorization: `Bearer ${contextUser.jwtToken}`,
            },
            params: data
        }).then(response => {
            console.log(response);
        }).catch(err => console.log(err)); //ovde ako dodje do greške da se ispiše nešto
    }

    const handleAddToWatched = (show) => {
        setAddReview(true);
    };

    const handleAddToWatching = async () => {
        const data = {
            username: contextUser.username,
            tvShowTitle: show.title
        };
        await axios.put(APIUrl + "User/AddShowWatching", data, {
            headers: {
                Authorization: `Bearer ${contextUser.jwtToken}`,
            }
        }).then(response => {
            console.log(response);
            handleExitClick();
        }).catch(err => {
            console.log(err);
            setPendingFunction(() => handleAddToWatching);
            setDeleteReviewPopUp(true);
        });
    };

    const handleAddToWatchlist = async () => {
        const data = {
            username: contextUser.username,
            tvShowTitle: show.title
        };
        await axios.put(APIUrl + "User/AddShowToWatch", data, {
            headers: {
                Authorization: `Bearer ${contextUser.jwtToken}`,
            }
        }).then(response => {
            console.log(response);
            handleExitClick();
        }).catch(err => {
            console.log(err);
            setPendingFunction(() => handleAddToWatchlist);
            setDeleteReviewPopUp(true);
        }); //ovde ako dodje do greške da se ispiše nešto?
    };

    /* useEffect(() => { // Za click van forme
         function handleClickOutside(event) {
             if (formRef.current && !formRef.current.contains(event.target))
                 handleExitClick();
         }
 
         document.addEventListener('mousedown', handleClickOutside);
         return () => {
             document.removeEventListener('mousedown', handleClickOutside);
         };
     }, []);*/

    return (
        <> {addReview && <WriteAReview handleExitClick={handleExitAddReview} tvShowName={show.title}></WriteAReview>}
            {deleteReviewPopUp && <DeleteReviewPopUp onCancel={handleExitDeleteReviewPopUp} onDelete={handleDeleteAndMove} ></DeleteReviewPopUp>}
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-[#5700a2] rounded-lg shadow-lg p-6 max-w-lg w-fit h-auto relative grid fade-in"> {/* mozda gradient background? */}
                    <Exit
                        blue
                        className="absolute top-3 right-3 text-sm w-4 cursor-pointer"
                        onClick={handleExitClick}
                    />
                    <div className="grid gap-5 grid-cols-8 grid-rows-[auto,auto] h-fit">
                        <div className="flex flex-col col-span-3">
                            <img
                                src={`../images/${show.imageUrl}`}
                                alt={show.title}
                                className="w-48 h-88 object-cover rounded-lg col-span-3 mb-2"
                            />
                            <div className="col-span-3 col-start-1 h-fit p-0">
                                {/*<Button className='drop-shadow-md rounded-md px-2 py-1 w-full mb-2' onClick={handleAddReview}>Review</Button>*/} {/*Ovo će ići kroz watched za sada*/}
                                <Button className='drop-shadow-md rounded-md px-2 py-1 w-full mb-2' onClick={handleAddToWatchlist}>Add To Watchlist</Button>
                                <Button className='drop-shadow-md rounded-md px-2 py-1 w-full mb-2' onClick={handleAddToWatching}>Add to Watching</Button>
                                <Button className='drop-shadow-md rounded-md px-2 py-1 w-full' onClick={handleAddToWatched}>Add to Watched</Button>
                            </div>
                        </div>
                        <div className="col-span-5 col-start-4 row-start-1">
                            <h2 className="text-white text-3xl font-mono font-semibold col-span-5 text-wrap">{show.title}</h2>
                            <div className="flex items-center gap-x-1 mb-2">
                                <span className="text-white opacity-60">
                                    {show.year} | {show.numberOfSeasons} {show.numberOfSeasons > 0 ? "Seasons" : "Season"} |
                                </span>
                                <Rating name="half-rating-read" defaultValue={4} precision={0.5} size="small" readOnly /> {/*ispraviti na rating serije ili ako ne postoji da to pise?*/}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-6 mb-5">
                                {show.genres.map((genre) => (
                                    <span className="text-white opacity-80">{genre.name}</span>
                                ))}
                            </div>
                            <div className="w-fit ">
                                <p className="text-white opacity-60 break-normal">{show.desc}</p></div>
                            <div className="flex flex-wrap gap-x-2 mt-4 h-4">
                                <span className="text-white opacity-80 font-semibold mr-1">Cast:</span>
                                {show.cast.map((a, index) => (
                                    <span key={index} className="group text-white opacity-80 inline-block max-w-xs cursor-pointer relative">
                                        {a.actor.name}{index < show.cast.length - 1 && ", "}
                                        <div className="absolute inline-block inset-x-0 bottom-full mb-1 w-max fade-in !bg-gray-900 !bg-opacity-100 !shadow-sm text-white text-xs p-2 rounded group-hover:block hidden duration-300 z-[555]" >
                                            {a.role}
                                            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-[-5px] w-0 h-0 border-l-8 border-r-8 border-t-8 border-t-gray-900 border-transparent"></span>
                                        </div>
                                    </span>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            </div >
        </>
    );
}
