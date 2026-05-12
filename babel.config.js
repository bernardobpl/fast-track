module.exports = function (api) {
  api.cache(true);
  const isTest = process.env.NODE_ENV === 'test';
  return {
    presets: ['babel-preset-expo'],
    // Reanimated v4 plugin requires react-native-worklets which isn't available in Jest
    plugins: isTest ? [] : ['react-native-reanimated/plugin'],
  };
};
