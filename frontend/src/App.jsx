import { useEffect, useState } from "react";
import Admin from "./Admin.jsx";
import Home from "./Home.jsx";

function getTheme() {
  return localStorage.getItem("hsr-theme") === "light" ? "light" : "dark";
}

export default function App() {
  const [theme, setTheme] = useState(getTheme);
  const isAdmin = window.location.pathname.startsWith("/admin");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("hsr-theme", theme);
  }, [theme]);

  useEffect(() => {
    const onMove = (event) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      document.documentElement.style.setProperty("--mx", x.toFixed(4));
      document.documentElement.style.setProperty("--my", y.toFixed(4));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  if (isAdmin) {
    return <Admin theme={theme} onToggleTheme={toggleTheme} />;
  }

  return <Home theme={theme} onToggleTheme={toggleTheme} />;
}
