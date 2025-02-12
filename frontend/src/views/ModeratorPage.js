import React, { useContext, useEffect, useState } from 'react';
import { Page, Link, SelectableButton, Input, Button } from '../components/BasicComponents';
import { Pagination } from '@mui/material';
import iconUser from '../resources/img/icon-user.png'
import iconModerator from '../resources/img/icon-moderator.png'
import iconNone from '../resources/img/image-placeholder.png'
import iconSeries from '../resources/img/icon-series.png'
import iconPlus from '../resources/img/icon-plus.png'
import { useDebounce } from 'use-debounce';
import axios from 'axios';
import AuthorizationContext from '../context/AuthorizationContext';
import DrawEditModerator from './EditModerator';
import DrawAddProfile from './AddAccount';
import DrawAddShow from './AddShow';

export default function DrawAdministrativePanel() {
  const { contextUser, APIUrl } = useContext(AuthorizationContext);
  const [selectedCard, setSelectedCard] = useState("User");
  const [userCounts, setUserCounts] = useState((0, 0));
  const [showCount, setShowCount] = useState(0);

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedButton, setSelectedButton] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 800);

  const [showChangeProfile, setShowChangeProfile] = useState(false);
  const [showAddAccOrShow, setShowAddAccOrShow] = useState(false);
  const [showToEdit, setShowToEdit] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false); // Potrebno za prevenciju background-tabovanja kada je forma aktivna
  const [selectedUser, setSelectedUser] = useState(null);
  const [added, setAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Paginacija bi trebalo bolje da se uradi u backend-u, da uzima samo one koje je potrebno????

  // Pagination
  const itemsPerPage = 20;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToShow = items.slice(startIndex, endIndex);

  useEffect(() => {
    getUserCounts();
    getShowCount();
  }, [])

  useEffect(() => {
    console.log(selectedUser);
  }, [selectedUser])

  useEffect(() => {
    setItems([]);
  }, [selectedCard])

  useEffect(() => {
    if (debouncedSearch.length < 3) return;

    setIsLoading(true);
    var route = selectedCard !== "Show" ?
        (selectedButton ? `User/FindUsersByEmail/${debouncedSearch}/${selectedCard}` : `User/FindUsers/${debouncedSearch}/${selectedCard}`)
        : `Show/SearchShowByTitle/${debouncedSearch}`

    axios.get(APIUrl + route, {
      headers: {
        Authorization: `Bearer ${contextUser.jwtToken}`,
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        console.log(response.data);
        setItems(response.data);
      })
      .catch(error => {
        console.error("Error fetching users:", error);
        setItems([]);
      })
      .finally(() => {
        setIsLoading(false);
      });

  }, [debouncedSearch]);

  const getUserCounts = async () => {
    var route = 'User/GetUserCounts';
    await axios.get(APIUrl + route, {
      headers: {
        Authorization: `Bearer ${contextUser.jwtToken}`
      }
    })
      .then(result => {
        console.log(result);
        console.log(result.data);
        setUserCounts(result.data);
      })
      .catch(error => {
        console.log(error);
      })
  }

  const getShowCount = async () => {
    var route = 'Show/GetShowCount';
    await axios.get(APIUrl + route, {
      headers: {
        Authorization: `Bearer ${contextUser.jwtToken}`
      }
    })
      .then(result => {
        setShowCount(result.data);
      })
      .catch(error => {
        console.log(error);
      })
  }

  const handleAddAccOrShowClick = () => {
    setShowAddAccOrShow(true);
    setOverlayActive(true);
  };

  const handleExitAccOrShowClick = () => {
    setShowAddAccOrShow(false);
    setOverlayActive(true);
  }
  
  const handleEditAccOrShowClick = (item) => {
    if (selectedCard !== "Show") {
      setSelectedUser(item);
      setShowChangeProfile(true);
    }
    else { 
      setShowToEdit(item);
      setShowAddAccOrShow(true);
    }

    setOverlayActive(true);
  }

  const handleExitProfileEdit = () => {
    setSearch("");
    setShowChangeProfile(false);
    setOverlayActive(false);
  }

  const handleItemCount = () => {
    if (selectedCard === "Show") setShowCount(showCount + 1);
    // TODO za User i Moderator
    
    setAdded(!added);
  }

  const setSelectedButtonUsername = () => {
    setSelectedButton(false);
  }

  const setSelectedButtonEmail = () => {
    setSelectedButton(true);
  }

  return (
    <Page loading={true} overlayActive={overlayActive} overlayHandler={setOverlayActive}>
      {showChangeProfile && <DrawEditModerator handleExitClick={handleExitProfileEdit} user={selectedUser} />}
      {showAddAccOrShow && (selectedCard !== "Show" ?
        <DrawAddProfile handleExitClick={handleExitAccOrShowClick} /> :
        <DrawAddShow handleExitClick={handleExitAccOrShowClick} handleShowCount={handleItemCount} show={showToEdit} />)}
      <h3 className="text-3xl font-medium text-white">
        Moderator Panel
      </h3>

      <div className="mt-4 grid grid-cols-3 gap-4 w-full mr-4">
        <StatCountCard setSelectedFunc={setSelectedCard} setSelectedType={"User"} selectedCard={selectedCard} logo={iconUser} text="Users" number={userCounts[0]} preventTab={overlayActive} />
        <StatCountCard setSelectedFunc={setSelectedCard} setSelectedType={"Moderator"} selectedCard={selectedCard} logo={iconModerator} text="Moderators" number={userCounts[1]} preventTab={overlayActive} />
        <StatCountCard setSelectedFunc={setSelectedCard} setSelectedType={"Show"} selectedCard={selectedCard} logo={iconSeries} text="Shows" number={showCount} preventTab={overlayActive} />
      </div>

      <div className='grid gap-4 sm:grid-cols-1 md:grid-cols-8 xl:grid-cols-4'>
        <div className='grid md:col-span-8 h-fit lg:col-span-8 xl:col-span-4 bg-indigo-950 shadow-lg rounded-lg p-3 mt-6'>
          <div className='flex justify-between'>
            <div>
              <div className={`${selectedCard === "Show" ? "hidden" : ""}`}>
                <SelectableButton selected={!selectedButton} onClick={setSelectedButtonUsername} className='mr-2 mb-3 rounded-md px-3 py-1' preventTab={overlayActive}>
                  By Username
                </SelectableButton>
                <SelectableButton selected={selectedButton} onClick={setSelectedButtonEmail} className='mr-2 mb-3 px-3 py-1' preventTab={overlayActive}>
                  By E-Mail
                </SelectableButton>
              </div>
            </div>
            <Button preventTab={overlayActive} className="h-fit mb-3 px-3 py-1.5 flex flex-nowrap rounded-lg shadow-lg items-center" onClick={() => handleAddAccOrShowClick()}>
              <img src={iconPlus} className='filter-white w-6 h-auto mr-1 -ml-1' />
              {selectedCard === "Show" ? "Add Show" : "Add Moderator"}
            </Button>
          </div>
          <Input placeholder={(`Search ${selectedCard}s...`)} className="rounded-xl pl-4" onChange={(e) => { setSearch(e.target.value) }} preventTab={overlayActive} />
        </div>
      </div>

      <div className="flex flex-col mt-8">
        <div className="py-2 -my-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {items.length !== 0 ?
            <div className="inline-block min-w-full overflow-hidden align-middle border-b border-gray-200 shadow sm:rounded-lg">
              <table className="min-w-full">
                <TableHeader selectedCard={selectedCard} />
                <TableBody selectedCard={selectedCard} items={itemsToShow} changeItemClick={handleEditAccOrShowClick} preventTab={overlayActive} />
              </table>
            </div>
            : null}
          <div className='flex justify-center mt-4 color-white'>
            {items.length > itemsPerPage ?
              <Pagination
                size='large'
                disabled={overlayActive ? true : false}
                page={page}
                onChange={(e, value) => setPage(value)}
                count={Math.ceil(items.length / itemsPerPage)}
                className='filter-white'
              /> : null}
          </div>
        </div>
      </div>
    </Page>
  );
}

