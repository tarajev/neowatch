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

export default function DrawProfile() {
  const { username, tab } = useParams();
  const { APIUrl, contextUser } = useContext(AuthorizationContext);

  const [userInfo, setUserInfo] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [userIsFollowed, setUserIsFollowed] = useState(false);
  const [showsWatching, setShowsWatching] = useState([]);
  const [showsWatched, setShowsWatched] = useState([]);
  const [showsToWatch, setShowsToWatch] = useState([]);

  const [showShowStats, setShowShowStats] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSearchUsers, setShowSearchUsers] = useState(false);
  const [showSelected, setShowSelected] = useState(null);

  const [openList, setOpenList] = useState(tab);

  const [overlayActive, setOverlayActive] = useState(false); // Potrebno za prevenciju background-tabovanja kada je forma aktivna
  const navigate = useNavigate();

  useEffect(() => {
    checkIfUserIsFollowing();
    getUserInfo(username);
    getUserStats(username);
    getUserShows(username);
  }, [username]);

  const displayShowInfo = (show) => {
    console.log("serija" + show);
    getAdditionalShowInfo(show);
  }

  const getAdditionalShowInfo = async (show) => {
    var route = `Show/GetTvShowGenresAndActors/${show.title}`;
    await axios.get(APIUrl + route)
      .then(result => {
        const updatedShow = {
          ...show,
          cast: result.data.cast,
          genres: result.data.genres
        };
        setShowSelected(updatedShow);
        setShowShowStats(true);
      })
      .catch(error => {
        console.log(error);
      })
  }

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

  const getUserShows = async (username) => {
    var routeWatching = `User/GetShowsWatching/${username}`;
    var routeWatched = `User/GetShowsWatched/${username}`;
    var routePlansToWatch = `User/GetShowsToWatch/${username}`;

    await axios.get(APIUrl + routeWatching, {
      headers: {
        Authorization: `Bearer ${contextUser.jwtToken}`,
        "Content-Type": "application/json",
      }
    })
      .then((response) => {
        setShowsWatching(response.data);
      })
      .catch((error) => {
        if (error.response?.status === 404) {
          console.warn("No watching shows found.");
          setShowsWatching([]);
        } else {
          console.error("Error fetching watching shows:", error);
        }
      });

    await axios.get(APIUrl + routeWatched, {
      headers: {
        Authorization: `Bearer ${contextUser.jwtToken}`,
        "Content-Type": "application/json",
      }
    })
      .then((response) => {
        setShowsWatched(response.data);
      })
      .catch((error) => {
        if (error.response?.status === 404) {
          console.warn("No watched shows found.");
          setShowsWatched([]);
        } else {
          console.error("Error fetching watched shows:", error);
        }
      });

    await axios.get(APIUrl + routePlansToWatch, {
      headers: {
        Authorization: `Bearer ${contextUser.jwtToken}`,
        "Content-Type": "application/json",
      }
    })
      .then((response) => {
        setShowsToWatch(response.data);
      })
      .catch((error) => {
        if (error.response?.status === 404) {
          console.warn("No planned-to-watch shows found.");
          setShowsToWatch([]);
        } else {
          console.error("Error fetching planned-to-watch shows:", error);
        }
      });
  }

  const followUser = async () => {
    var route = `User/FollowUser/${contextUser.username}/${username}`;
    await axios.put(APIUrl + route, {
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
    await axios.put(APIUrl + route, {
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
        setUserIsFollowed(result.data);
      })
      .catch(error => {
        console.log("Error checking if user is following:", error);
      });
  }

  const handleShowMovingLists = (show, toList) => {
    setShowsToWatch(prev => prev.filter(s => s.title!== show.title));
    setShowsWatching(prev => prev.filter(s => s.title !== show.title));
    setShowsWatched(prev => prev.filter(s => s.title !== show.title));

    if (toList === "watchlist") {
      setShowsToWatch(prev => [...prev, show]);
    } else if (toList === "watching") {
      setShowsWatching(prev => [...prev, show]);
    } else if (toList === "watched") {
      setShowsWatched(prev => [...prev, show]);
    }
  };

  return (
    <Page loading={true} timeout={1000} overlayActive={overlayActive} overlayHandler={setOverlayActive}>
      {showShowStats && <ShowInfo show={showSelected} handleExitClick={() => setShowShowStats(false)} onMoveShow={handleShowMovingLists} />}
      {showEditProfile && <DrawEditProfile handleExitClick={() => setShowEditProfile(false)} user={userInfo} />}
      {showSearchUsers && <DrawSearchUsers handleExitClick={() => setShowSearchUsers(false)} />}

      {/* TOP SECTION */}
      <div className='grid grid-cols-12 gap-4 h-44 mb-4'>
        <div className='col-span-3 md:col-span-2 overflow-x-clip bg-indigo-950 border border-violet-900 rounded-xl content-center '>
          <img className={`max-w-36 max-h-36 justify-self-center border border-violet-900 rounded-lg ${userInfo?.picture == null && "filter-white w-28"}`} src={userInfo?.picture != null ? `http://localhost:5227${userInfo?.picture}` : iconUser} />
          <p className='text-gray-400 font-bold text-center p-3 -mb-3'>{userInfo?.username ?? "loading..."}</p>
        </div>
        <div className='col-span-9 md:col-span-10'>
          <div className='grid grid-cols-3 gap-4 text-gray-400 text-center'>
            <div className='col-span-3 font-bold text-4xl text-white'>
              Show Statistics
            </div>
            <div className='bg-indigo-950 border border-violet-900 rounded-xl'>
              <p className='section-title !text-6xl'>{userStats?.watchingCount}</p>
              <div className='flex bg-indigo-950 border-t mx-4 py-1 border-violet-900 justify-center items-center'>
                <span className='hidden sm:block bg-green-700 w-3 h-3 rounded-full mr-1' />
                <span className='text-green-700 sm:text-gray-400'>Watching</span>
              </div>
            </div>
            <div className='bg-indigo-950 border border-violet-900 rounded-xl'>
              <p className='section-title !text-6xl'>{userStats?.watchedCount}</p>
              <div className='flex bg-indigo-950 border-t mx-4 py-1 border-violet-900 justify-center items-center'>
                <span className='hidden sm:block bg-blue-700 w-3 h-3 rounded-full mr-1' />
                <span className='text-blue-700 sm:text-gray-400'>Completed</span>
              </div>
            </div>
            <div className='bg-indigo-950 border border-violet-900 rounded-xl'>
              <p className='section-title !text-6xl'>{userStats?.planToWatchCount}</p>
              <div className='flex bg-indigo-950 border-t mx-4 py-1 border-violet-900 justify-center items-center'>
                <span className='hidden sm:block bg-gray-700 w-3 h-3 rounded-full mr-1' />
                <span className='hidden sm:block sm:mr-1'>In</span>
                <span>Watchlist</span>
              </div>
            </div>
            <div className='col-span-3 align-bottom'>
              <ColorLine values={[userStats?.watchingCount, userStats?.watchedCount, userStats?.planToWatchCount]} />
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-11 text-gray-400 mt-6'>
        <div className='col-span-6 sm:col-span-8 bg-indigo-950 border border-violet-900 rounded-xl mr-3 px-3 py-1'>
          <p>{userInfo?.bio ?? "User has no bio."}</p>
        </div>
        <div className='col-span-5 sm:col-span-3'>
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
        <CollapsiblePanel title="Currently Watching:" open={openList === "watching" ? true : false}>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-8 lg:grid-cols-6 gap-4 p-2'>
            {showsWatching.length == 0 && <p className='col-span-2 md:col-span-4 lg:col-span-2'>This user has no shows currently watching.</p>}
            {console.log("broj serija:" + showsWatching.length)}
            {showsWatching.map((show, index) => (
              <SeriesSlot key={`watching-${index}`} title={show.title} image={`http://localhost:5227${show.imageUrl}`} func={() => displayShowInfo(show)} />
            ))}
          </div>
        </CollapsiblePanel>
        <CollapsiblePanel title="Watched Shows:" open={openList === "watched" ? true : false}>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-8 lg:grid-cols-6 gap-4 p-2'>
            {showsWatched.length == 0 && <p className='col-span-2 mg:col-span-4 lg:col-span-2'>This user has no shows watched.</p>}
            {showsWatched.map((show, index) => (
              <SeriesSlot key={`watched-${index}`} title={show.title} image={`http://localhost:5227${show.imageUrl}`} func={() => displayShowInfo(show)} />
            ))}
          </div>
        </CollapsiblePanel>
        <CollapsiblePanel title="Plans to Watch:" open={openList === "towatch" ? true : false}>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-8 lg:grid-cols-6 gap-4 p-2'>
            {showsToWatch.length == 0 && <p className='col-span-2 md:col-span-4 lg:col-span-3'>This user has no planned shows to watch.</p>}
            {showsToWatch.map((show, index) => (
              <SeriesSlot key={`planstowatch-${index}`} title={show.title} image={`http://localhost:5227${show.imageUrl}`} func={() => displayShowInfo(show)} />
            ))}
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
      className='col-span-1 md:col-span-2 lg:col-span-1'
      tabIndex={preventTab ? -1 : 0}
      onClick={() => func()}
    >
      <div className='border border-violet-900 hover:shadow-md hover:shadow-violet-500/50 hover:bg-violet-900 transition-all rounded-xl'>
        <img src={image} className='h-64 pt-2 px-2 rounded-2xl justify-self-center' />
        <p className='justify-self-center p-1 text-center'>{title}</p>
      </div>
    </a>
  );
}