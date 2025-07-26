// ThemeToggle.js
import { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi'; // Sun and Moon icons

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded text-xl transition-colors duration-300 bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
      aria-label="Toggle Theme"
    >
      {darkMode ? <FiSun /> : <FiMoon />}
    </button>
  );
}
