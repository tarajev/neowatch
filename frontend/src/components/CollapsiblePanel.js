import React from "react";
import { useState } from "react";
import DropdownIcon from "../resources/img/icon-dropdown.png"
import CollapseIcon from "../resources/img/icon-collapse.png"

export default function CollapsiblePanel({ title, open = false, className, children }) {
  const [isOpen, setIsOpen] = useState(open);

  const togglePanel = () => {
    setIsOpen((prevState) => !prevState);
  };

  return (
    <div className={`${className} py-1`}>
      {/* Header */}
      <div onClick={togglePanel} className="cursor-pointer flex bg-indigo-950 border-b-2 border-violet-900 align-center rounded-t-xl">
        <img src={(isOpen ? CollapseIcon : DropdownIcon)} className="w-6 h-6 filter-white m-2" />
        <span className="section-title">{title}</span>
      </div>

      {/* Content */}
      {isOpen ? 
      <div className="bg-violet-950 text-gray-400 rounded-b-xl p-2 appear-from-top">{children}</div> :
      <div className="mt-10 disappear-to-top" />}
    </div>
  );
};