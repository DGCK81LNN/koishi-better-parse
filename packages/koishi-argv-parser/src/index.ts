import { Argv, escapeRegExp, type Token } from 'koishi'
import { parse as hParse } from '@dgck81lnn/satori-element-input'

export class Tokenizer extends Argv.Tokenizer {
  parse(source: string, terminator = '', nested = false): Argv {
    const tokens: Token[] = []
    source = hParse(source).map((el) => {
      return el.type === 'text' ? el.toString() : Argv.whitespace.escape(el.toString())
    }).join('')
    let rest = source, term = ''
    const stopReg = `\\s+|[${escapeRegExp(terminator)}]|$`
    while (rest && !(terminator && rest.startsWith(terminator))) {
      const token = this.parseToken(rest, stopReg)
      tokens.push(token)
      rest = token.rest
      term = token.terminator
      delete token.rest
    }
    if (rest.startsWith(terminator)) rest = rest.slice(1)
    source = source.slice(0, -(rest + term).length)
    if (!nested) rest = Argv.whitespace.unescape(rest)
    source = Argv.whitespace.unescape(source)
    return { tokens, rest, source }
  }
}

const defaultTokenizer = new Tokenizer()

export function parse(source: string, terminator = '') {
  return defaultTokenizer.parse(source, terminator)
}

// literal parser with no interpolation syntax

const leftQuotes = `"'“‘`
const rightQuotes = `"'”’`

function tokenize(source: string, stopReg = '$'): Token {
  const parent: Token = { content: '', quoted: false, terminator: '', inters: [] }
  const index = leftQuotes.indexOf(source[0])
  const quote = rightQuotes[index]
  let content = ''
  if (quote) {
    source = source.slice(1)
    stopReg = `${quote}(?=${stopReg})|$`
  }
  const regExp = new RegExp(stopReg)
  while (true) {
    const capture = regExp.exec(source)
    content += Argv.whitespace.unescape(source.slice(0, capture.index))
    const quoted = capture[0] === quote
    const rest = source.slice(capture.index + +quoted)
    parent.rest = rest.trimStart()
    parent.quoted = quoted
    parent.terminator = capture[0]
    if (quoted) {
      parent.terminator += rest.slice(0, -parent.rest.length)
    } else if (quote) {
      content = leftQuotes[index] + content
    }
    parent.content = content
    return parent
  }
}

export function parseLiteral(source: string): {
  tokens: Token[]
  rest: string
  source: string
} {
  source = hParse(source).map((el) => {
    return el.type === 'text' ? el.toString() : Argv.whitespace.escape(el.toString())
  }).join('')
  const tokens: Token[] = []
  let rest = source, term = ''
  const stopReg = `\\s+|$`
  while (rest) {
    const token = tokenize(rest, stopReg)
    tokens.push(token)
    rest = token.rest
    term = token.terminator
    delete token.rest
  }
  source = source.slice(0, -(rest + term).length)
  rest = Argv.whitespace.unescape(rest)
  source = Argv.whitespace.unescape(source)
  return { tokens, rest, source }
}
