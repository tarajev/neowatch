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
  const [userCounts, setUserCounts] = useState({
    users: 0,
    moderators: 0,
    series: 0
  });
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedButton, setSelectedButton] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 800);
  const [showChangeProfile, setShowChangeProfile] = useState(false);
  const [showAddAccOrShow, setShowAddAccOrShow] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false); // Potrebno za prevenciju background-tabovanja kada je forma aktivna
  const [selectedUser, setSelectedUser] = useState(null);
  const [changes, setChanges] = useState(false);
  const [added, setAdded] = useState(false);

  // Pagination
  const itemsPerPage = 20;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToShow = items.slice(startIndex, endIndex);

  const handleAddAccOrShowClick = () => {
    setShowAddAccOrShow(true);
    setOverlayActive(true);
  };

  const handleExitAccOrShowClick = () => {
    setShowAddAccOrShow(false);
    setOverlayActive(false);
  }

  const handleChangeProfileClick = (user) => {
    setSelectedUser(user);
    setShowChangeProfile(true);
    setOverlayActive(true);
  };

  const handleExitProfileEdit = () => {
    setSearch("");
    setShowChangeProfile(false);
    setOverlayActive(false);
    setChanges(true);
  }

  const handleItemCount = () => {
    // TODO
    setAdded(!added);
  }

  useEffect(() => {
    setItems([]);
    setChanges(false);
  }, [selectedCard, changes])

  const setSelectedButtonUsername = () => {
    setSelectedButton(false);
  }

  const setSelectedButtonSeries = () => {
    setSelectedButton(true);
  }

  return (
    <Page loading={true} overlayActive={overlayActive} overlayHandler={setOverlayActive}>
      {showChangeProfile && <DrawEditModerator handleExitClick={handleExitProfileEdit} user={selectedUser} />}
      {showAddAccOrShow && (selectedCard !== "Show" ? 
        <DrawAddProfile handleExitClick={handleExitAccOrShowClick} handleUserCount={handleItemCount} /> : 
        <DrawAddShow handleExitClick={handleExitAccOrShowClick} handleShowCount={handleItemCount} />)}
      <h3 className="text-3xl font-medium text-white">
        Moderator Panel
      </h3>

      <div className="mt-4 grid grid-cols-3 gap-4 w-full mr-4">
        <StatCountCard setSelectedFunc={setSelectedCard} setSelectedType={"User"} selectedCard={selectedCard} logo={iconUser} text="Korisnika" number={userCounts.users} preventTab={overlayActive} />
        <StatCountCard setSelectedFunc={setSelectedCard} setSelectedType={"Moderator"} selectedCard={selectedCard} logo={iconModerator} text="Moderatora" number={userCounts.moderators} preventTab={overlayActive} />
        <StatCountCard setSelectedFunc={setSelectedCard} setSelectedType={"Show"} selectedCard={selectedCard} logo={iconSeries} text="Serija" number={userCounts.series} preventTab={overlayActive} />
      </div>

      <div className='grid gap-4 sm:grid-cols-1 md:grid-cols-8 xl:grid-cols-4'>
        <div className='grid md:col-span-8 h-fit lg:col-span-8 xl:col-span-4 bg-indigo-950 shadow-lg rounded-lg p-3 mt-6'>
          <div className='flex justify-between'>
            <div>
              <div className={`${selectedCard === "Show" ? "hidden" : ""}`}>
                <SelectableButton selected={!selectedButton} onClick={setSelectedButtonUsername} className='mr-2 mb-3 rounded-md px-3 py-1' preventTab={overlayActive}>
                  Pretraga po korisničkom imenu
                </SelectableButton>
                <SelectableButton selected={selectedButton} onClick={setSelectedButtonSeries} className='mr-2 mb-3 px-3 py-1' preventTab={overlayActive}>
                  Pretraga po email-u
                </SelectableButton>
              </div>
            </div>
            <Button preventTab={overlayActive} className="h-fit mb-3 px-3 py-1.5 flex flex-nowrap rounded-lg shadow-lg items-center" onClick={() => handleAddAccOrShowClick()}>
              <img src={iconPlus} className='filter-white w-6 h-auto mr-1 -ml-1' />
              {selectedCard === "Show" ? "Dodaj seriju" : "Dodaj moderatora"}
            </Button>
          </div>
          <Input placeholder={(selectedCard === "Show" ? 'Pretražite serije...' : 'Pretražite korisnike...')} className="rounded-xl pl-4" onChange={(e) => { setSearch(e.target.value) }} preventTab={overlayActive} />
        </div>
      </div>

      <div className="flex flex-col mt-8">
        <div className="py-2 -my-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {items.length !== 0 ? 
            <div className="inline-block min-w-full overflow-hidden align-middle border-b border-gray-200 shadow sm:rounded-lg">
              <table className="min-w-full">
                <TableHeader selectedCard={selectedCard} />
                <TableBody selectedCard={selectedCard} items={itemsPerPage} changeProfileClick={handleChangeProfileClick} preventTab={overlayActive} />
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
      <tr className='bg-gray-100 border-b border-violet-900 uppercase color-indigo-950 text-left text-xs font-medium leading-4'>
        {selectedCard !== "Show" ?
          <>
            <th className='px-6 py-3'>Korisničko ime</th>
            <th className='px-6 py-3'>EMail</th>
            <th className='px-6 py-3'>Datum registracije</th>
          </> : null}
        {selectedCard === "Show" ?
          <>
            <th className='px-6 py-3'>Naslov serije</th>
            <th className='px-6 py-3'>Godina izdavanja</th>
            <th className='px-6 py-3'>Ocena</th>
            <th className='px-6 py-3'>Broj sezona</th>
            <th className='px-6 py-3'>Broj recenzija</th>
          </> : null}
      </tr>
    </thead>
  );
}

function TableBody({ items, selectedCard, changeProfileClick, preventTab }) {
  return (
    <>
      {items.map((item, index) => (
        <tbody key={`${item}_${index}`} className={index % 2 == 0 ? "bg-white" : "table-color-row"}>
          <tr>
            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-10 h-10">
                  <img
                    className="w-10 h-10 rounded-full"
                    src={item.picture ?? iconNone} // user.picture
                  />
                </div>

                <div className="ml-4">
                  <div className="text-sm font-medium leading-5 text-gray-900">
                    {item.username}
                  </div>
                  <div className="text-sm leading-5 text-gray-500">
                    {item.email}
                  </div>
                </div>
              </div>
            </td>
            {/* Ne moze ovako na zalost, mora odvojeno useri i serije. Bice malo prazno doduse ali sta cu */}
            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">{item.username}</td>
            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">{item.email}</td>
            <td className="px-6 py-4 text-sm font-medium leading-5 text-right border-b border-gray-200 whitespace-nowrap">
              <Link preventTab={preventTab} onClick={() => changeProfileClick(item)}>Izmeni</Link>
            </td>
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