module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      '(jest-)?react-native' +
      '|@react-native(-community)?' +
      '|expo(nent)?' +
      '|@expo(nent)?/.*' +
      '|react-navigation' +
      '|@react-navigation/.*' +
      '|react-native-reanimated' +
      '|react-native-mmkv' +
      '|react-native-screens' +
      '|react-native-safe-area-context' +
      '|react-native-gesture-handler' +
    '))',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
};
