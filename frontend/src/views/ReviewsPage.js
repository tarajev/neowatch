import React, { useState, useEffect, useContext } from 'react';
import Rating from '@mui/material/Rating';
import AuthorizationContext from '../context/AuthorizationContext';
import axios from 'axios';
import profileImage from '../resources/img/userNoProfile.jpg';
import { useParams } from 'react-router-dom';
import iconDropdown from "../resources/img/icon-dropdown.png"

export default function ReviewPage() {
    const { APIUrl, contextUser } = useContext(AuthorizationContext);
    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(1);
    const pageSize = 20;
    const [moreAvailable, setMoreAvailable] = useState();

    const { showTitle } = useParams();

    useEffect(() => {
        const getReviews = async () => {
            try {
                const res = await axios.get(`${APIUrl}Show/GetTVShowReviews/${showTitle}/${page}/${pageSize}`, {
                    headers: { Authorization: `Bearer ${contextUser.jwtToken}` }
                });
                let data = res.data;
                console.log(data);

                if (data.length > pageSize) {
                    data = data.slice(0, pageSize);
                    setMoreAvailable(true);
                } else {
                    setMoreAvailable(false);
                }

                setReviews((prev) => [...prev, ...data].filter( //za prod ovo nece biti potrebno medjutim kad je ukljucen StrictMode u index.js, poziva useEffect dva puta pa se dupliraju
                    (review, index, self) =>
                        index === self.findIndex(r => r.username === review.username)
                ));
            } catch (err) {
                console.log(err);
            }
        };
        getReviews();
    }, [page]);

    if (!reviews) return <div className="text-center mt-20 text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-3xl text-center font-bold mb-6">{showTitle}</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {reviews.length === 0 && <p className="col-span-full text-center">No reviews yet.</p>}

                {reviews.map((review, index) => {
                    const formattedDate = review.timestamp
                        ? new Date(review.timestamp).toLocaleDateString('en-GB')
                        : 'N/A';

                    return (
                        <div
                            key={index}
                            className="relative bg-[#5700a2] border-[#1e1b4b] rounded-lg p-4 transition-shadow duration-300"
                            style={{ boxShadow: '0 4px 15px rgba(87,0,162,0.5)' }}
                        >
                            <span className="absolute top-2 right-2 bg-[#1e1b4b] text-white text-xs px-2 py-0.5 rounded-full shadow-sm">
                                {formattedDate}
                            </span>

                            <div className="flex items-center mb-2">
                                <div className="overflow-hidden rounded-full w-12 h-12 bg-gray-700 border border-gray-600 flex-shrink-0">
                                    <img
                                        src={review.picture ? `http://localhost:5054${review.picture}` : profileImage}
                                        alt={review.username}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="ml-3 flex flex-col">
                                    <p className="font-bold text-sm">{review.username}</p>
                                    <Rating name="rating-read" value={review.rating} precision={0.5} size="small" readOnly />
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed mt-2">{review.comment}</p>
                        </div>
                    );
                })}
            </div>
            <div>
                {moreAvailable && <button
                    onClick={() => {
                        setPage((prev) => prev + 1);
                    }}
                    className="mt-10 p-2 place-self-center bg-[#5700a1] shadow-md text-white rounded-full flex items-center gap-2 hover:bg-[#5700a1] bg-opacity-70"
                >
                    <img src={iconDropdown} alt="Load More" className="w-4 h-4" />
                </button>}
            </div>
        </div>
    );
}
