import React, { useState, useEffect, useContext } from 'react'
import AuthorizationContext from '../context/AuthorizationContext'
import { useDebounce } from 'use-debounce'
import { Page, SelectableButton, Exit, Input, Link } from '../components/BasicComponents';
import { LinearProgress } from '@mui/material';
import  '../assets/colors.css'
import '../assets/animations.css'
import axios from 'axios';

export default function DrawSearchDiseases() {
  const { APIUrl, contextUser } = useContext(AuthorizationContext)
  const [selectedSearch, setSelectedSearch] = useState(false); // Trazenje po imenu ili simptomima, true - simptomi, false - ime
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 800); // Debounce za search
  const [symptoms, setSymptoms] = useState([]); // simptomi po kojima se trazi
  const [overlayActive, setOverlayActive] = useState(false); // Potrebno za prevenciju background-tabovanja kada je forma aktivna

  const setSelectedSearchName = (e) => {
    setSelectedSearch(false);
    clearSymptoms();
  }

  const setSelectedSearchSymptom = (e) => {
    setSelectedSearch(true);
  };

  const addSymptom = () => {
    if (search.trim() !== '' && !symptoms.includes(search))
      setSymptoms([...symptoms, search]);
  };

  const removeSymptom = (indeks) => {
    const newList = symptoms.filter((_, index) => index !== indeks);
    setSymptoms(newList);
  };

  const clearSymptoms = () => {
    setSymptoms([]);
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && selectedSearch) {
      addSymptom();
      setSearch('');
    }
  };

  return (
    <Page overlayActive={overlayActive} loading={true} overlayHandler={setOverlayActive}>
      
    </Page>
  );

  function DrawSymptomTags() {
    return symptoms.map((item, index) => (
      <SymptomTag key={index} symptom={item} onDelete={() => removeSymptom(index)} />
    ));
  }

  function SymptomTag({ symptom, onDelete }) {
    return (
      <div className='mr-2 my-1 px-2 py-1 bg-gray-100 shadow-md rounded-lg flex flex-wrap items-center'>
        {symptom}
        <Exit
          blue
          preventTab={overlayActive}
          onClick={onDelete}
          className="ml-2 w-2"
        />
      </div>
    );
  }
}

function DrawDiseases({ selectedSearch, search, symptoms }) {
  const { APIUrl, contextUser } = useContext(AuthorizationContext);
  const [lastSearch, setLastSearch] = useState('');
  const [lastSymptoms, setLastSymptoms] = useState('');
  const [diseases, setDiseases] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      if (!selectedSearch && search == '')
        setLoaded(false);

      try {
        if (!selectedSearch && (search.length >= 3 && lastSearch !== search) || selectedSearch && symptoms.length > 0 && lastSymptoms != symptoms) { // Tweakuj minimum slova za pretragu po potrebi
          if (!selectedSearch) {
            setLastSearch(search);
            var route = `Guest/GetDiseasesByName/${search}`

            const query = await axios.get(APIUrl + route)
            .then(response => {
              var diseases = [];
              var data = {...response.data};
              var keys = Object.keys(data);
              keys.map(key => {
                if(!data[key].medication || contextUser.role !== "Doctor" ) { data[key]['medication'] = []; }
                diseases.push(data[key])
              })
              setDiseases(diseases); // Niz bolesti
            })
            .catch(error => {
              console.log(error);
            })
          }
          else {
            setLastSymptoms(symptoms);
            
            var route = `Guest/GetDiseasesBySymptoms`
            const query = await axios.post(APIUrl + route, symptoms)
            .then(response => {
              var diseases = [];
              var data = {...response.data};
              var keys = Object.keys(data);
              keys.map(key => {
                if(!data[key].medication || contextUser.role !== "Doctor" ) { data[key]['medication'] = []; }
                diseases.push(data[key])
              })
              setDiseases(diseases); // Niz bolesti
            })
            .catch(error => {
              console.log(error);
            })
          }
          setLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching diseases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [search, lastSearch, symptoms, lastSymptoms]);

  if (loading) {
    return (
      <div className='mt-3 px-8 w-full color-primary'>
        <LinearProgress className="rounded-xl" color="inherit" />
      </div>
    );
  }

  if (!diseases || diseases.length === 0) {
    return (
      <>
        {loaded ? <p className='text-xl mt-2 mx-1 color-primary'>Ne postoje bolesti sa navedenom pretragom.</p> : null}
      </>
    )
  }
  else {
    return (
      <>
        {diseases.map((disease) => (
          <DrawDisease
            key={disease.name}
            name={disease.name}
            symptoms={disease.symptoms}
            medication={disease.medication}
            description={disease.description}
          />
        ))}
      </>
    );
  }
}

function DrawDisease({ name, symptoms, medication, description }) {
  return (
    <div className='mt-3 border-2 border-primary bg-secondary rounded-2xl shadow-md p-4'>
      <div className='mb-4 p-2 rounded-xl bg-gradient-to-r from-cyan-50 to-white'>
        <p className='text-2xl'>{name}</p>
        <div className='flex flex-wrap sm:flex-nowrap'>
          <span className='text-md mr-1'>Simptomi:</span>
          <DiseaseList disease={name} list={symptoms} />
        </div>
        {medication.length > 0 && <div className='flex flex-wrap sm:flex-nowrap'>
          <span className='text-md mr-1'>Lekovi:</span>
          <DiseaseList disease={name} list={medication} />
        </div>}
      </div>

      <div className='p-2 rounded-xl bg-gradient-to-r from-gray-100 to-white'>
        <p className='text-md text-justify'>{description}</p>
      </div>
    </div>
  );
}

function DiseaseList({ disease, list }) {
  return (
    <>
      <ul className='flex flex-wrap'>
        {list.map((item, index) => (
          <li key={item + "_" + { disease }} className='mr-1'>
            <Link className="text-sm">{item}</Link>
            {index !== list.length - 1 && ","}
          </li>
        ))}
      </ul>
    </>
  );
}