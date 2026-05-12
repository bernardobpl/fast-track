# Fast Track — Epic 1: Project Setup

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize the Fast Track React Native (Expo Bare) project with TypeScript, install all dependencies, configure tooling, create a navigable app shell with placeholder screens, and set up the GitHub repository with milestones and issues for all 10 epics.

**Architecture:** Expo Bare workflow gives full native module access (required for lock screen Live Activities in Epic 7) while retaining EAS Build tooling. The app shell establishes the bottom-tab navigation structure that all subsequent epics build on. GitHub is configured with 10 milestones and initial issues for Epic 1.

**Tech Stack:** React Native (Expo Bare), TypeScript, React Navigation v6, Zustand, MMKV, SQLite, Reanimated 3, Jest, React Native Testing Library, GitHub CLI (`gh`)

---

## Prerequisites

Verify before starting:

```bash
node --version          # 18+
npx expo --version      # any recent version
eas --version           # any recent version (npm i -g eas-cli if missing)
gh --version            # GitHub CLI
gh auth status          # must show "Logged in to github.com"
```

Install any missing tools before proceeding. The git repo is already initialized at `/Users/blopes/dev/fast-track` with the design spec committed.

---

## File Structure After This Epic

```
fast-track/
├── App.tsx                                  -- Root component, renders navigator
├── app.json                                 -- Expo config (name, slug, iOS/Android ids)
├── babel.config.js                          -- Babel with Reanimated plugin last
├── tsconfig.json                            -- Strict TypeScript + path alias @/*
├── .eslintrc.js
├── .prettierrc
├── .gitignore
├── eas.json                                 -- EAS build profiles
├── jest.config.js
├── jest.setup.ts                            -- Mocks for MMKV, Reanimated
├── package.json
├── src/
│   ├── navigation/
│   │   ├── RootNavigator.tsx               -- Bottom tab navigator
│   │   ├── TimerStack.tsx                  -- Stack for Timer tab
│   │   ├── LibraryStack.tsx                -- Stack for Library tab
│   │   └── types.ts                        -- Typed nav param lists
│   ├── features/
│   │   ├── timer/
│   │   │   └── WorkoutHomeScreen.tsx       -- Placeholder
│   │   ├── exercises/
│   │   │   └── LibraryHomeScreen.tsx       -- Placeholder
│   │   └── settings/
│   │       └── SettingsScreen.tsx          -- Placeholder
│   └── shared/
│       └── theme.ts                        -- Colors, Spacing, Typography constants
└── __tests__/
    └── App.test.tsx                        -- Smoke test: app renders without crashing
```

---

## Task 1: Scaffold Expo Bare Project

**Files:**
- Create: `App.tsx`, `app.json`, `package.json`, `babel.config.js`, `index.js`

- [ ] **Step 1: Run create-expo-app in the existing directory**

```bash
cd /Users/blopes/dev/fast-track
npx create-expo-app@latest . --template bare-minimum
```

When asked about existing files, confirm overwrite. The `docs/` directory will not be touched.

Expected output ends with: `Your project is ready!`

- [ ] **Step 2: Verify the project structure was created**

```bash
ls package.json app.json App.js 2>/dev/null || ls package.json app.json App.tsx
```

Expected: files exist. If `App.js` exists (not `.tsx`), continue to next step.

- [ ] **Step 3: Rename App.js to App.tsx if needed**

```bash
[ -f App.js ] && mv App.js App.tsx
```

- [ ] **Step 4: Install TypeScript and base type definitions**

```bash
npm install --save-dev typescript @types/react @types/react-native
```

- [ ] **Step 5: Create tsconfig.json**

Create `tsconfig.json`:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.d.ts", "expo-env.d.ts"]
}
```

- [ ] **Step 6: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: no errors. If template files have type errors, fix them by adding explicit `: React.FC` or `: JSX.Element` return types as needed.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: initialize Expo bare project with TypeScript"
```

