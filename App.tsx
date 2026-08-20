import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from '@screens/HomeScreen';
import JsxWelcomeDemo from './src/screens/demos/JsxWelcomeDemo';
import PropsDemo from './src/screens/demos/PropsDemo';
import StateDemo from './src/screens/demos/StateDemo';
import DemoPropsState from './src/screens/demos/DemoPropsState';
import StyleSheetWalkthrough from './src/screens/demos/StyleSheetWalkthrough';
import FetchDemo from './src/screens/demos/FetchDemo';
import ActivityIndicator from './src/screens/demos/ActivityIndicator';
import Modal from './src/screens/demos/Modal';
import SwitchDemo from './src/screens/demos/Switch';
import Alert from './src/screens/demos/Alert';
import SafeAreaView from './src/screens/demos/SafeAreaView';
import SectionListDemo from './src/screens/demos/SectionList';
import FlatListDemo from './src/screens/demos/FlatList';
import TouchableOpacityDemo from './src/screens/demos/TouchableOpacity';
import ScrollViewDemo from './src/screens/demos/ScrollView';
import ViewDemo from './src/screens/demos/ViewDemo';
import TextViewDemo from './src/screens/demos/TextView';
import ImageView from './src/screens/demos/ImageView';
import TextInput from './src/screens/demos/TextInput';
import Skeleton from './src/screens/demos/Skeleton';
import RootNavigator from '@navigation/RootNavigator';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      {/* <HomeScreen /> */}
      {/* <JsxWelcomeDemo /> */}
      {/* <PropsDemo /> */}
      {/* <StateDemo /> */}
      {/* <DemoPropsState /> */}
      {/* <StyleSheetWalkthrough /> */}
      {/* <FetchDemo /> */}
      {/* <ActivityIndicator /> */}
      {/* <Modal /> */}
      {/* <SwitchDemo /> */}
      {/* <Alert /> */}
      {/* <SafeAreaView /> */}
      {/* <SectionListDemo /> */}
      {/* <FlatListDemo /> */}
      {/* <TouchableOpacityDemo /> */}
      {/* <ScrollViewDemo /> */}
      {/* <ViewDemo /> */}
      {/* <TextViewDemo /> */}
      {/* <ImageView /> */}
      {/* <TextInput /> */}
      {/* <Skeleton /> */}
      <RootNavigator />


    </SafeAreaProvider>
  );
}

export default App;