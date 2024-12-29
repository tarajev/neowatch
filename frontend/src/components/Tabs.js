import React, { useState } from 'react'
import '../assets/tabs.css';

export default function Tabs({ preventTab, DrawTab1}) {
    const [toggleState, setToggleState] = useState(1);

    const toggleTab = (index) => {
        setToggleState(index);
    };

    return (
        <div className="container">
            <div className="bloc-tabs ">
                <button
                    tabIndex={preventTab ? -1 : 0}
                    className={toggleState === 1 ? "tabs active-tabs" : "tabs"}
                    onClick={() => toggleTab(1)}
                >
                    <span className="text">Search</span>
                </button>
                <button
                    tabIndex={preventTab ? -1 : 0}
                    className={toggleState === 2 ? "tabs active-tabs" : "tabs"}
                    onClick={() => toggleTab(2)}
                >
                    <span className="text">What To Watch</span>
                </button>
            </div>
            <div className="content-tabs">
                <div className={toggleState === 1 ? "content  active-content" : "content"}>
                    <DrawTab1 />
                </div>

                <div className={toggleState === 2 ? "content  active-content" : "content"}>
                  {/*  <DrawTab2 /> */}
                </div>
            </div>
        </div>
    );
}


