import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from '@screens/HomeScreen';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <HomeScreen />
    </SafeAreaProvider>
  );
}

export default App;