const Element = require('@satorijs/element')

const tagRegExp1 = /(?<comment><!--[\s\S]*?-->)|(?<tag><(\/?)([^!\s>/]*)([^>]*?)\s*(\/?)>)/
const attrRegExp1 = /([^\s=]+)(?:="(?<value1>[^"]*)"|='(?<value2>[^']*)')?/g

const Position = {
  OPEN: 0,
  CLOSE: 1,
  EMPTY: 2,
  CONTINUE: 3,
}

function parse(source) {
  const tokens = []

  function pushText(content) {
    if (content) tokens.push(content)
  }

  let tagCap
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
    source = Element.unescape(source)
    pushText(source)
  }
}

function foldTokens(tokens) {
  const stack = [[{
    type: 'angle',
    name: Element.Fragment,
    position: Position.OPEN,
    source: '',
    extra: '',
    children: { default: [] },
  }, 'default']]

  function pushToken(...items) {
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
    } else if (position === Position.CONTINUE) {
      stack[0][0].children[name] = []
      stack[0][1] = name
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

function parseTokens(tokens) {
  const result = []
  for (const token of tokens) {
    if (typeof token === 'string') {
      result.push(Element('text', { content: token }))
    } else {
      const attrs = {}
      let attrCap
      attrRegExp1.lastIndex = 0
      while ((attrCap = attrRegExp1.exec(token.extra))) {
        const [, key, v1, v2 = v1] = attrCap
        if (!Element.isNullable(v2)) {
          attrs[key] = Element.unescape(v2)
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

module.exports = parse
