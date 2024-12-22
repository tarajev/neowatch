import React, { useState } from 'react'
import { GetMonthName } from './BasicComponents';

export default function CalendarMonth({ setJSDate, setDate, offset = 0, children }) { 
  return (
    <div className='pt-2 h-fit border-y-2 border-primary rounded-lg bg-secondary grid col-span-1 shadow-md'>
      <div className='flex flex-wrap justify-center w-full h-fit bg-gray-200'>
        <p>{GetMonthName(new Date().getMonth() + offset)} {new Date().getFullYear()}.</p>
      </div>
      <ul className='p-2 m-2 grid grid-cols-7 gap-0.5 justify-center text-center h-fit border border-primary rounded-md bg-gray-50'>
        <li key={'Pon'} className='shadow-sm'>Pon</li>
        <li key={'Uto'} className='shadow-sm'>Uto</li>
        <li key={'Sre'} className='shadow-sm'>Sre</li>
        <li key={'Cet'} className='shadow-sm'>Čet</li>
        <li key={'Pet'} className='shadow-sm'>Pet</li>
        <li key={'Sub'} className='shadow-sm'>Sub</li>
        <li key={'Ned'} className='shadow-sm'>Ned</li>
        <ListDays setJSDate={setJSDate} setDate={setDate} offset={offset} />
      </ul>
      {children}
    </div>
  );
}

function ListDays({ setJSDate, setDate, offset = 0 }) {
  const [selectedDay, setSelectedDay] = useState(null);

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const month = currentMonth + offset;
  const currentDay = currentDate.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Korekcija da prvi dan krene od Ponedeljka, gde je 0 index ponedeljka
  const adjustedFirstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const handleClick = (day) => {
    {
      setSelectedDay(selected => selected === day ? null : day);
      if (setJSDate)
        setJSDate(new Date(year, month, day));
      if (setDate)
        setDate({day: new Date().getDate(), month: new Date().getMonth(), year: new Date().getFullYear()});
    }
  };

  const daysArray = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const emptyCells = Array.from({ length: adjustedFirstDayOfMonth }, (_, index) => index);

  return (
    <>
      {emptyCells.map((index) => (
        <li key={'empty_' + index}></li>
      ))}

      {daysArray.map((day) => (
        <button
          key={`${day}_${month}`}
          disabled={day < currentDay && !offset}
          onClick={() => handleClick(day)}
          className={`py-1 ${selectedDay == day ? "ring-2 ring-primary" : ""} flex color-button-list items-center justify-center shadow-md ${month === currentMonth && day === currentDay ? 'ring-1 ring-orange-600' : ''}`}
        >
          <p>{day}</p>
        </button>
      ))}
    </>
  );
}