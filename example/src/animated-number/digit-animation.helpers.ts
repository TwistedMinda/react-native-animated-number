import { useRef } from 'react'
import { Platform } from 'react-native'
import { Easing, interpolate, interpolateColor, type SharedValue, useAnimatedReaction, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated'

import { type AnimatedNumberOptions, initialNumber, type MyNumber, setupAnimatedNumber } from './digit-position.helpers'

export interface AnimatedNumberInput {
  animated: boolean
  number: number
}

const MINIMUM_ANIMATION_PERCENTAGE = 0.6
const COLOR_ADDITIONAL_DURATION_PERCENTAGE = 0.3

export const useComparePreviousColor = (
  progress: SharedValue<number>,
  num: SharedValue<MyNumber>,
  compute: (val: MyNumber) => string
) => {
  return useDerivedValue(() => {
    const target = compute(num.value)
    const base = num.value.options.textColor
    if (target === base) {
      return base
    }
    if (Platform.OS === 'android') {
      return progress.value < 1 ? target : base
    }
    const current = interpolateColor(
      progress.value,
      [0, 0.05, 0.95, 1],
      [base, target, target, base]
    )

    return current
  })
}

export const useComparePrevious = <T>(
  progress: SharedValue<number>,
  num: SharedValue<MyNumber>,
  compute: (val: MyNumber) => number,
  format: (val: number) => T,
  log = false
) => {
  const saved = useRef(0)
  const oldValue = useRef(num.value.value)
  const old = useRef(compute(num.value))

  return useDerivedValue(() => {
    const target = compute(num.value)
    if (num.value.value !== oldValue.current) {
      oldValue.current = num.value.value
      old.current = saved.current
    }
    const current = interpolate(
      progress.value,
      // Finish faster so that color stays
      // ... a bit longer than movement
      [0, 1 - COLOR_ADDITIONAL_DURATION_PERCENTAGE, 1],
      [old.current, target, target]
    )
    saved.current = current

    return format(current)
  })
}

export const useAnimatedNumber = (
  content: SharedValue<AnimatedNumberInput>,
  options: Partial<AnimatedNumberOptions> = {}
) => {
  const opts: AnimatedNumberOptions = {
    animated: true,
    animationDuration: 420,
    columnSpacing: 10,
    decimalSeparator: '.',
    decreaseColor: '#EB5757',
    increaseColor: '#08A647',
    integerSeparator: ',',
    leftComponentBackgroundColor: 'white',
    leftComponentSize: 0,
    maxNbIntegers: 12,
    minNbIntegers: 1,
    minusSign: '-',
    nbDecimals: 2,
    renderLeft: undefined,
    renderRight: undefined,
    rightComponentSize: 0,
    textColor: 'black',
    ...options
  }

  const progress = useSharedValue(0)
  const num = useSharedValue<MyNumber>(initialNumber(content.value.number, opts))
  const pendingNum = useSharedValue(num.value.value)
  const end = useSharedValue(false)

  const animate = (newVal: number) => {
    'worklet'
    if (newVal === num.value.value) {
      return
    }
    const alreadyAnimating = content.value.animated && progress.value > 0 && progress.value < MINIMUM_ANIMATION_PERCENTAGE
    if (alreadyAnimating) {
      return
    }
    const prev = { ...num.value }
    setupAnimatedNumber(
      num,
      content.value.number,
      opts,
      prev
    )
    progress.value = 0
    progress.value = withTiming(1, {
      duration: num.value.options.animationDuration,
      easing: Easing.bezier(0.18, 0.13, 0.37, 0.91)
    }, (finished) => {
      if (finished) {
        end.value = true
      }
    })
  }

  const addPending = (newVal: number) => {
    'worklet'
    pendingNum.value = newVal
    animate(newVal)
  }

  const runPending = (finished: boolean) => {
    'worklet'
    if (finished) {
      end.value = false
      animate(pendingNum.value)
    }
  }

  useAnimatedReaction(() => content.value.number, addPending)

  useAnimatedReaction(() => end.value, runPending)

  return {
    num,
    sharedValue: progress
  }
}
