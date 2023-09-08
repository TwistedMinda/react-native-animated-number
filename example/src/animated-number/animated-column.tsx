/* eslint-disable @typescript-eslint/no-var-requires */

import { Group } from '@shopify/react-native-skia'
import { useEffect, useState } from 'react'
import { type SharedValue } from 'react-native-reanimated'

import { type AnimatedColumnElementProps, type AnimatedColumnProps, AnimatedIntegerSeparator, AnimatedSeparator, AnimatedText } from './animated-elements'
import { useComparePrevious, useComparePreviousColor } from './digit-animation.helpers'
import { calculateColumnX, calculateColumnY, FONT_HEIGHT, getBaseY, getColorForColumn, isOffScreen } from './digit-position.helpers'

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

interface AnimatedDigitProps extends AnimatedColumnElementProps {
  color: SharedValue<string>
  digit: number
  visible: boolean
}

const AnimatedDigit = ({
  color,
  column,
  digit,
  font,
  num,
  visible
}: AnimatedDigitProps) => {
  return visible
    ? (
      <AnimatedText
        color={color}
        font={font}
        num={num}
        text={digit.toString()}
        y={getBaseY(num.value) - (digit * (num.value.options.columnSpacing + FONT_HEIGHT))}
      />
    )
    : null
}

const AnimatedColumn = ({
  column,
  enableColor,
  font,
  num,
  sharedValue
}: AnimatedColumnProps) => {
  const [visible, setVisible] = useState(
    !isOffScreen(column, num.value)
  )

  useEffect(() => {
    setVisible(true)
  }, [])

  const opacity = useComparePrevious(
    sharedValue, num,
    res => {
      'worklet'

      return isOffScreen(column, res) ? 0 : 1
    },
    pos => {
      'worklet'

      return pos
    }
  )
  const transformDigits = useComparePrevious(
    sharedValue, num,
    res => {
      'worklet'

      return calculateColumnY(column, res)
    },
    pos => {
      'worklet'

      return [{ translateY: pos }]
    },
    column === 11
  )

  const transformCol = useComparePrevious(
    sharedValue, num,
    res => {
      'worklet'

      return calculateColumnX(column, res)
    },
    pos => {
      'worklet'

      return [{ translateX: pos }]
    }
  )

  const color = useComparePreviousColor(
    sharedValue, num,
    res => {
      'worklet'

      return enableColor.value
        ? getColorForColumn(column, res)
        : res.options.textColor
    }
  )

  const renderColumnDigit = (digit: number) => {
    return (
      <AnimatedDigit
        color={color}
        column={column}
        digit={digit}
        font={font}
        key={`digit-${column}-${digit}`}
        num={num}
        sharedValue={sharedValue}
        visible={visible}
      />
    )
  }

  const len = num.value.fullEntirePart.length
  const isFirstDecimal = column === len
  const prevCol = column - 1
  const separatorNeeded = prevCol < (len - 1) &&
    (len - prevCol - 1) % 3 === 0

  return visible
    ? (
      <Group opacity={opacity} transform={transformCol}>
        <Group transform={transformDigits}>
          {DIGITS.map(renderColumnDigit)}
        </Group>

        {isFirstDecimal &&
          <AnimatedSeparator font={font} num={num} sharedValue={sharedValue} />
        }

        {separatorNeeded &&
          <AnimatedIntegerSeparator column={column} font={font} num={num} sharedValue={sharedValue} />
        }
      </Group>
    )
    : null
}

export default AnimatedColumn
