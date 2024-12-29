import React, { useState, useContext } from 'react'
import AuthorizationContext from '../context/AuthorizationContext'
import { Page } from '../components/BasicComponents'
import Tabs from "../components/Tabs";
import '../assets/colors.css'
import '../assets/animations.css'
import DrawRecommendationsPage from './RecommendationsPage'
import profilePhoto from "../images/profilepicture.jpg";

export default function DrawMainPage() {
  const { APIUrl, contextUser } = useContext(AuthorizationContext)
  const [overlayActive, setOverlayActive] = useState(false); // Potrebno za prevenciju background-tabovanja kada je forma aktivna

  return (
    <Page overlayActive={overlayActive} loading={true} overlayHandler={setOverlayActive}>
      <div className=' grid gap-4 grid-cols-4  h-fit auto-rows-auto '>
        <div className=' col-span-3 grid grid-cols-2 w-full mb-2 '>
          <Tabs preventTab={overlayActive} DrawTab1={() => <DrawRecommendationsPage />}>

          </Tabs>
        </div>
        <div className=' col-span 1 col-start 3'>
          <div className="bg-gradient-to-tl from-violet-800 to-purple-900 rounded-tr-xl rounded-br-xl justify-center p-1">
            <div className="w-full h-full bg-[#5700a2] p-4 flex flex-col items-center rounded-tr-xl rounded-br-xl">
              <div className="w-32 h-32 overflow-hidden rounded-full border-2 border-white">
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" /> {/*podaci se izvlače iz contextUser-a*/}
              </div>
              <h2 className="mt-4 text-white text-lg font-semibold">Korisničko ime</h2>
              <div class="flex justify-center space-x-8 p-4">
                <div class="text-center">
                  <p class="text-2xl font-bold text-zinc-50">42</p>
                  <p class="text-sm text-zinc-100/25">Series Watched</p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-bold text-zinc-50">2</p>
                  <p class="text-sm text-zinc-100/25">Currently Watching</p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-bold text-zinc-50">3</p>
                  <p class="text-sm text-zinc-100/25">Followers</p>
                </div>
              </div>
              {/* Linkovi */}
              <nav className="mt-4 space-y-2 text-center">
                <a href="/currently-watching" className="block text-white text-sm hover:underline">
                  - Currently Watching -
                </a>
                <a href="/watched" className="block text-white text-sm hover:underline">
                  - Watched -
                </a>
                <a href="/to-watch" className="block text-white text-sm hover:underline">
                  - Want To Watch -
                </a>
              </nav>
            </div>
          </div>


        </div>
      </div>

    </Page>
  );
}