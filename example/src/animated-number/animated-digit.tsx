import { Platform } from 'react-native'

const widthForChar = (char: string) => {
  'worklet'
  const base = Platform.OS === 'android' ? 20 : 20
  switch (char) {
    case '0':
      return base + 1
    case '1':
      return base - 4
    case '2':
      return base
    case '3':
      return base
    case '4':
      return base
    case '5':
      return base
    case '6':
      return base
    case '7':
      return base - 1
    case '8':
      return base
    case '9':
      return base
    case ',':
      return 9
    case '.':
      return 9
    case '-':
      return base - 2
  }

  return base
}

export const paddingForChar = (char: string) => {
  'worklet'
  const base = 0
  switch (char) {
    case '1':
      return 0
    case '.':
      return 2
    case ',':
      return 2
  }

  return base
}

export const getDigitWidth = (char: string) => {
  'worklet'

  return widthForChar(char)
}
