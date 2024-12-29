import React, { useContext } from "react";
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

export default function DrawRecommendationsPage() {
  const { APIUrl, contextUser } = useContext(AuthorizationContext);

  const shows = [
    { id: 1, title: "Breaking Bad", image: breakingBadImage },
    { id: 2, title: "Stranger Things", image: strangerThingsImage },
    { id: 3, title: "The Crown", image: theCrownImage },
    { id: 4, title: "The Witcher", image: theWitcherImage },
    { id: 5, title: "Friends", image: friendsImage },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
  };

  return (
      <div className="recommendations-page">
        {/* Red 1 */}
        <h2 className="section-title">Don't forget to watch...</h2>
        <Slider {...settings}>
          {shows.map((show) => (
            <div key={show.id} className="show-card">
              <img src={show.image} alt={show.title} className="show-image" />
              <p className="show-title">{show.title}</p>
            </div>
          ))}
        </Slider>

        {/* Red 2 */}
        <h2 className="section-title">You might like...</h2>
        <Slider {...settings}>
          {shows.map((show) => (
            <div key={show.id} className="show-card">
              <img src={show.image} alt={show.title} className="show-image" />
              <p className="show-title">{show.title}</p>
            </div>
          ))}
        </Slider>

        {/* Red 3 */}
        <h2 className="section-title">What friends are watching...</h2>
        <Slider {...settings}>
          {shows.map((show) => (
            <div key={show.id} className="show-card">
              <img src={show.image} alt={show.title} className="show-image" />
              <p className="show-title">{show.title}</p>
            </div>
          ))}
        </Slider>
      </div>
  );
}