---

## Task 2: Install All Core Dependencies

**Files:**
- Modify: `package.json`, `babel.config.js`

- [ ] **Step 1: Install React Navigation core**

```bash
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler
```

- [ ] **Step 2: Install state management and storage**

```bash
npm install zustand react-native-mmkv
npx expo install expo-sqlite
```

- [ ] **Step 3: Install animations**

```bash
npm install react-native-reanimated
```

- [ ] **Step 4: Install camera, media, alerts**

```bash
npx expo install expo-camera expo-image-picker expo-haptics expo-av
```

- [ ] **Step 5: Install lock screen packages**

```bash
npm install @notifee/react-native
npm install react-native-live-activities
```

Note: Native configuration for these packages happens in Epic 7. Installing now ensures they are in package.json and linked.

- [ ] **Step 6: Update babel.config.js — Reanimated plugin must be last**

Replace `babel.config.js` with:
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
```

- [ ] **Step 7: Install iOS native dependencies**

```bash
cd ios && pod install && cd ..
```

Expected: CocoaPods resolves and installs all native modules. Takes 2–5 minutes.

- [ ] **Step 8: Verify Android links (autolinking)**

```bash
npx react-native config 2>/dev/null | grep -i "notifee\|reanimated\|mmkv" | head -10
```

Expected: packages appear in the autolinking output.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: install all core dependencies"
```

---

## Task 3: Configure ESLint and Prettier

**Files:**
- Create: `.eslintrc.js`, `.prettierrc`, `.eslintignore`
- Modify: `package.json`

- [ ] **Step 1: Install dev dependencies**

```bash
npm install --save-dev \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-react-native \
  prettier \
  eslint-config-prettier \
  eslint-plugin-prettier
```

- [ ] **Step 2: Create .eslintrc.js**

Create `.eslintrc.js`:
```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-native', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  rules: {
    'prettier/prettier': 'error',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  settings: {
    react: { version: 'detect' },
  },
};
```

- [ ] **Step 3: Create .prettierrc**

Create `.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

- [ ] **Step 4: Create .eslintignore**

Create `.eslintignore`:
```
node_modules/
.expo/
android/
ios/
coverage/
```

- [ ] **Step 5: Add scripts to package.json**

Edit `package.json` — add these entries inside `"scripts"`:
```json
"lint": "eslint 'src/**/*.{ts,tsx}' 'App.tsx' --fix",
"type-check": "tsc --noEmit"
```

- [ ] **Step 6: Run lint to verify**

```bash
npm run lint
```

Expected: exits 0 (no errors). Auto-fixes applied in place.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: configure ESLint and Prettier"
```

---

## Task 4: Create Theme and Placeholder Screens

**Files:**
- Create: `src/shared/theme.ts`
- Create: `src/navigation/types.ts`
- Create: `src/features/timer/WorkoutHomeScreen.tsx`
- Create: `src/features/exercises/LibraryHomeScreen.tsx`
- Create: `src/features/settings/SettingsScreen.tsx`

- [ ] **Step 1: Create directory structure and update .gitignore**

```bash
mkdir -p src/shared src/navigation src/features/timer src/features/exercises src/features/settings src/features/workout src/features/plans src/features/lockscreen src/db src/store
```

Add `.superpowers/` to `.gitignore` (visual companion files should not be committed):
```bash
echo ".superpowers/" >> .gitignore
```

- [ ] **Step 2: Create theme.ts**

Create `src/shared/theme.ts`:
```typescript
export const Colors = {
  background: '#0d0d0d',
  surface: '#111111',
  surfaceElevated: '#1a1a1a',
  border: '#222222',
  primary: '#00ff88',
  primaryMuted: 'rgba(0, 255, 136, 0.15)',
  danger: '#ff4444',
  dangerMuted: 'rgba(255, 68, 68, 0.15)',
  textPrimary: '#ffffff',
  textSecondary: '#aaaaaa',
  textMuted: '#666666',
  tabBarInactive: '#444444',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const Typography = {
  timerLarge: {
    fontSize: 56,
    fontWeight: '900' as const,
    fontVariant: ['tabular-nums'] as const,
    letterSpacing: -2,
  },
  timerLabel: {
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '600' as const,
  },
  heading: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 14 },
  caption: { fontSize: 11, letterSpacing: 1 },
} as const;
```

