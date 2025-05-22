module.exports = {
    content: [
        './index.html',
        './src/**/*.{vue,js,ts,jsx,tsx}',
    ],
    safelist: [
        'bg-green-50',
        'bg-red-50',
        'border-l-4',
        'border-green-400',
        'border-red-400',
        'pl-4',
        'text-green-600',
        'text-red-600',
        'text-green-700',
        'font-bold',
        'font-semibold',
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}