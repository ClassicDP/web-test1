/ * @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './index.html',
        './src/**/*.{vue,js,ts,jsx,tsx}',
    ],
    safelist: [
        'bg-green-50',
        'bg-red-50',
        'border-green-400',
        'border-red-400',
        'text-green-600',
        'text-red-600',
        'text-green-700',
        'font-bold',
        'font-semibold',
        'pl-4',
        'border-l-4',
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}