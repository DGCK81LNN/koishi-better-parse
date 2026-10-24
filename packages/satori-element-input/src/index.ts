import Element from '@satorijs/element'
import { Awaitable, type Dict, isNonNullable, isNullable } from 'cosmokit'

const tagRegExp1 = /(?<comment><!--[\s\S]*?-->)|(?<tag><(\/?)([^!\s>/]*)([^>]*?)\s*(\/?)>)/
const attrRegExp1 = /([^\s=]+)(?:="(?<value1>[^"]*)"|='(?<value2>[^']*)')?/g

const enum Position {
  OPEN,
  CLOSE,
  EMPTY,
}

interface Token {
  type: 'angle' | 'curly'
  name: string
  position: Position
  source: string
  extra: string
  children?: Dict<(string | Token)[]>
}

export function parse(source: string) {
  const tokens = []

  function pushText(content: string) {
    if (content) tokens.push(content)
  }

  let tagCap: RegExpExecArray | null
  while ((tagCap = tagRegExp1.exec(source))) {
    parseContent(source.slice(0, tagCap.index))
    source = source.slice(tagCap.index + tagCap[0].length)
    const [_, , , close, type, extra, empty] = tagCap
    if (tagCap.groups.comment) continue
    tokens.push({
      type: 'angle',
      source: _,
      name: type || "",
      position: close ? Position.CLOSE : empty ? Position.EMPTY : Position.OPEN,
      extra,
    })
  }

  parseContent(source)

  return parseTokens(foldTokens(tokens))

  function parseContent(source) {
    source = unescape(source)
    pushText(source)
  }
}

function foldTokens(tokens: (string | Token)[]) {
  const stack: [Token, string][] = [[{
    type: 'angle',
    name: Element.Fragment,
    position: Position.OPEN,
    source: '',
    extra: '',
    children: { default: [] },
  }, 'default']]

  function pushToken(...items: (string | Token)[]) {
    const [token, slot] = stack[0]
    token.children[slot].push(...items)
  }

  for (const token of tokens) {
    if (typeof token === 'string') {
      pushToken(token)
      continue
    }
    const { name, position } = token
    if (position === Position.CLOSE) {
      if (stack[0][0].name === name) {
        stack.shift()
      }
    } else if (position === Position.OPEN) {
      pushToken(token)
      token.children = { default: [] }
      stack.unshift([token, 'default'])
    } else {
      pushToken(token)
    }
  }

  return stack[stack.length - 1][0].children.default
}

function parseTokens(tokens: (string | Token)[]) {
  const result = []
  for (const token of tokens) {
    if (typeof token === 'string') {
      result.push(Element('text', { content: token }))
    } else {
      const attrs = {}
      let attrCap: RegExpExecArray | null
      attrRegExp1.lastIndex = 0
      while ((attrCap = attrRegExp1.exec(token.extra))) {
        const [, key, v1, v2 = v1] = attrCap
        if (!isNullable(v2)) {
          attrs[key] = unescape(v2)
        } else if (key.startsWith('no-')) {
          attrs[key.slice(3)] = false
        } else {
          attrs[key] = true
        }
      }
      result.push(Element(token.name, attrs, token.children && parseTokens(token.children.default)))
    }
  }
  return result
}

// Selectors parsing fix

type Combinator = ' ' | '>' | '+' | '~'

const combRegExp = / *([ >+~]) */

export function parseSelector(input: string): Element.Selector[][] {
  return input.split(',').map((query) => {
    const selectors: Element.Selector[] = []
    query = query.trim()
    let combCap: RegExpExecArray | null, combinator: Combinator = ' '
    while ((combCap = combRegExp.exec(query))) {
      selectors.push({ type: query.slice(0, combCap.index), combinator })
      combinator = combCap[1] as Combinator
      query = query.slice(combCap.index + combCap[0].length)
    }
    selectors.push({ type: query, combinator })
    return selectors
  })
}

// Convenience functions

export function normalize(source: Element.Fragment) {
  return typeof source === 'string' ? parse(source) : Element.toElementArray(source)
}

export function stringify(source?: Element.Fragment) {
  if (Array.isArray(source)) return source.filter(isNonNullable).join("")
  if (source) return source.toString()
  return ""
}

export function escape(source: string, inline = false) {
  return Element.escape(source, inline)
}

export function unescape(source: string) {
  // fixes codepoint form of &amp; not considering leading zeros
  return source
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0*([1-9]\d*|0);/g, (_, code) => code === '38' ? _ : String.fromCharCode(+code))
    .replace(/&#x0*([1-9a-f][0-9a-f]*|0);/gi, (_, code) => code === '26' ? _ : String.fromCharCode(parseInt(code, 16)))
    .replace(/&(amp|#0*38|#x0*26);/g, '&')
}

export function select(source: string | Element[], query: string | Element.Selector[][]): Element[] {
  if (typeof source === 'string') source = parse(source)
  if (typeof query === 'string') query = parseSelector(query)
  return Element.select(source, query)
}

type SyncVisitor<S> = Dict<Element.SyncTransformer<S>> | Element.Visit<boolean | Element.Fragment, S>
type Visitor<S> = Dict<Element.Transformer<S>> | Element.Visit<Awaitable<boolean | Element.Fragment>, S>
type Rest<T> = [T] extends [never] ? [session?: T] : [session: T]

export function transform<S = never>(source: string, rules: SyncVisitor<S>, ...rest: Rest<S>): string
export function transform<S = never>(source: Element[], rules: SyncVisitor<S>, ...rest: Rest<S>): Element[]
export function transform<S>(source: string | Element[], rules: SyncVisitor<S>, session: S) {
  const elements = typeof source === 'string' ? parse(source) : source
  const output = Element.transform(elements, rules, session)
  return typeof source === 'string' ? output.join('') : output
}

export function transformAsync<S = never>(source: string, rules: Visitor<S>, ...rest: Rest<S>): Promise<string>
export function transformAsync<S = never>(source: Element[], rules: Visitor<S>, ...rest: Rest<S>): Promise<Element[]>
export async function transformAsync<S>(source: string | Element[], rules: Visitor<S>, session: S) {
  const elements = typeof source === 'string' ? parse(source) : source
  const output = await Element.transformAsync(elements, rules, session)
  return typeof source === 'string' ? output.join('') : output
}
