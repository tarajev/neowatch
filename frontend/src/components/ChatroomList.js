import React from "react";
import { Link } from "./BasicComponents";

export default function ChatroomList({ users, selectedChatroomID, handleClick }) {
  return (
    users.map(user => {
      return (
        <button key={user.id} id={user.id} onClick={(e) => handleClick(e)} className="w-full pr-6">
          <div id={user.id} className={`transition ease-in-out duration-150 grid md:grid-cols-3 lg:grid-cols-12 h-fit mb-2 pl-6 p-2 m-2 rounded-2xl border-2 border-primary animated-shadow hover:scale-[1.03] ${selectedChatroomID == user.id ? `hover:scale-100 translate-x-5 bg-gradient-to-r border-primary from-cyan-100 to-white` : ``}`}>
            <div id={user.id} className="md:col-span-3 lg:col-span-9">
              <p id={user.id} className="text-black text-left font-normal font-sans text-xl">{user.name}</p>
              {user.department && <p id={user.id} className="text-black text-left font-normal font-sans text-md">Odeljenje - {user.department}</p>}
              {!user.department && <p id={user.id} className="text-black text-left font-normal font-sans text-md">JMBG - {user.jmbg}</p>}
            </div>
            <div id={user.id} className="col-span-3 flex justify-center items-center">
              <Link className="transition ease-in-out hover:scale-[1.2] !no-underline bg-primary !text-white p-2 m-2 rounded-xl" route={`../chatroom/${user.id}`}>
                Chatroom
              </Link>
            </div>
          </div>
        </button>
      );
    }));
} 