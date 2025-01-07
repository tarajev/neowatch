import React from "react";
import { Button, Exit } from "../components/BasicComponents";
import { Rating } from '@mui/material';

export default function ShowInfo({ show, handleExitClick }) {

    const handleAddReview = (show) => {
    };
    const handleAddToWatched = (show) => {
    };
    const handleAddToWatching = (show) => {
    };
    const handleAddToWatchlist = (show) => {
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ">
            <div className="bg-[#5700a2] rounded-lg shadow-lg p-6 max-w-lg w-fit h-auto relative grid"> {/* mozda gradient background? */}
                <Exit
                    blue
                    className="absolute top-3 right-3 text-sm w-4 cursor-pointer"
                    onClick={handleExitClick}
                />
                <div className="grid gap-5 grid-cols-8 grid-rows-[auto,auto] h-fit">
                    <img
                        src={show.image}
                        alt={show.title}
                        className="w-48 h-88 object-cover rounded-lg col-span-3"
                    />
                    <div className="col-span-3 col-start-1 row-start-2 h-fit p-0">
                    <Button className='drop-shadow-md rounded-md px-2 py-1 w-full mb-2' onClick={handleAddReview}>Review</Button>
                    <Button className='drop-shadow-md rounded-md px-2 py-1 w-full mb-2' onClick={handleAddToWatchlist}>Add To Watchlist</Button>
                    <Button className='drop-shadow-md rounded-md px-2 py-1 w-full mb-2' onClick={handleAddToWatching}>Add to Watching</Button>
                    <Button className='drop-shadow-md rounded-md px-2 py-1 w-full' onClick={handleAddToWatched}>Add to Watched</Button>
                    </div>
                    <div className="col-span-5 col-start-4 row-start-1">
                        <h2 className="text-white text-3xl font-mono font-semibold col-span-5 text-wrap">{show.title}</h2>
                        <div className="flex items-center gap-x-1 mb-2">
                            <span className="text-white opacity-60">
                                {show.year} | {show.numberOfSeasons} {show.numberOfSeasons > 0 ? "Seasons" : "Season"} |
                            </span>
                            <Rating name="half-rating-read" defaultValue={4.5} precision={0.5} size="small" readOnly />
                        </div>
                        <div className="flex items-center gap-x-6 mb-5">
                            {show.genres.map((genre) => (
                                <span className="text-white opacity-80">{genre}</span>
                            ))}
                        </div>
                        <div className="w-fit ">
                        <p className="text-white opacity-60 break-normal">{show.desc}</p></div>
                        <div className="flex flex-wrap gap-x-2 mt-4 h-4 ">
                            <span className="text-white opacity-80 font-semibold mr-1">Cast:</span> {/*nešto da se uradi povodom toga da ne ispisuje sve glumce već samo par */}
                            {show.cast.map((a, index) => (
                                <span key={index} className="text-white opacity-80 inline truncate max-w-xs">{a} {index < show.cast.length - 1 && ", "}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