- [ ] **Step 3: Create navigation types**

Create `src/navigation/types.ts`:
```typescript
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
```

- [ ] **Step 4: Create WorkoutHomeScreen placeholder**

Create `src/features/timer/WorkoutHomeScreen.tsx`:
```typescript
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
```

- [ ] **Step 5: Create LibraryHomeScreen placeholder**

Create `src/features/exercises/LibraryHomeScreen.tsx`:
```typescript
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
```

- [ ] **Step 6: Create SettingsScreen placeholder**

Create `src/features/settings/SettingsScreen.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../shared/theme';

export function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Settings</Text>
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
```

- [ ] **Step 7: Run type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add theme constants and placeholder screens"
```

---

## Task 5: Build Root Navigation Shell

**Files:**
- Create: `src/navigation/TimerStack.tsx`
- Create: `src/navigation/LibraryStack.tsx`
- Create: `src/navigation/RootNavigator.tsx`
- Modify: `App.tsx`

- [ ] **Step 1: Create TimerStack**

Create `src/navigation/TimerStack.tsx`:
```typescript
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
```

- [ ] **Step 2: Create LibraryStack**

Create `src/navigation/LibraryStack.tsx`:
```typescript
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
```

- [ ] **Step 3: Create RootNavigator**

Create `src/navigation/RootNavigator.tsx`:
```typescript
import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from '../shared/theme';
import { TimerStack } from './TimerStack';
import { LibraryStack } from './LibraryStack';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return <Text style={{ color, fontSize: 18 }}>{icon}</Text>;
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.tabBarInactive,
        }}
      >
        <Tab.Screen
          name="Timer"
          component={TimerStack}
          options={{
            tabBarLabel: 'Timer',
            tabBarIcon: ({ color }) => <TabIcon icon="⏱" color={color} />,
          }}
        />
        <Tab.Screen
          name="Library"
          component={LibraryStack}
          options={{
            tabBarLabel: 'Library',
            tabBarIcon: ({ color }) => <TabIcon icon="💪" color={color} />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color }) => <TabIcon icon="⚙️" color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

- [ ] **Step 4: Update App.tsx**

Replace the entire contents of `App.tsx`:
```typescript
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#0d0d0d" />
      <RootNavigator />
    </>
  );
}
```

- [ ] **Step 5: Run type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 6: Launch on iOS simulator**

```bash
npx expo run:ios
```

Expected: simulator opens, app shows black screen with "Timer" in green text, bottom tabs visible (Timer ⏱ · Library 💪 · Settings ⚙️). Tapping each tab switches the screen.

- [ ] **Step 7: Launch on Android emulator (if available)**

```bash
npx expo run:android
```

Expected: same as iOS — black background, green Timer text, working bottom tabs.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add root navigation shell with bottom tabs"
```

---

## Task 6: Configure Jest and Write Smoke Test

**Files:**
- Create: `jest.config.js`, `jest.setup.ts`, `__tests__/App.test.tsx`
- Modify: `package.json`

- [ ] **Step 1: Install test dependencies**

```bash
npm install --save-dev \
  jest \
  jest-expo \
  @testing-library/react-native \
  @testing-library/jest-native \
  @types/jest
