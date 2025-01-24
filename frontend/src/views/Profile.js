import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { Page, Link } from '../components/BasicComponents'
import AuthorizationContext from '../context/AuthorizationContext'
import axios from 'axios'
import profilePhoto from "../images/profilepicture.jpg";
import ColorLine from "../components/ColorLine"
import CollapsiblePanel from '../components/CollapsiblePanel';
import ShowInfo from './ShowInfo';

import breakingBadImage from "../images/breakingbad.jpg";
import strangerThingsImage from "../images/strangerthings.jpg";
import theCrownImage from "../images/thecrown.jpg";
import theWitcherImage from "../images/thewitcher.jpg";
import friendsImage from "../images/friends.jpg";

export default function DrawProfile() {
  const { APIUrl, contextUser } = useContext(AuthorizationContext);
  const [userStats, setUserStats] = useState(null);
  const [overlayActive, setOverlayActive] = useState(false); // Potrebno za prevenciju background-tabovanja kada je forma aktivna
  const [showShowStats, setShowShowStats] = useState(false);

  const shows = [ //privremeno naravno
    { id: 1, title: "Breaking Bad", image: breakingBadImage, numberOfSeasons: 5, rating: 9.5, cast: [{ actor: { name: "Bryan Cranston" } }, { actor: { name: "Aaron Paul" } }, { actor: { name: "Anna Gunn" } }], genres: ["Crime", "Drama", "Thriller"], desc: "A high school chemistry teacher turned methamphetamine producer partners with a former student to build a drug empire.", year: 2008 },
    { id: 2, title: "Stranger Things", image: strangerThingsImage, numberOfSeasons: 4, rating: 8.7, cast: [{ actor: { name: "Winona Ryder" } }, { actor: { name: "David Harbour" } }, { actor: { name: "Finn Wolfhard" } }], genres: ["Drama", "Fantasy", "Horror"], desc: "A group of kids in a small town uncover supernatural events while searching for their missing friend.", year: 2016 },
    { id: 3, title: "The Crown", image: theCrownImage, numberOfSeasons: 6, rating: 8.6, cast: [{ actor: { name: "Claire Foy" } }, { actor: { name: "Olivia Colman" } }, { actor: { name: "Matt Smith" } }], genres: ["Biography", "Drama", "History"], desc: "The story of Queen Elizabeth II's reign, from her early years on the throne to present day.", year: 2016 },
    { id: 4, title: "The Witcher", image: theWitcherImage, numberOfSeasons: 3, rating: 8.1, cast: [{ actor: { name: "Henry Cavill" } }, { actor: { name: "Anya Chalotra" } }, { actor: { name: "Freya Allan" } }], genres: ["Action", "Adventure", "Drama"], desc: "A mutated monster hunter, Geralt of Rivia, struggles to find his place in a world where people often prove more wicked than beasts.", year: 2019 },
    { id: 5, title: "Friends", image: friendsImage, numberOfSeasons: 10, rating: 8.8, cast: [{ actor: { name: "Jennifer Aniston" } }, { actor: { name: "Courteney Cox" } }, { actor: { name: "Lisa Kudrow" } }], genres: ["Comedy", "Romance"], desc: "Six friends navigate life and love in New York City, sharing laughter, heartbreak, and a lot of coffee.", year: 1994 }
  ];

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
      })
      .catch(error => {
        console.log(error);
      })
  }

  return (
    <Page loading={true} overlayActive={overlayActive} overlayHandler={setOverlayActive}>
      {showShowStats && <ShowInfo show={shows[1]} handleExitClick={() => setShowShowStats(false)} />}

      {/* TOP SECTION */}
      <div className='grid grid-cols-12 gap-4 h-44 mb-4'>
        <div className='col-span-2 bg-indigo-950 border border-violet-900 rounded-xl content-center '>
          <img className='max-w-36 max-h-36 justify-self-center border border-violet-900 rounded-l' src={profilePhoto} />
          <p className='text-gray-400 font-bold text-center p-3 -mb-3'>Username placeholder</p>
        </div>
        <div className='col-span-10'>
          <div className='grid grid-cols-3 gap-4 text-gray-400 text-center'>
            <div className='col-span-3 font-bold text-4xl text-white'>
              Show Statistics
            </div>
            <div className='bg-indigo-950 border border-violet-900 rounded-xl'>
              <p className='section-title !text-6xl'>12</p>
              <div className='flex bg-indigo-950 border-t mx-4 py-1 border-violet-900 justify-center items-center'>
                <span className='bg-green-700 w-3 h-3 rounded-full mr-1' />
                <span>Watching</span>
              </div>
            </div>
            <div className='bg-indigo-950 border border-violet-900 rounded-xl'>
              <p className='section-title !text-6xl'>35</p>
              <div className='flex bg-indigo-950 border-t mx-4 py-1 border-violet-900 justify-center items-center'>
                <span className='bg-blue-700 w-3 h-3 rounded-full mr-1' />
                <span>Completed</span>
              </div>
            </div>
            <div className='bg-indigo-950 border border-violet-900 rounded-xl'>
              <p className='section-title !text-6xl'>56</p>
              <div className='flex bg-indigo-950 border-t mx-4 py-1 border-violet-900 justify-center items-center'>
                <span className='bg-gray-700 w-3 h-3 rounded-full mr-1' />
                <span>Plan to Watch</span>
              </div>
            </div>
            <div className='col-span-3 align-bottom'>
              <ColorLine values={[12, 35, 56]} />
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-11 text-gray-400 mt-6'>
        <div className='col-span-8 bg-indigo-950 border border-violet-900 rounded-xl mr-3 px-3 py-1'>
          <p>Neki opis ovog korisnika koji je on sam stavio. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
        </div>
        <div className='col-span-3 bg-indigo-950 border border-violet-900 rounded-xl ml-1 px-3 py-1 h-fit'>
          <p className='section-title !text-2xl justify-self-center'>102 followers</p>
          <div className='justify-self-center'>
            <Link>Follow this user</Link>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className='pt-5'>
        <CollapsiblePanel title="Currently Watching:" open={true}>
          <div className='grid grid-cols-6 gap-4 p-2'>
            <SeriesSlot title='Breaking Bad' image={breakingBadImage} func={() => setShowShowStats(true)} />
            <SeriesSlot title='Breaking Bad' image={breakingBadImage} />
            <SeriesSlot title='Breaking Bad' image={breakingBadImage} />
            <SeriesSlot title='Breaking Bad' image={breakingBadImage} />
            <SeriesSlot title='Breaking Bad' image={breakingBadImage} />
            <SeriesSlot title='Breaking Bad' image={breakingBadImage} />
          </div>
        </CollapsiblePanel>
        <CollapsiblePanel title="Watched Shows:">
          <div className='grid grid-cols-6 gap-4 p-2'>
            <SeriesSlot title='Breaking Bad' image={breakingBadImage} />
          </div>
        </CollapsiblePanel>
        <CollapsiblePanel title="Plans to Watch:">
          <div className='grid grid-cols-6 gap-4 p-2'>
            <SeriesSlot title='Breaking Bad' image={breakingBadImage} />
            <SeriesSlot title='Breaking Bad' image={breakingBadImage} />
          </div>
        </CollapsiblePanel>
      </div>
    </Page>
  );
}

function SeriesSlot({ title, image, func, preventTab }) {
  return ( // Mora <a> da bi moglo da se fokusira TAB-om
    <a
      href="#"
      tabIndex={preventTab ? -1 : 0}
      onClick={() => func()}
    >
      <div className='border border-violet-900 rounded-xl'>
        <img src={image} className='h-64 pt-2 px-2 rounded-2xl' />
        <p className='justify-self-center p-1 text-center'>{title}</p>
      </div>
    </a>
  );
}