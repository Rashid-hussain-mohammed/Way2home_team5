import React, { useState } from "react";

interface HeartButtonProps {
  onClick: () => void; // Function to handle click actions
  isFavorite: boolean; // Determines the initial state of the heart
}

const HeartButton: React.FC<HeartButtonProps> = ({ onClick, isFavorite }) => {
  const [favorite, setFavorite] = useState(isFavorite);

  const handleToggle = () => {
    setFavorite(!favorite); // Toggle the visual state
    onClick(); // Call the parent handler
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-full hover:bg-gray-100 focus:outline-none"
      aria-label="Toggle Favorite"
    >
      {favorite ? (
        // Filled Heart
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="red"
          viewBox="0 0 24 24"
          className="w-6 h-6"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        // Outlined Heart
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 8.5a5.5 5.5 0 019-4.5 5.5 5.5 0 019 4.5c0 3.5-3 6.5-9 11.5-6-5-9-8-9-11.5z"
          />
        </svg>
      )}
    </button>
  );
};

export default HeartButton;
