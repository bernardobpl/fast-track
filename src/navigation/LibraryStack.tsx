import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LibraryHomeScreen } from '../features/exercises/LibraryHomeScreen';
import type { LibraryStackParamList } from './types';

const Stack = createStackNavigator<LibraryStackParamList>();

export function LibraryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LibraryHome" component={LibraryHomeScreen} />
    </Stack.Navigator>
  );
}
