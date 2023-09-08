import { type SkFont } from '@shopify/react-native-skia'
import { type SharedValue } from 'react-native-reanimated'

import { getDigitWidth, paddingForChar } from './animated-digit'

export type AnimatedNumberFont = SkFont | null

export interface AnimatedNumberOptions {
  animated: boolean
  animationDuration: number
  columnSpacing: number
  decimalSeparator: string
  decreaseColor: string
  font?: AnimatedNumberFont
  fontSize?: number
  increaseColor: string
  integerSeparator?: string
  leftComponentBackgroundColor: string
  leftComponentSize: number
  maxNbIntegers: number
  minNbIntegers: number
  minusSign: string
  nbDecimals: number
  renderLeft?: (num: SharedValue<MyNumber>, font?: AnimatedNumberFont) => JSX.Element | null
  renderRight?: (num: SharedValue<MyNumber>, font?: AnimatedNumberFont) => JSX.Element | null
  rightComponentSize: number
  textColor: string
}

export interface MyNumber {
  columnsX: Record<number, number>
  decimalPart: string[]
  entirePart: number
  fullEntirePart: string[]
  offShiftSize: number
  options: AnimatedNumberOptions
  prev?: MyNumber
  prevDiffIndex?: number
  totalSize: number
  value: number
}

export const FONT_HEIGHT = 26
export const NATIVE_PADDING = 2

export const getBaseY = (num: MyNumber) =>
  FONT_HEIGHT - NATIVE_PADDING + num.options.columnSpacing

export const getTotalY = (num: MyNumber) =>
  FONT_HEIGHT - NATIVE_PADDING + num.options.columnSpacing * 2

export const offShift = (num: MyNumber) => {
  'worklet'

  return num.fullEntirePart.length - num.entirePart
}

export const isOffScreen = (column: number, num: MyNumber) => {
  'worklet'

  return column < offShift(num)
}

export const baseShift = (num: MyNumber) => {
  'worklet'

  return (
    num.offShiftSize -
    num.options.leftComponentSize
  )
}

export const calculateVisibleSize = (num: MyNumber) => {
  'worklet'

  return num.totalSize -
    baseShift(num) +
    (num.value < 0 ? getDigitWidth(num.options.minusSign) : 0)
}

export const calculateMinusX = (
  num: MyNumber
) => {
  'worklet'

  return num.options.leftComponentSize
}

export const getCharForColumn = (column: number, num: MyNumber) => {
  'worklet'
  const shift = num.fullEntirePart.length

  return column >= shift
    ? num.decimalPart[column - shift]
    : num.fullEntirePart[column]
}

export const getColorForColumn = (
  column: number,
  current: MyNumber
) => {
  'worklet'
  const prev = current.prev
  const diffIndex = current.prevDiffIndex
  if (prev && diffIndex !== undefined) {
    if (column >= diffIndex) {
      const lastChar = getCharForColumn(column, prev)
      const charChanged = lastChar !== getCharForColumn(column, current)
      if (charChanged) {
        const isDecrease = current.value < prev.value

        return isDecrease
          ? current.options.decreaseColor
          : current.options.increaseColor
      }
    }
    const charAppeared = current.entirePart > prev.entirePart
    if (charAppeared && column === diffIndex - 1) {
      return current.options.increaseColor
    }
  }

  return current.options.textColor
}

export const calculateColumnY = (
  column: number,
  num: MyNumber
) => {
  'worklet'

  return Number(getCharForColumn(column, num)) * (
    FONT_HEIGHT + num.options.columnSpacing
  )
}

export const calculateColumnX = (
  column: number,
  num: MyNumber
) => {
  'worklet'

  return (
    num.columnsX[column] -
    baseShift(num) +
    paddingForChar(getCharForColumn(column, num))
  )
}

const getFullEntirePart = (entire: string, max: number) => {
  'worklet'
  const minDiff = entire.length < max
    ? max - entire.length
    : 0
  const listEntire: string[] = []
  for (let i = 0; i < Math.max(max, entire.length); i++) {
    if (i < minDiff) {
      listEntire.push('0')
    } else {
      listEntire.push(entire[i - minDiff])
    }
  }

  return listEntire
}

const _setupPrevDiff = (
  i: number,
  column: number,
  current: SharedValue<MyNumber>,
  prev?: MyNumber,
  decimal = false
) => {
  'worklet'
  if (prev && current.value.prevDiffIndex === undefined) {
    if (
      (!decimal && current.value.fullEntirePart[i] !== prev.fullEntirePart[i]) ||
      (decimal && current.value.decimalPart[i] !== prev.decimalPart[i])
    ) {
      current.value.prevDiffIndex = column
    }
  }
}
const clampToRange = (num: number, min: number, max: number) => {
  'worklet'

  return Math.min(Math.max(num, min), max)
}

