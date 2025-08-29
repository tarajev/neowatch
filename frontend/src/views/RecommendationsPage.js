import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import AuthorizationContext from "../context/AuthorizationContext";
import { Page } from "../components/BasicComponents";
import "../assets/colors.css";
import "../assets/scrollSection.css";
import "../assets/animations.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import breakingBadImage from "../images/breakingbad.jpg";
import strangerThingsImage from "../images/strangerthings.jpg";
import theCrownImage from "../images/thecrown.jpg";
import theWitcherImage from "../images/thewitcher.jpg";
import friendsImage from "../images/friends.jpg";
import ShowInfo from "./ShowInfo";

export default function DrawRecommendationsPage() {
  const { APIUrl, contextUser } = useContext(AuthorizationContext);
  const [selectedShow, setSelectedShow] = useState(null);
  const [whatFriendsAreWatching, setWhatFriendsAreWatching] = useState([]);
  const [recommendations, setRecommendation] = useState([]);
  const [yetToWatch, setYetToWatch] = useState([]);

  //postoji bug koji nisu popravili a to je da mora da ih ima minimum 4 (slidesToShow) da bi infinite radilo kako treba 
  // pa u skladu sa tim bi najbolje bilo da se prikazuje ukoliko ima barem 4 serija kako bi po izgledu bilo uniformno ili da postoji drugaciji settings 
  // za svaki od slidera s tim što će onda izgledati drugačije pa ne znam

  const getSliderSettings = (itemsLength) => ({
    dots: itemsLength > 3, 
    infinite: itemsLength > 3, // pošto postoji bug sa komponentom 
    speed: 500,
    slidesToShow: Math.min(4, itemsLength), 
    slidesToScroll: 1,
    arrows: itemsLength > 1,
  });

  const handleShowClick = (show) => {
    if (show.cast && show.genres) {
      console.log("POSTOJI");
      setSelectedShow(show);
      return;
    }
    getAdditionalInfo(show);
    console.log("NE POSTOJI");
  };

  const handleExitClick = () => {
    setSelectedShow(null); // Zatvara `ShowInfo`
  };

  useEffect(() => {
    getYetToWatchShows(contextUser.username);
    getRecommendations(contextUser.username);
    getWhatFriendsAreWatching(contextUser.username);
  }, []);

  const getYetToWatchShows = async (username) => {
    var route = `User/GetShowsToWatch/${username}`;
    await axios.get(APIUrl + route, {
      headers: {
        Authorization: `Bearer ${contextUser.jwtToken}`
      }
    })
      .then(result => {
        setYetToWatch(result.data)
        console.log("test" + result.data.show.imageUrl);
      })
      .catch(error => {
        console.log(error);
      })
  }

  const getRecommendations = async (username) => {
    var route = `Show/GetRecommendations/${username}`;
    await axios.get(APIUrl + route, {
      headers: {
        Authorization: `Bearer ${contextUser.jwtToken}`
      }
    })
      .then(result => {
        setRecommendation(result.data)
      })
      .catch(error => {
        console.log(error);
      })
  }

  const getWhatFriendsAreWatching = async (username) => {
    var route = `Show/FriendsWatchList/${username}`;
    await axios.get(APIUrl + route, {
      headers: {
        Authorization: `Bearer ${contextUser.jwtToken}`
      }
    })
      .then(result => {
        setWhatFriendsAreWatching(result.data)
      })
      .catch(error => {
        console.log(error);
      })
  }


  const getAdditionalInfo = async (show) => {
    var route = `Show/GetTvShowGenresAndActors/${show.title}`;
    await axios.get(APIUrl + route)
      .then(result => {
        const updatedShow = {
          ...show,
          cast: result.data.cast,
          genres: result.data.genres
        };

        setSelectedShow(updatedShow);

        setRecommendation(prevRecommendations =>
          prevRecommendations.map(s =>
            s.title === show.title ? updatedShow : s
          ));

        setWhatFriendsAreWatching(prevFriendsWatching =>
          prevFriendsWatching.map(s =>
            s.title === show.title ? updatedShow : s
          ));

        setYetToWatch(prevYetToWatch =>
          prevYetToWatch.map(s =>
            s.title === show.title ? updatedShow : s
          ));
      })
      .catch(error => {
        console.log(error);
      })
  }

  return (
    <>
      {selectedShow && (<ShowInfo handleExitClick={handleExitClick} show={selectedShow} />)}
      <div className="recommendations-page">
        {(yetToWatch.length == 0 && recommendations.length == 0) && <span className="mx-auto">Watch a show or follow a friend to get some recommendations!</span>}
        {/* Red 1 */}
        {yetToWatch && yetToWatch.length > 0 ? (
          <><h2 className="section-title">Don't forget to watch...</h2><Slider {...getSliderSettings(yetToWatch.length)}>
            {yetToWatch.map((show) => (
              <div key={show.title} className="show-card transition-opacity duration-200 hover:opacity-50"> {/*hover ili rotacija po y? */}
                <img src={`http://localhost:5227${show.imageUrl}`} alt={show.title} className="show-image" onClick={() => handleShowClick(show)} />
                <p className="show-title">{show.title}</p>
              </div>
            ))}
          </Slider></>
        ) : (<></>)}

        {/* Red 2 */}

        {recommendations && recommendations.length > 0 ? (
          <><h2 className="section-title">You might like...</h2>
            <Slider {...getSliderSettings(recommendations.length)}>
              {recommendations.map((show) => (
                <div key={show.id} className="show-card transition-opacity duration-200 hover:opacity-50">
                  <img src={`http://localhost:5227${show.imageUrl}`} alt={show.title} className="show-image" onClick={() => handleShowClick(show)} />
                  <p className="show-title">{show.title}</p>
                </div>
              ))}
            </Slider></>
        ) : (<></>)}

        {/* Red 3 */}
        {whatFriendsAreWatching && whatFriendsAreWatching.length > 0 ? (
          <><h2 className="section-title">What friends are watching...</h2>
            <Slider {...getSliderSettings(whatFriendsAreWatching.length)}>
              {whatFriendsAreWatching.map((show) => (
                <div key={show.id} className="show-card transition-opacity duration-200 hover:opacity-50">
                  <img src={`http://localhost:5227${show.imageUrl}`} alt={show.title} className="show-image" onClick={() => handleShowClick(show)} />
                  <p className="show-title">{show.title}</p>
                </div>
              ))}
            </Slider></>) : (<></>)}
      </div>
    </>
  );
}
