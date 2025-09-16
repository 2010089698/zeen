import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import SessionScreen from '../screens/SessionScreen';
import PauseScreen from '../screens/PauseScreen';
import SummaryScreen from '../screens/SummaryScreen';

export type RootStackParamList = {
  Home: undefined;
  Session: undefined;
  Pause: undefined;
  Summary: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const defaultOptions = {
  headerStyle: { backgroundColor: '#020617' },
  headerTintColor: '#f8fafc',
  contentStyle: { backgroundColor: '#0f172a' },
};

const AppNavigator = (): JSX.Element => {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={defaultOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: '集中セッション開始' }}
      />
      <Stack.Screen
        name="Session"
        component={SessionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Pause"
        component={PauseScreen}
        options={{ title: 'セッション一時停止' }}
      />
      <Stack.Screen
        name="Summary"
        component={SummaryScreen}
        options={{ title: 'セッション結果' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