```

- [ ] **Step 2: Create jest.config.js**

Create `jest.config.js`:
```javascript
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
```

- [ ] **Step 3: Create jest.setup.ts**

Create `jest.setup.ts`:
```typescript
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
```

- [ ] **Step 4: Add test scripts to package.json**

Edit `package.json` — add to `"scripts"`:
```json
"test": "jest --watchAll=false",
"test:coverage": "jest --coverage --watchAll=false"
```

- [ ] **Step 5: Write smoke test**

Create `__tests__/App.test.tsx`:
```typescript
import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    NavigationContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  };
});

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Screen: ({ component: Comp }: { component: React.ComponentType<any> }) => <Comp />,
  }),
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Screen: ({ component: Comp }: { component: React.ComponentType<any> }) => <Comp />,
  }),
}));

import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toBeTruthy();
  });
});
```

- [ ] **Step 6: Run test — verify it passes**

```bash
npm test
```

Expected output:
```
PASS  __tests__/App.test.tsx
  App
    ✓ renders without crashing

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: configure Jest and add app smoke test"
```

---

## Task 7: Create GitHub Repository and Project Structure

**Files:** None (GitHub configuration via CLI)

- [ ] **Step 1: Create the GitHub repo from the local directory**

```bash
cd /Users/blopes/dev/fast-track
gh repo create fast-track \
  --public \
  --description "Fast Track — Gym workout timer for iOS and Android" \
  --source . \
  --remote origin \
  --push
```

Expected: repo created at `https://github.com/<your-username>/fast-track`, commits pushed.

- [ ] **Step 2: Enable branch protection on main**

```bash
OWNER=$(gh api user --jq '.login')
gh api \
  --method PUT \
  "repos/$OWNER/fast-track/branches/main/protection" \
  --field "required_status_checks=null" \
  --field "enforce_admins=false" \
  --field "restrictions=null" \
  --field 'required_pull_request_reviews={"required_approving_review_count":0,"dismiss_stale_reviews":false}'
```

Expected: 200 response.

- [ ] **Step 3: Create issue labels**

```bash
gh label create "epic"        --color "0075ca" --description "Epic milestone issue"          --repo fast-track 2>/dev/null || true
gh label create "task"        --color "e4e669" --description "Implementation task"           --repo fast-track 2>/dev/null || true
gh label create "enhancement" --color "a2eeef" --description "Enhancement"                  --repo fast-track 2>/dev/null || true
gh label create "ios"         --color "c0deed" --description "iOS-specific"                 --repo fast-track 2>/dev/null || true
gh label create "android"     --color "bfd4f2" --description "Android-specific"             --repo fast-track 2>/dev/null || true
```

- [ ] **Step 4: Create all 10 milestones**

```bash
OWNER=$(gh api user --jq '.login')
REPO="$OWNER/fast-track"

gh api repos/$REPO/milestones --method POST --field title="Epic 1: Project Setup"         --field description="Expo bare init, repo, CI, folder structure, linting"
gh api repos/$REPO/milestones --method POST --field title="Epic 2: Data Layer"            --field description="SQLite schema, migrations, MMKV, repository pattern"
gh api repos/$REPO/milestones --method POST --field title="Epic 3: Exercise Library"      --field description="CRUD exercises, image pick/camera"
gh api repos/$REPO/milestones --method POST --field title="Epic 4: Workout Plans"         --field description="CRUD plans, add/reorder/remove exercises in plan"
gh api repos/$REPO/milestones --method POST --field title="Epic 5: Timer Engine"          --field description="Core logic, state machine, background persistence"
gh api repos/$REPO/milestones --method POST --field title="Epic 6: Active Workout Screen" --field description="Full compact-split UI, all controls, set logging"
gh api repos/$REPO/milestones --method POST --field title="Epic 7: Lock Screen"           --field description="iOS Live Activity + Android foreground notification"
gh api repos/$REPO/milestones --method POST --field title="Epic 8: Settings"              --field description="All preferences, data toggle, storage usage display"
gh api repos/$REPO/milestones --method POST --field title="Epic 9: Workout Session Flow"  --field description="Home entry points, session lifecycle, end-of-session summary"
gh api repos/$REPO/milestones --method POST --field title="Epic 10: Polish & Store Prep"  --field description="App icon, splash, onboarding, EAS build, store assets"
```