export const setupAnimatedNumber = (
  num: SharedValue<MyNumber>,
  _value: number,
  opts: AnimatedNumberOptions,
  prev?: MyNumber
) => {
  'worklet'
  const max = Math.pow(10, opts.maxNbIntegers) - 1
  const value = clampToRange(_value, -max, max)
  const parts = Number(value).toFixed(opts.nbDecimals).split('.')
  const entire = value < 0
    ? parts[0].substring(1)
    : parts[0]

  num.value.value = value
  num.value.options = opts
  num.value.entirePart = Math.max(opts.minNbIntegers, entire.length)
  num.value.fullEntirePart = getFullEntirePart(entire, opts.maxNbIntegers)
  num.value.decimalPart = parts.length > 1 ? Array.from(parts[1]) : []
  num.value.columnsX = {}
  num.value.prev = prev
  num.value.prevDiffIndex = undefined
  // Clear previous's prev to keep low memory usage
  if (prev) {
    prev.prev = undefined
    num.value.prev = prev
  }

  num.value.totalSize = 0
  num.value.offShiftSize = 0
  const minusSize = value < 0 ? getDigitWidth(opts.minusSign) : 0
  const diff = num.value.fullEntirePart.length - num.value.entirePart
  let x = 0
  let column = 0
  // Pre-calculating the X position of each column
  // ... first the integer part
  for (let i = 0; i < num.value.fullEntirePart.length; i++) {
    _setupPrevDiff(i, column, num, prev, false)
    if (opts.integerSeparator) {
      const n = num.value.fullEntirePart.length
      if ((n - i) % 3 === 0) {
        x += getDigitWidth(opts.integerSeparator) + paddingForChar(opts.integerSeparator)
      }
    }
    if (i === diff) {
      num.value.offShiftSize = x - minusSize
    }
    num.value.columnsX[column] = x
    ++column
    x += getDigitWidth(num.value.fullEntirePart[i])
  }

  // ... then the decimal part
  if (num.value.decimalPart.length > 0) {
    x += getDigitWidth(opts.decimalSeparator) + paddingForChar(opts.decimalSeparator)
    for (let i = 0; i < num.value.decimalPart.length; i++) {
      _setupPrevDiff(i, column, num, prev, true)
      num.value.columnsX[column] = x
      ++column
      x += getDigitWidth(num.value.decimalPart[i])
    }
  }

  num.value.totalSize = x
}

export const initialNumber = (
  val: number,
  opts: AnimatedNumberOptions
) => {
  const max = Math.pow(10, opts.maxNbIntegers) - 1
  const value = clampToRange(val, -max, max)
  const parts = Number(value).toFixed(opts.nbDecimals).split('.')
  const entire = value < 0
    ? parts[0].substring(1)
    : parts[0]
  const entirePart = Math.max(opts.minNbIntegers, entire.length)
  const fullEntirePart = getFullEntirePart(entire, opts.maxNbIntegers)
  const decimalPart = parts.length > 1 ? Array.from(parts[1]) : []

  const columnsX: Record<number, number> = {}
  const minusSize = value < 0 ? getDigitWidth(opts.minusSign) : 0
  const diff = fullEntirePart.length - entirePart
  let offShiftSize = 0
  let x = 0
  let column = 0
  // Pre-calculating the X position of each column
  // ... first the integer part
  for (let i = 0; i < fullEntirePart.length; i++) {
    if (opts.integerSeparator) {
      const n = fullEntirePart.length
      if ((n - i) % 3 === 0) {
        x += getDigitWidth(opts.integerSeparator)
      }
    }
    if (i === diff) {
      offShiftSize = x - minusSize
    }
    columnsX[column] = x
    ++column
    x += getDigitWidth(fullEntirePart[i])
  }

  // ... then the decimal part
  if (decimalPart.length > 0) {
    x += getDigitWidth(opts.decimalSeparator)
    for (let i = 0; i < decimalPart.length; i++) {
      columnsX[column] = x
      ++column
      x += getDigitWidth(decimalPart[i])
    }
  }

  return {
    columnsX,
    decimalPart,
    entirePart,
    fullEntirePart,
    offShiftSize,
    options: opts,
    totalSize: x,
    value: val
  }
}
