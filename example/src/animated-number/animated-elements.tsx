import { Group, Rect, Text } from '@shopify/react-native-skia'
import { type SharedValue } from 'react-native-reanimated'

import { getDigitWidth } from './animated-digit'
import { useComparePrevious } from './digit-animation.helpers'
import { type AnimatedNumberFont, baseShift, calculateMinusX, FONT_HEIGHT, getBaseY, getTotalY, isOffScreen, type MyNumber, NATIVE_PADDING } from './digit-position.helpers'
import { colors } from '../colors'

export interface AnimatedElementProps {
  font?: AnimatedNumberFont
  num: SharedValue<MyNumber>
  sharedValue: SharedValue<number>
}
export interface AnimatedColumnElementProps extends AnimatedElementProps {
  column: number
}
export interface AnimatedColumnProps extends AnimatedColumnElementProps {
  enableColor: SharedValue<boolean>
}

interface AnimatedTextProps {
  color?: string | SharedValue<string>
  font?: AnimatedNumberFont
  num?: SharedValue<MyNumber>
  opacity?: number | SharedValue<number>
  size?: number
  text: string
  x?: number | SharedValue<number>
  y?: number | SharedValue<number>
}
export const AnimatedText = ({
  color,
  font,
  num,
  opacity,
  size = FONT_HEIGHT,
  text,
  x = 0,
  y
}: AnimatedTextProps) => {

  return !font
    ? null
    : (
      <Text
        color={color ?? colors.black}
        font={font}
        opacity={opacity}
        text={text}
        x={x}
        y={y ?? (num ? getBaseY(num.value) : 0)}
      />
    )
}

export const renderLeftChar = (
  text: string,
  color: string,
  size = FONT_HEIGHT - NATIVE_PADDING,
  y = 33
) => {
  return {
    leftComponentSize: 27,
    renderLeft: (num: SharedValue<MyNumber>, font?: AnimatedNumberFont) => (
      <AnimatedText
        color={color}
        font={font}
        num={num}
        size={size}
        text={text}
        y={y}
      />
    )
  }
}

export const renderRightChar = (
  text: string,
  color: string,
  size = FONT_HEIGHT - NATIVE_PADDING,
  y = 33
) => {
  return {
    renderRight: (num: SharedValue<MyNumber>, font?: AnimatedNumberFont): JSX.Element => (
      <AnimatedText
        color={color}
        font={font}
        num={num}
        size={size}
        text={text}
        x={4}
        y={y}
      />
    ),
    rightComponentSize: 27
  }
}

export const AnimatedPrefix = ({ font, num }: AnimatedElementProps) => {
  return num.value.options.leftComponentSize &&
    typeof num.value.options.renderLeft === 'function'
    ? (
      <>
        <Rect
          color={num.value.options.leftComponentBackgroundColor}
          height={getTotalY(num.value)}
          width={num.value.options.leftComponentSize}
          x={0}
          y={0}
        />
        {num.value.options.renderLeft(num, font)}
      </>
    )
    : null
}

export const AnimatedMinus = ({ font, num, sharedValue }: AnimatedElementProps) => {
  const signWidth = getDigitWidth(num.value.options.minusSign)

  const opacity = useComparePrevious(
    sharedValue, num,
    res => {
      'worklet'

      return res.value < 0 ? 1 : 0
    },
    pos => {
      'worklet'

      return pos
    }
  )

  const transform = useComparePrevious(
    sharedValue, num,
    res => {
      'worklet'

      return res.value < 0 ? 0 : -signWidth
    },
    pos => {
      'worklet'

      return [{ translateX: pos }]
    }
  )

  return (
    <Group transform={transform}>
      <AnimatedText
        color={num.value.options.textColor}
        font={font}
        num={num}
        opacity={opacity}
        text={num.value.options.minusSign}
        x={calculateMinusX(num.value)}
      />
    </Group>
  )
}

export const AnimatedSuffix = ({ font, num, sharedValue }: AnimatedElementProps) => {
  const transform = useComparePrevious(
    sharedValue, num,
    res => {
      'worklet'

      return res.totalSize - baseShift(res)
    },
    pos => {
      'worklet'

      return [{ translateX: pos }]
    }
  )

  return num.value.options.rightComponentSize &&
    typeof num.value.options.renderRight === 'function'
    ? (
      <Group transform={transform}>
        {num.value.options.renderRight(num, font)}
      </Group>
    )
    : null
}

export const AnimatedSeparator = ({ font, num }: AnimatedElementProps) => {
  const sep = num.value.options.decimalSeparator

  return (
    <AnimatedText
      color={num.value.options.textColor}
      font={font}
      num={num}
      text={sep}
      x={-getDigitWidth(sep)}
    />
  )
}

export const AnimatedIntegerSeparator = ({
  column,
  font,
  num,
  sharedValue
}: AnimatedColumnElementProps) => {
  const sep = num.value.options.integerSeparator

  const opacity = useComparePrevious(
    sharedValue, num,
    res => {
      'worklet'

      return isOffScreen(column - 1, res) ? 0 : 1
    },
    pos => {
      'worklet'

      return pos
    }
  )

  return sep
    ? (
      <AnimatedText
        color={num.value.options.textColor}
        font={font}
        num={num}
        opacity={opacity}
        text={sep}
        x={-getDigitWidth(sep)}
      />
    )
    : null
}
