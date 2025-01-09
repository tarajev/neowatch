import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { Page, Link } from '../components/BasicComponents'
import AuthorizationContext from '../context/AuthorizationContext'
import axios from 'axios'
import profilePhoto from "../images/profilepicture.jpg";
import ColorLine from "../components/ColorLine"

export default function DrawProfile() {
  const { APIUrl, contextUser } = useContext(AuthorizationContext);
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
      })
      .catch(error => {
        console.log(error);
      })
  }

  return (
    <Page loading={true}>
      {/* TOP SECTION */}
      <div className='grid grid-cols-12 gap-4 h-44 mb-4'>
        <div className='col-span-2 bg-indigo-950 border border-violet-900 rounded-xl content-center '>
          <img className='max-w-36 max-h-36 justify-self-center border border-violet-900 rounded-l' src={profilePhoto} />
          <p className='text-gray-400 font-bold text-center p-3 -mb-3'>Username placeholder</p>
        </div>
        <div className='col-span-10'>
          <div className='grid grid-cols-3 gap-4 text-gray-400 text-center'>
            <div className='col-span-3 font-bold text-4xl'>
              Show Statistics
            </div>
            <div className='bg-indigo-950 border border-violet-900 rounded-xl'>
              <p className='section-title !text-6xl'>
                12
              </p>
              <div className='flex bg-indigo-950 border-t mx-4 py-1 border-violet-900 justify-center items-center'>
                <span className='bg-green-700 w-3 h-3 rounded-full mr-1' />
                <span>Watching</span>
              </div>
            </div>
            <div className='bg-indigo-950 border border-violet-900 rounded-xl'>
              <p className='section-title !text-6xl'>
                35
              </p>
              <div className='flex bg-indigo-950 border-t mx-4 py-1 border-violet-900 justify-center items-center'>
                <span className='bg-blue-700 w-3 h-3 rounded-full mr-1' />
                <span>Completed</span>
              </div>
            </div>
            <div className='bg-indigo-950 border border-violet-900 rounded-xl'>
              <p className='section-title !text-6xl'>
                56
              </p>
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

      {/* BOTTOM SECTION */}
      <div className='grid grid-cols-12'>
        <p className='col-span-12 section-title border-b-2 border-indigo-950'>Favorite Shows:</p>
        <p className='col-span-12 section-title border-b-2 border-indigo-950'>Currently watching:</p>
        <p className='col-span-12 section-title border-b-2 border-indigo-950'>Plans to watch:</p>
      </div>
    </Page>
  );
}