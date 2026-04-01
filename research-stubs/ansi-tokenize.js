export function tokenize(input = '') {
  return Array.from(input).map(value => ({
    type: 'text',
    value,
    fullWidth: false,
  }))
}

export function styledCharsFromTokens(tokens) {
  return tokens
    .filter(token => token.type !== 'ansi')
    .map(token => ({
      value: token.value,
      styles: [],
      fullWidth: Boolean(token.fullWidth),
    }))
}

export function ansiCodesToString() {
  return ''
}

export function diffAnsiCodes() {
  return []
}

export function reduceAnsiCodes(codes = []) {
  return codes
}

export function undoAnsiCodes() {
  return []
}
