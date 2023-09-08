import { Example } from './src/Example';
import { useFonts } from 'expo-font'

export default function App() {
  const [fontsLoaded] = useFonts({
    'Body': require('./assets/Body.ttf'),
  });

  return fontsLoaded ? (
    <Example />
  ) : null;
}