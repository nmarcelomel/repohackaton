import type { Config } from "tailwindcss";

const config: Config = {
 darkMode: "class",
 content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
 theme: {
 extend: {
 colors: {
 bolivar: {
 green: "#00A651",
 "green-dark": "#008C44",
 yellow: "#FFC107",
 "yellow-dark": "#E5AC00",
 white: "#FFFFFF",
 "gray-bg": "#F5F5F5",
 "gray-text": "#333333",
 "gray-light": "#E0E0E0",
 "gray-muted": "#9E9E9E",
 },
 },
 fontFamily: {
 sans: ["Inter", "system-ui", "sans-serif"],
 },
 },
 },
 plugins: [],
};

export default config;
