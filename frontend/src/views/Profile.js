import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { Page, Link } from '../components/BasicComponents'
import AuthorizationContext from '../context/AuthorizationContext'
import axios from 'axios'
import ColorLine from "../components/ColorLine"
import CollapsiblePanel from '../components/CollapsiblePanel';
import ShowInfo from './ShowInfo';
import DrawEditProfile from './EditProfile'
import DrawSearchUsers from './SearchUsers';

import iconGear from "../resources/img/icon-gear.png"
import iconSearch from "../resources/img/icon-search.png"
import iconUser from '../resources/img/icon-user.png'

import breakingBadImage from "../images/breakingbad.jpg";
import strangerThingsImage from "../images/strangerthings.jpg";
import theCrownImage from "../images/thecrown.jpg";
import theWitcherImage from "../images/thewitcher.jpg";
import friendsImage from "../images/friends.jpg";

export default function DrawProfile() {
  const { username } = useParams();
  const { APIUrl, contextUser } = useContext(AuthorizationContext);

  const [userInfo, setUserInfo] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [userIsFollowed, setUserIsFollowed] = useState(false);

  const [showShowStats, setShowShowStats] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSearchUsers, setShowSearchUsers] = useState(false);

  const [overlayActive, setOverlayActive] = useState(false); // Potrebno za prevenciju background-tabovanja kada je forma aktivna
  const navigate = useNavigate();

  const shows = [ //privremeno naravno
    { id: 1, title: "Breaking Bad", image: breakingBadImage, numberOfSeasons: 5, rating: 9.5, cast: [{ actor: { name: "Bryan Cranston" } }, { actor: { name: "Aaron Paul" } }, { actor: { name: "Anna Gunn" } }], genres: ["Crime", "Drama", "Thriller"], desc: "A high school chemistry teacher turned methamphetamine producer partners with a former student to build a drug empire.", year: 2008 },
    { id: 2, title: "Stranger Things", image: strangerThingsImage, numberOfSeasons: 4, rating: 8.7, cast: [{ actor: { name: "Winona Ryder" } }, { actor: { name: "David Harbour" } }, { actor: { name: "Finn Wolfhard" } }], genres: ["Drama", "Fantasy", "Horror"], desc: "A group of kids in a small town uncover supernatural events while searching for their missing friend.", year: 2016 },
    { id: 3, title: "The Crown", image: theCrownImage, numberOfSeasons: 6, rating: 8.6, cast: [{ actor: { name: "Claire Foy" } }, { actor: { name: "Olivia Colman" } }, { actor: { name: "Matt Smith" } }], genres: ["Biography", "Drama", "History"], desc: "The story of Queen Elizabeth II's reign, from her early years on the throne to present day.", year: 2016 },
    { id: 4, title: "The Witcher", image: theWitcherImage, numberOfSeasons: 3, rating: 8.1, cast: [{ actor: { name: "Henry Cavill" } }, { actor: { name: "Anya Chalotra" } }, { actor: { name: "Freya Allan" } }], genres: ["Action", "Adventure", "Drama"], desc: "A mutated monster hunter, Geralt of Rivia, struggles to find his place in a world where people often prove more wicked than beasts.", year: 2019 },
    { id: 5, title: "Friends", image: friendsImage, numberOfSeasons: 10, rating: 8.8, cast: [{ actor: { name: "Jennifer Aniston" } }, { actor: { name: "Courteney Cox" } }, { actor: { name: "Lisa Kudrow" } }], genres: ["Comedy", "Romance"], desc: "Six friends navigate life and love in New York City, sharing laughter, heartbreak, and a lot of coffee.", year: 1994 }
  ];

  useEffect(() => {
    getUserInfo(username);
    getUserStats(username);
    checkIfUserIsFollowing();
  }, [username]);

  useEffect(() => {
    console.log("Updated userStats:", userStats);
  }, [userStats]);

  useEffect(() => {
    console.log("Updated userInfo:", userInfo);
  }, [userInfo]);

  useEffect(() => {
    console.log(`http://localhost:5227${userInfo?.picture}`);
  }, [userInfo?.picture])

  const getUserInfo = async (username) => {
    var route = `User/GetUserByUsername/${username}`;
    await axios.get(APIUrl + route, {
      headers: {
        Authorization: `Bearer ${contextUser.jwtToken}`
      }
    })
      .then(result => {
        setUserInfo(result.data);
      })
      .catch(error => {
        console.log(error);
        if (error.response) {
          switch (error.response.status) {
            case 404:
              navigate("../NotFound");
              break;
          }
        }
      })
  }

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

  const followUser = async () => {
    var route = `User/FollowUser/${contextUser.username}/${username}`;
    await axios.put(APIUrl + route, {}, {
      headers: {
        Authorization: `Bearer ${contextUser.jwtToken}`,
        "Content-Type": "application/json"
      }
    })
      .then(() => {
        userStats.followersCount += 1;
        setUserIsFollowed(true);
      })
      .catch(error => {
        console.log(error);
      });
  }

  const unfollowUser = async () => {
    var route = `User/UnfollowUser/${contextUser.username}/${username}`;
    await axios.put(APIUrl + route, {}, {
      headers: {
        Authorization: `Bearer ${contextUser.jwtToken}`,
        "Content-Type": "application/json"
      }
    })
      .then(() => {
        userStats.followersCount -= 1;
        setUserIsFollowed(false);
      })
      .catch(error => {
        console.log(error);
      });
  }

  const checkIfUserIsFollowing = async () => {
    var route = `User/IsUserFollowing/${contextUser.username}/${username}`;
    await axios.get(APIUrl + route, {
      headers: {
        Authorization: `Bearer ${contextUser.jwtToken}`,
        "Content-Type": "application/json"
      }
    })
      .then(result => {
        console.log("Is following:", result.data);
        setUserIsFollowed(result.data);
      })
      .catch(error => {
        console.log("Error checking if user is following:", error);
      });
  }

  return (
    <Page loading={true} timeout={1000} overlayActive={overlayActive} overlayHandler={setOverlayActive}>
      {showShowStats && <ShowInfo show={shows[1]} handleExitClick={() => setShowShowStats(false)} />}
      {showEditProfile && <DrawEditProfile handleExitClick={() => setShowEditProfile(false)} user={userInfo} />}
      {showSearchUsers && <DrawSearchUsers handleExitClick={() => setShowSearchUsers(false)} />}

      {/* TOP SECTION */}
      <div className='grid grid-cols-12 gap-4 h-44 mb-4'>
        <div className='col-span-2 bg-indigo-950 border border-violet-900 rounded-xl content-center '>
          <img className={`max-w-36 max-h-36 justify-self-center border border-violet-900 rounded-l ${userInfo?.picture == null && "filter-white w-28"}`} src={userInfo?.picture != null ? `http://localhost:5227${userInfo?.picture}` : iconUser} />
          <p className='text-gray-400 font-bold text-center p-3 -mb-3'>{userInfo?.username ?? "loading..."}</p>
        </div>
        <div className='col-span-10'>
          <div className='grid grid-cols-3 gap-4 text-gray-400 text-center'>
            <div className='col-span-3 font-bold text-4xl text-white'>
              Show Statistics
            </div>
            <div className='bg-indigo-950 border border-violet-900 rounded-xl'>
              <p className='section-title !text-6xl'>{userStats?.watchingCount}</p>
              <div className='flex bg-indigo-950 border-t mx-4 py-1 border-violet-900 justify-center items-center'>
                <span className='bg-green-700 w-3 h-3 rounded-full mr-1' />
                <span>Watching</span>
              </div>
            </div>
            <div className='bg-indigo-950 border border-violet-900 rounded-xl'>
              <p className='section-title !text-6xl'>{userStats?.watchedCount}</p>
              <div className='flex bg-indigo-950 border-t mx-4 py-1 border-violet-900 justify-center items-center'>
                <span className='bg-blue-700 w-3 h-3 rounded-full mr-1' />
                <span>Completed</span>
              </div>
            </div>
            <div className='bg-indigo-950 border border-violet-900 rounded-xl'>
              <p className='section-title !text-6xl'>{userStats?.planToWatchCount}</p>
              <div className='flex bg-indigo-950 border-t mx-4 py-1 border-violet-900 justify-center items-center'>
                <span className='bg-gray-700 w-3 h-3 rounded-full mr-1' />
                <span>Plan to Watch</span>
              </div>
            </div>
            <div className='col-span-3 align-bottom'>
              <ColorLine values={[userStats?.watchingCount, userStats?.watchedCount, userStats?.planToWatchCount]} />
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-11 text-gray-400 mt-6'>
        <div className='col-span-8 bg-indigo-950 border border-violet-900 rounded-xl mr-3 px-3 py-1'>
          <p>{userInfo?.bio ?? "User has no bio."}</p>
        </div>
        <div className='col-span-3'>
          <div className='bg-indigo-950 border border-violet-900 rounded-xl ml-1 px-3 py-1 h-fit'>
            <p className='section-title !text-2xl !mb-0 justify-self-center'>{userStats?.followersCount} followers</p>
            {contextUser.username !== username && contextUser.role != "Guest" ? (
              userIsFollowed === true ? (
                <div className="mt-2 justify-self-center">
                  <Link onClick={unfollowUser}>Unfollow this user</Link>
                </div>) : (
                <div className="mt-2 justify-self-center">
                  <Link onClick={followUser}>Follow this user</Link>
                </div>)
            ) : null}
          </div>

          {contextUser.username == username ? (
            <div className='bg-indigo-950 border border-violet-900 rounded-xl ml-1 px-3 mt-4 py-1 h-fit flex items-center justify-center'>
              <img src={iconGear} className='filter-white w-6 mr-2' />
              <Link onClick={() => setShowEditProfile(true)}>Edit profile</Link>
            </div>) : null}

          <div className='bg-indigo-950 border border-violet-900 rounded-xl ml-1 px-3 mt-4 py-1 h-fit flex items-center justify-center'>
            <img src={iconSearch} className='filter-white w-6 mr-2' />
            <Link onClick={() => setShowSearchUsers(true)}>Search for users...</Link>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className='pt-5'>
        <CollapsiblePanel title="Currently Watching:" open={true}>
          <div className='grid grid-cols-6 gap-4 p-2'>
            <SeriesSlot title='Breaking Bad' image={breakingBadImage} func={() => setShowShowStats(true)} />
            <SeriesSlot title='Breaking Bad' image={breakingBadImage} func={() => setShowShowStats(true)} />
            <SeriesSlot title='Breaking Bad' image={breakingBadImage} func={() => setShowShowStats(true)} />
            <SeriesSlot title='Breaking Bad' image={breakingBadImage} func={() => setShowShowStats(true)} />
            <SeriesSlot title='Breaking Bad' image={breakingBadImage} func={() => setShowShowStats(true)} />
            <SeriesSlot title='Breaking Bad' image={breakingBadImage} func={() => setShowShowStats(true)} />
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
      <div className='border border-violet-900 hover:shadow-md hover:shadow-violet-500/50 hover:bg-violet-900 transition-all rounded-xl'>
        <img src={image} className='h-64 pt-2 px-2 rounded-2xl' />
        <p className='justify-self-center p-1 text-center'>{title}</p>
      </div>
    </a>
  );
}