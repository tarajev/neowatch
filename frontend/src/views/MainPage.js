import React, { useState, useContext, useEffect } from 'react'
import axios from 'axios';
import AuthorizationContext from '../context/AuthorizationContext'
import { Page, Link } from '../components/BasicComponents'
import Tabs from "../components/Tabs";
import '../assets/colors.css'
import '../assets/animations.css'
import DrawRecommendationsPage from './RecommendationsPage'
import profilePhoto from "../images/profilepicture.jpg";
import DrawSearchTvShows from './Search';

export default function DrawMainPage() {
  const { APIUrl, contextUser } = useContext(AuthorizationContext)
  const [overlayActive, setOverlayActive] = useState(false); // Potrebno za prevenciju background-tabovanja kada je forma aktivna
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    console.log(contextUser.role);
    if (contextUser.role == "User")
      getUserStats(contextUser.username);
  }, []);

  useEffect(() => {
    console.log("Updated userStats:", userStats);
  }, [userStats]);

  const getUserStats = async (username) => {
    var route = `User/GetUserStats/${username}`;
    await axios.get(APIUrl + route, {
      headers: {
        Authorization: `Bearer ${contextUser.jwtToken}`
      }
    })
      .then(result => {
        setUserStats(result.data)
        localStorage.setItem("userStats", JSON.stringify(result.data));
      })
      .catch(error => {
        console.log(error);
      })
  }


  return (
    <>
      <Page overlayActive={overlayActive} loading={true} overlayHandler={setOverlayActive}>
        <div className=' grid gap-4 grid-cols-4  h-fit auto-rows-auto '>
          <div className=' col-span-3 grid grid-cols-2 w-full mb-2 '>
            <Tabs preventTab={overlayActive} DrawTab1={() => <DrawSearchTvShows />} DrawTab2={contextUser.role == "User" ? () => <DrawRecommendationsPage /> : () => (
              <div className="flex items-center justify-center h-full p-8 text-lg font-semibold text-gray-500">
                Login to access all the features
              </div>
            )}>
            </Tabs>
          </div>
          <div className="relative col-span 1 col-start 3 h-fit">
            <div className={`bg-gradient-to-tl from-violet-800 to-purple-900 rounded-tr-xl rounded-br-xl justify-center p-1 ${contextUser.role != "User" ? "blur-[10px]" : ""}`}>
              <div className="w-full h-full bg-[#5700a2] p-4 flex flex-col items-center rounded-tr-xl rounded-br-xl">

                <div className="w-32 h-32 overflow-hidden rounded-full border-2 border-white">
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" /> {/*podaci se izvlače iz contextUser-a*/}
                </div>
                <h2 className="mt-4 text-white text-lg font-semibold">{contextUser.username}</h2>
                <div class="flex justify-center space-x-8 p-4">
                  <div class="text-center">
                    <p class="text-2xl font-bold text-zinc-50">{userStats ? userStats.watchedCount : "0"}</p>
                    <p class="text-sm text-zinc-100/25">Series Watched</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-zinc-50">{userStats ? userStats.watchingCount : "0"}</p>
                    <p class="text-sm text-zinc-100/25">Currently Watching</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-zinc-50">{userStats ? userStats.followersCount : "0"}</p>
                    <p class="text-sm text-zinc-100/25">Followers</p>
                  </div>
                </div>
                {/* Linkovi */}
                <nav className="mt-4 space-y-2 text-center">
                  <Link disabled={contextUser.role == "Guest" ? true : false} route={`/profile/${contextUser.username}/watching`} className="block text-white text-sm hover:underline">
                    - Currently Watching -
                  </Link>
                  <Link disabled={contextUser.role == "Guest" ? true : false} route={`/profile/${contextUser.username}/watched`} className="block text-white text-sm hover:underline">
                    - Watched -
                  </Link>
                  <Link disabled={contextUser.role == "Guest" ? true : false} route={`/profile/${contextUser.username}/towatch`} className="block text-white text-sm hover:underline">
                    - Want To Watch -
                  </Link>
                </nav>
              </div>
            </div>
            {contextUser.role !== "User" && (
              <div className="z-999 absolute inset-0 flex items-center justify-center text-md font-semibold text-gray-100  backdrop-blur-none rounded-lg ">
                Login to access all the features
              </div>
            )}
          </div>
        </div>
      </Page>
    </>
  );
}