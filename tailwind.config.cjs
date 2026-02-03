/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx}",
        "./index.html"
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                secondary: "var(--secondary-background)",
                accent: "var(--accent)",
                "accent-foreground": "var(--accent-foreground)",
            },
        },
    },
    plugins: [],
}
