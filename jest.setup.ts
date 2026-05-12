jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn().mockReturnValue(undefined),
    getBoolean: jest.fn().mockReturnValue(undefined),
    getNumber: jest.fn().mockReturnValue(undefined),
    delete: jest.fn(),
    contains: jest.fn().mockReturnValue(false),
  })),
}));

jest.mock('@notifee/react-native', () => ({
  default: {
    createChannel: jest.fn(),
    displayNotification: jest.fn(),
    cancelAllNotifications: jest.fn(),
  },
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));
