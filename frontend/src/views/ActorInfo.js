import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthorizationContext from "../context/AuthorizationContext";
import { Exit } from "../components/BasicComponents";

export default function ActorInfo({ actorName, handleExitClick }) {
    const { APIUrl, contextUser } = useContext(AuthorizationContext);

    const [actor, setActor] = useState(null);
    const [shows, setShows] = useState([]);

    useEffect(() => {
        if (!actorName) return;

        axios.get(`${APIUrl}Actor/GetActorByName/${actorName}`, {
            headers: { Authorization: `Bearer ${contextUser.jwtToken}` }
        })
        .then(res => setActor(res.data))
        .catch(err => console.log("Error fetching actor:", err));

        axios.get(`${APIUrl}Show/SearchShowsByActor/${actorName}`, {
            headers: { Authorization: `Bearer ${contextUser.jwtToken}` }
        })
        .then(res => setShows(res.data))
        .catch(err => console.log("Error fetching shows:", err));

    }, [actorName]);

    if (!actor) return <div>Loading actor info...</div>;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[99999] overflow-auto p-4">
            <div className="bg-[#5700a2] rounded-lg shadow-lg p-6 max-w-xl w-full h-auto relative flex flex-col gap-4 fade-in">
                <Exit
                    blue
                    className="absolute top-3 right-3 text-sm w-4 cursor-pointer"
                    onClick={handleExitClick}
                />

                {/* Basic Info */}
                <div className="flex flex-col items-center gap-2">
                    <p className="text-white font-bold text-lg">{actor.name}</p>
                    {actor.dob && (
                        <p className="text-white opacity-60">Born: {actor.dob}</p>
                    )}
                    <p className="text-white text-center">{actor.bio}</p>
                </div>

                {/* Shows List */}
                <div className="flex flex-col mt-4">
                    <h3 className="text-white  text-center font-semibold mb-2">TV Shows</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto max-h-64 pr-2">
                        {shows.map((show, index) => (
                            <div key={index} className="bg-indigo-950 rounded-lg overflow-hidden">
                                <img
                                    src={`http://localhost:5227${show.imageUrl}`}
                                    alt={show.title}
                                    className="w-full h-32 object-cover"
                                />
                                <p className="text-white text-center p-1">{show.title}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
