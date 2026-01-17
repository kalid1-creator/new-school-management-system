/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#6B46C1", // Purple
                secondary: "#1F2937", // Dark Navy
            }
        },
    },
    plugins: [],
}
