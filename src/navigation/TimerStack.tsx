import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { WorkoutHomeScreen } from '../features/timer/WorkoutHomeScreen';
import type { TimerStackParamList } from './types';

const Stack = createStackNavigator<TimerStackParamList>();

export function TimerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WorkoutHome" component={WorkoutHomeScreen} />
    </Stack.Navigator>
  );
}
