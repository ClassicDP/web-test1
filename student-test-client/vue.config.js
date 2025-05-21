module.exports = {
    devServer: {
        proxy: {
            '^/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                pathRewrite: { '^/api': '' }, // убирает /api в запросе к backend
            },
        },
    },
};