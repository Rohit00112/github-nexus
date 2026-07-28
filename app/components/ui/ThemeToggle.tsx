"use client";

import { useTheme } from "../../context/ThemeContext";
import { Button } from "@nextui-org/react";
import { FC, useState } from "react";

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const [rotation, setRotation] = useState(0);

  const handleToggle = () => {
    setRotation(prev => prev + 180);
    toggleTheme();
  };

  return (
    <Button
      isIconOnly
      variant="light"
      aria-label="Toggle theme"
      onClick={handleToggle}
      className={`${className} text-muted-foreground hover:text-foreground`}
    >
      <div style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.3s ease' }}>
        {theme === "light" ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="w-4 h-4"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="w-4 h-4"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            />
          </svg>
        )}
      </div>
    </Button>
  );
};

export default ThemeToggle;
