import React, { useState, useContext } from 'react'
import AuthorizationContext from '../context/AuthorizationContext'
import { Page } from '../components/BasicComponents';
import  '../assets/colors.css'
import '../assets/animations.css'

export default function DrawLandingPage() {
  const { APIUrl, contextUser } = useContext(AuthorizationContext)
  const [search, setSearch] = useState(''); // Za pretragu serija
  const [overlayActive, setOverlayActive] = useState(false); // Potrebno za prevenciju background-tabovanja kada je forma aktivna

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setSearch('');
    }
  };

  // TODO - Da se popuni stranica
  return (
    <Page overlayActive={overlayActive} loading={true} overlayHandler={setOverlayActive}>

    </Page>
  );
}