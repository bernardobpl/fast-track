import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../shared/theme';
import type { TimerTabScreenProps } from '../../navigation/types';

type Props = TimerTabScreenProps<'WorkoutHome'>;

export function WorkoutHomeScreen(_props: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Timer</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.heading,
    color: Colors.primary,
  },
});
