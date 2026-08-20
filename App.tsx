import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from '@screens/HomeScreen';
import JsxWelcomeDemo from './src/screens/demos/JsxWelcomeDemo';
import PropsDemo from './src/screens/demos/PropsDemo';
import StateDemo from './src/screens/demos/StateDemo';
import DemoPropsState from './src/screens/demos/DemoPropsState';
import StyleSheetWalkthrough from './src/screens/demos/StyleSheetWalkthrough';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      {/* <HomeScreen /> */}
      {/* <JsxWelcomeDemo /> */}
      {/* <PropsDemo /> */}
      {/* <StateDemo /> */}
      <DemoPropsState />
      {/* <StyleSheetWalkthrough /> */}
    </SafeAreaProvider>
  );
}

export default App;