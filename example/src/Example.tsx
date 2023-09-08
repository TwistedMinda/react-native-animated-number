import { StyleSheet, Text, View } from "react-native"
import { AnimatedNumber } from "./animated-number/animated-number";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";
import { renderRightChar } from "./animated-number/animated-elements";
import { useFont } from "@shopify/react-native-skia";
import Slider from '@react-native-community/slider';

const BODY_FONT = require('../assets/Body.ttf')

export const Example = () => {
  const font = useFont(BODY_FONT, 26)
  const value = useSharedValue(0)

  const onChange = (newValue: number) => {
    value.value = newValue
  }

  const animatedToNumber = useDerivedValue(() => ({
    animated: true,
    number: value.value
  }))

  return font ? (
    <View style={styles.container}>
      <Text style={styles.title}>Pick a number</Text>

      <View style={styles.numberContainer}>
        <AnimatedNumber
          animateToNumber={animatedToNumber}
          enableColorIndicator={true}
          font={font}
          options={{
            ...renderRightChar(
              '€',
              'black'
            ),
            textColor: 'black'
          }}
        />
      </View>

      <Slider
        style={styles.slider}
        onValueChange={onChange}
        step={1.05}
        minimumValue={-10000}
        maximumValue={10000}
        minimumTrackTintColor="#888888"
        maximumTrackTintColor="#222222"
      />
    </View>
  ) : null
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'Body',
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  numberContainer: {
    width: 300,
  },
  slider: {
    alignSelf: 'center',
    width: 300,
    height: 40,
    marginTop: 20
  }
});