function TableHeader({ selectedCard }) {
  return (
    <thead>
      <tr className='bg-indigo-900 border-b border-violet-900 uppercase color-indigo-950 text-white text-left text-xs font-medium leading-4'>
        {selectedCard !== "Show" ?
          <>
            <th className='px-6 py-3'>Username</th>
            <th className='px-6 py-3'>E-Mail</th>
            <th className='px-6 py-3'>Joined Date</th>
            <th className='bg-indigo-900' />
          </> : null}
        {selectedCard === "Show" ?
          <>
            <th className='px-6 py-3'>Title</th>
            <th className='px-6 py-3'>Release Year</th>
            <th className='px-6 py-3'>Rating</th>
            <th className='px-6 py-3'>Seasons</th>
            <th className='px-6 py-3'>Reviews</th>
            <th className='bg-indigo-900' />
          </> : null}
      </tr>
    </thead>
  );
}

function TableBody({ items, selectedCard, changeItemClick, preventTab }) {
  function toShortDate(date) {
    const shortDate = new Date(date);
    return shortDate.toLocaleString('en-GB', { timeZoneName: 'short' });
  }

  return (
    <>
      {items.map((item, index) => (
        <tbody key={`${item}_${index}`} className={index % 2 == 0 ? "bg-indigo-950" : "bg-violet-950"}>
          <tr className='text-white'>
            <td className="px-6 py-4 border-  b border-gray-900 whitespace-nowrap">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-10">
                  <img className={`${selectedCard != "Show" ? "h-10" : ""} w-10 rounded-full`} src={(selectedCard !== "Show" ? (item.picture != null ? `http://localhost:5227${item.picture}` : iconNone) : (item.imageUrl != null ? `http://localhost:5227/${item.imageUrl}` : null))} />
                </div>
                <div className="ml-4 text-sm font-medium leading-5">
                  {(selectedCard !== "Show" ? 
                    <Link route={"/profile/"} param={`${item.username}/watching`}>{item.username}</Link> 
                    : item.title)}
                </div>
              </div>
            </td>

            {selectedCard !== "Show" ? (
              <>
                <td className="px-6 py-4 border-b border-gray-900 whitespace-nowrap">{item.email}</td>
                <td className="px-6 py-4 border-b border-gray-900 whitespace-nowrap">{toShortDate(item.joinedDate)}</td>
                <td className="px-6 py-4 text-sm font-medium leading-5 text-right border-b border-gray-900 whitespace-nowrap">
                  <Link preventTab={preventTab} onClick={() => changeItemClick(item)}>Edit</Link>
                </td>
              </>
            ) : (
              <>
                <td className="px-6 py-4 border-b border-gray-900 whitespace-nowrap">{item.year}</td>
                <td className="px-6 py-4 border-b border-gray-900 whitespace-nowrap">{item.rating ?? "Not rated yet"}</td>
                <td className="px-6 py-4 border-b border-gray-900 whitespace-nowrap">{item.numberOfSeasons}</td>
                <td className="px-6 py-4 border-b border-gray-900 whitespace-nowrap">{item.numberOfReviews ?? "No reviews yet"}</td>
                <td className="px-6 py-4 text-sm font-medium leading-5 text-right border-b border-gray-900 whitespace-nowrap">
                  <Link preventTab={preventTab} onClick={() => changeItemClick(item)}>Edit</Link>
                </td>
              </>
            )}
          </tr>
        </tbody>
      ))}
    </>
  );
}

function StatCountCard({ setSelectedFunc, setSelectedType, selectedCard, logo, text, number, preventTab }) {
  return ( // mora <a> da bi moglo da se fokusira sa TAB-om
    <a
      href="#"
      tabIndex={preventTab ? -1 : 0}
      onClick={() => setSelectedFunc(setSelectedType)}
      className={`cursor-pointer col-span-4 sm:col-span-2 lg:col-span-1 bg-gradient-to-r from-indigo-950 to-violet-950 border-y border-violet-900 rounded-md animated-shadow ${selectedCard === setSelectedType ? "card-selected" : ""}`}
    >
      <div className="flex items-center px-5 py-6">
        <div className="p-3 bg-violet-900 rounded-full">
          <img
            src={logo}
            className='h-8 w-8'
            style={{ filter: "invert(100%) sepia(93%) saturate(26%) hue-rotate(93deg) brightness(108%) contrast(106%)" }}
          />
        </div>

        <div className="mx-5">
          <h4 className="text-2xl font-semibold text-white">
            {number}
          </h4>
          <div className="text-gray-400">
            {text}
          </div>
        </div>
      </div>
    </a>
  );
}