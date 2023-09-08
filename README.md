### Animated number using Skia & Reanimated 3

Feel free to experiment the Example

![](https://github.com/TwistedMinda/animated-number/blob/main/slider.gif)

And checkout the possible options

```ts
interface AnimatedNumberOptions {
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
```

## With a graph

It also feels very nice when used along with a graph.
A nice additional feature is the *colorized delta* compared to the last value (can be disabled on the fly by a `SharedValue`)

![](https://github.com/TwistedMinda/animated-number/blob/main/graph.gif)
