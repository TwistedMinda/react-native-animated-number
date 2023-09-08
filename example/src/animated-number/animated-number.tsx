import { Canvas } from '@shopify/react-native-skia'
import { type SharedValue, useSharedValue } from 'react-native-reanimated'

import AnimatedColumn from './animated-column'
import { AnimatedMinus, AnimatedPrefix, AnimatedSuffix } from './animated-elements'
import { type AnimatedNumberInput, useAnimatedNumber } from './digit-animation.helpers'
import { type AnimatedNumberFont, type AnimatedNumberOptions, getTotalY } from './digit-position.helpers'

type WrappedValue = unknown | SharedValue<unknown>
const useValueWrapper = (value: WrappedValue, wrap: boolean) => {
  const wrapper = useSharedValue(wrap ? value : undefined)

  /*
  useEffect(() => {
    if (wrap) {
      wrapper.value = value
    }
  }, [value, wrap])
  */

  return wrap ? wrapper : value
}

export interface AnimatedNumberProps {
  animateToNumber: SharedValue<AnimatedNumberInput>
  enableColorIndicator?: SharedValue<boolean> | boolean
  font?: AnimatedNumberFont
  options?: Partial<AnimatedNumberOptions>
}

export const AnimatedNumber = ({
  animateToNumber,
  enableColorIndicator = false,
  font,
  options
}: AnimatedNumberProps) => {
  const wrappedEnableColorIndicator = useValueWrapper(
    enableColorIndicator,
    typeof enableColorIndicator === 'boolean'
  ) as SharedValue<boolean>

  const {
    num, sharedValue
  } = useAnimatedNumber(
    animateToNumber,
    options
  )

  const renderEntirePart = () => (
    <>
      {num.value.fullEntirePart.map((item, index) => (
        <AnimatedColumn
          column={index}
          enableColor={wrappedEnableColorIndicator}
          font={font}
          key={`entire-${index}`}
          num={num}
          sharedValue={sharedValue}
        />
      ))}
    </>
  )

  const renderDecimalPart = () => (
    <>
      {num.value.decimalPart.map((item, index) => (
        <AnimatedColumn
          column={num.value.fullEntirePart.length + index}
          enableColor={wrappedEnableColorIndicator}
          font={font}
          key={`decimal-${index}`}
          num={num}
          sharedValue={sharedValue}
        />
      ))}
    </>
  )

  return (
    <Canvas style={{
      height: getTotalY(num.value)
    }}
    >
      {renderEntirePart()}

      {num.value.decimalPart.length > 0 && (
        renderDecimalPart()
      )}

      {num.value.options.renderRight &&
        <AnimatedSuffix font={font} num={num} sharedValue={sharedValue} />
      }

      <AnimatedMinus font={font} num={num} sharedValue={sharedValue} />

      {num.value.options.renderLeft &&
        <AnimatedPrefix font={font} num={num} sharedValue={sharedValue} />
      }
    </Canvas>
  )
}