Expected: 10 JSON responses, each with `"number": 1` through `"number": 10`.

- [ ] **Step 5: Create Epic 1 issues**

```bash
gh issue create --title "Task: Initialize Expo bare project with TypeScript" \
  --body "Scaffold Expo bare project in existing fast-track/ dir, configure tsconfig with strict mode and @/* path alias." \
  --label "task" --milestone "Epic 1: Project Setup"

gh issue create --title "Task: Install all core dependencies" \
  --body "React Navigation, Zustand, MMKV, Reanimated 3, expo-sqlite, expo-camera, expo-image-picker, expo-haptics, expo-av, @notifee/react-native, react-native-live-activities." \
  --label "task" --milestone "Epic 1: Project Setup"

gh issue create --title "Task: Configure ESLint and Prettier" \
  --body "TypeScript ESLint, Prettier integration, lint and type-check scripts in package.json." \
  --label "task" --milestone "Epic 1: Project Setup"

gh issue create --title "Task: Create theme constants and placeholder screens" \
  --body "Colors, Spacing, Typography constants in theme.ts. Placeholder WorkoutHomeScreen, LibraryHomeScreen, SettingsScreen." \
  --label "task" --milestone "Epic 1: Project Setup"

gh issue create --title "Task: Build root navigation shell" \
  --body "Bottom tabs: Timer / Library / Settings. TimerStack and LibraryStack navigators. App renders on iOS and Android simulators." \
  --label "task" --milestone "Epic 1: Project Setup"

gh issue create --title "Task: Configure Jest and smoke test" \
  --body "jest-expo preset, MMKV and Reanimated mocks, smoke test that app renders without crashing." \
  --label "task" --milestone "Epic 1: Project Setup"

gh issue create --title "Task: Set up GitHub repo, milestones, and EAS" \
  --body "Create repo, branch protection, 10 milestones, labels, Epic 1 issues. Configure eas.json." \
  --label "task" --milestone "Epic 1: Project Setup"
```

- [ ] **Step 6: Verify**

```bash
gh issue list --milestone "Epic 1: Project Setup"
```

Expected: 7 issues listed.

---

## Task 8: Configure EAS Build

**Files:**
- Create: `eas.json`

- [ ] **Step 1: Log into EAS**

```bash
eas login
```

Enter your Expo account credentials when prompted.

- [ ] **Step 2: Initialize EAS project**

```bash
eas build:configure
```

Select "All" when asked about platforms. This creates `eas.json` and updates `app.json` with an `extra.eas.projectId`.

- [ ] **Step 3: Replace eas.json with full profile config**

Replace `eas.json`:
```json
{
  "cli": {
    "version": ">= 7.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

- [ ] **Step 4: Commit and push**

```bash
git add -A
git commit -m "chore: configure EAS Build profiles"
git push origin main
```

---

## Definition of Done — Epic 1

All of these must pass before starting Epic 2:

- [ ] `npx expo run:ios` — app launches, black background, "Timer" in green, 3 bottom tabs work
- [ ] `npx expo run:android` — same as above
- [ ] `npm run type-check` — zero errors
- [ ] `npm run lint` — zero errors
- [ ] `npm test` — 1 test, passing
- [ ] `gh issue list --milestone "Epic 1: Project Setup"` — 7 issues visible
- [ ] `gh api repos/$(gh api user --jq '.login')/fast-track/milestones --jq '.[].title'` — 10 milestones listed
- [ ] `eas.json` committed with development / preview / production profiles

---

## Next Epic

Epic 2 plan will be written before starting implementation: `docs/superpowers/plans/2026-05-12-epic-2-data-layer.md`

It covers: SQLite database setup, schema creation and migrations, repository pattern for Exercise / WorkoutPlan / Session / SetLog, and MMKV preferences store with Zustand.
