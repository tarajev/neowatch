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

  const shows = [ //privremeno naravno
    { id: 1, title: "Breaking Bad", image: breakingBadImage, numberOfSeasons: 5, rating: 9.5, cast: [{ actor: { name: "Bryan Cranston" } }, { actor: { name: "Aaron Paul" } }, { actor: { name: "Anna Gunn" } }], genres: ["Crime", "Drama", "Thriller"], desc: "A high school chemistry teacher turned methamphetamine producer partners with a former student to build a drug empire.", year: 2008 },
    { id: 2, title: "Stranger Things", image: strangerThingsImage, numberOfSeasons: 4, rating: 8.7, cast: [{ actor: { name: "Winona Ryder" } }, { actor: { name: "David Harbour" } }, { actor: { name: "Finn Wolfhard" } }], genres: ["Drama", "Fantasy", "Horror"], desc: "A group of kids in a small town uncover supernatural events while searching for their missing friend.", year: 2016 },
    { id: 3, title: "The Crown", image: theCrownImage, numberOfSeasons: 6, rating: 8.6, cast: [{ actor: { name: "Claire Foy" } }, { actor: { name: "Olivia Colman" } }, { actor: { name: "Matt Smith" } }], genres: ["Biography", "Drama", "History"], desc: "The story of Queen Elizabeth II's reign, from her early years on the throne to present day.", year: 2016 },
    { id: 4, title: "The Witcher", image: theWitcherImage, numberOfSeasons: 3, rating: 8.1, cast: [{ actor: { name: "Henry Cavill" } }, { actor: { name: "Anya Chalotra" } }, { actor: { name: "Freya Allan" } }], genres: ["Action", "Adventure", "Drama"], desc: "A mutated monster hunter, Geralt of Rivia, struggles to find his place in a world where people often prove more wicked than beasts.", year: 2019 },
    { id: 5, title: "Friends", image: friendsImage, numberOfSeasons: 10, rating: 8.8, cast: [{ actor: { name: "Jennifer Aniston" } }, { actor: { name: "Courteney Cox" } }, { actor: { name: "Lisa Kudrow" } }], genres: ["Comedy", "Romance"], desc: "Six friends navigate life and love in New York City, sharing laughter, heartbreak, and a lot of coffee.", year: 1994 }
  ];

  //postoji bug koji nisu popravili a to je da mora da ih ima minimum 4 (slidesToShow) da bi infinite radilo kako treba 
  // pa u skladu sa tim bi najbolje bilo da se prikazuje ukoliko ima barem 4 serija kako bi po izgledu bilo uniformno ili da postoji drugaciji settings 
  // za svaki od slidera s tim što će onda izgledati drugačije pa ne znam
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true
  };

  const handleShowClick = (show) => {
    if(show.cast && show.genres){
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
    var route = `User/GetShowsToWatch`;
    await axios.get(APIUrl + route, {
      headers: {
        Authorization: `Bearer ${contextUser.jwtToken}`
      },
      params: { username: username }
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
        {/* Red 1 */}
        {yetToWatch && yetToWatch.length > 0 ? (
          <><h2 className="section-title">Don't forget to watch...</h2><Slider {...settings}>
            {yetToWatch.map((show) => (
              <div key={show.title} className="show-card transition-opacity duration-200 hover:opacity-50"> {/*hover ili rotacija po y? */}
                <img src={`../images/${show.imageUrl}`} alt={show.title} className="show-image" onClick={() => handleShowClick(show)} />
                <p className="show-title">{show.title}</p>
              </div>
            ))}
          </Slider></>
        ) : (<></>)}

        {/* Red 2 */}

        {recommendations && recommendations.length > 0 ? (
          <><h2 className="section-title">You might like...</h2>
            <Slider {...settings}>
              {recommendations.map((show) => (
                <div key={show.id} className="show-card transition-opacity duration-200 hover:opacity-50">
                  <img src={`../images/${show.imageUrl}`} alt={show.title} className="show-image" onClick={() => handleShowClick(show)} />
                  <p className="show-title">{show.title}</p>
                </div>
              ))}
            </Slider></>
        ) : (<></>)}

        {/* Red 3 */}
        {whatFriendsAreWatching && whatFriendsAreWatching.length > 0 ? (
          <><h2 className="section-title">What friends are watching...</h2>
            <Slider {...settings}>
              {whatFriendsAreWatching.map((show) => (
                <div key={show.id} className="show-card transition-opacity duration-200 hover:opacity-50">
                  <img src={`../images/${show.imageUrl}`} alt={show.title} className="show-image" onClick={() => handleShowClick(show)} />
                  <p className="show-title">{show.title}</p>
                </div>
              ))}
            </Slider></>) : (<></>)}
      </div>
    </>
  );
}
