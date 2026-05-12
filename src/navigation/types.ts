import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';

export type RootTabParamList = {
  Timer: undefined;
  Library: undefined;
  Settings: undefined;
};

export type TimerStackParamList = {
  WorkoutHome: undefined;
  ActiveWorkout: undefined;
};

export type LibraryStackParamList = {
  LibraryHome: undefined;
  ExerciseDetail: { exerciseId: string };
  CreateEditExercise: { exerciseId?: string };
  WorkoutPlanDetail: { planId: string };
  CreateEditWorkoutPlan: { planId?: string };
};

export type TimerTabScreenProps<T extends keyof TimerStackParamList> = CompositeScreenProps<
  StackScreenProps<TimerStackParamList, T>,
  BottomTabScreenProps<RootTabParamList>
>;

export type LibraryTabScreenProps<T extends keyof LibraryStackParamList> = CompositeScreenProps<
  StackScreenProps<LibraryStackParamList, T>,
  BottomTabScreenProps<RootTabParamList>
>;
