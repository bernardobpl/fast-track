import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../shared/theme';

export function LibraryHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Library</Text>
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
    color: Colors.textSecondary,
  },
});
