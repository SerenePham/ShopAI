import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@contexts/ThemeContext";
import HomeScreen from "@screens/HomeScreen";

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <HomeScreen />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;