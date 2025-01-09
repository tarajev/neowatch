import React from 'react'

export default function ColorLine({ values }) {
  const total = values.reduce((sum, value) => sum + value, 0);
  const colors = ['bg-green-700', 'bg-blue-700', 'bg-gray-700'];

  return (
    <div className="flex w-full h-2 rounded overflow-hidden border border-indigo-950">
      {values.map((value, index) => {
        const widthPercentage = (value / total) * 100;
        return (
          <div
            key={index}
            className={`${colors[index % colors.length]}`}
            style={{ width: `${widthPercentage}%` }}
          />
        );
      })}
    </div>
  );
};