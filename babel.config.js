module.exports = function(api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            ["module-resolver", {
                "alias": {
                    "components": "./src/components",
                    "helper": "./src/helper",
                    "assets": "./assets",
                    "settings": "./src/settings"
                }
            }]
        ]
    };
};
