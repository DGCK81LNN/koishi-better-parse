# @dgck81lnn/satori-element-input

[![npm](https://img.shields.io/npm/v/@dgck81lnn/satori-element-input?style=flat-square)](https://www.npmjs.com/package/@dgck81lnn/satori-element-input)

Utilities for parsing and processing Satori element markup without discarding whitespace around tags.

## Why

Whitespace around an element can be meaningful when markup represents a user's message, not source code written for readability. [koishijs/koishi#1561](https://github.com/koishijs/koishi/issues/1561) documents how trimming newlines around tags can erroneously join command tokens or remove line breaks around inline elements when user content is serialized and parsed again.

This package parses text and tags into the same `Element` class from Satori, while keeping the surrounding text intact. For example, the newline before and after an emoji remains part of the neighboring text nodes:

```js
import { parse } from '@dgck81lnn/satori-element-input'

const elements = parse('First line <emoji id="297"/>\nSecond line')
/*
  [
    Element {
      type: 'text',
      attrs: { content: 'First line ' },
      children: []
    },
    Element { type: 'emoji', attrs: { id: '297' }, children: [] },
    Element {
      type: 'text',
      attrs: { content: '\nSecond line' }, // <- '\n' preserved!
      children: []
    }
  ]
*/
```

The parsed array contains text nodes ending in `\n` before the image and beginning with `\n` after it. Use this when whitespace from user input must survive parsing; use the standard Satori parser when its whitespace normalization is desired.

## API

- `parse(source)` parses markup into `@satorijs/element` elements and preserves text whitespace around tags.
- `normalize(source)` converts a string by parsing it, or converts an existing fragment to an element array.
- `stringify(source)` serializes a fragment to a string. An omitted or empty source produces an empty string.
- `escape(source, inline?)` and `unescape(source)` escape and unescape Satori text.
- `select(source, query)` selects elements from either a markup string or an element array using CSS-like selectors.
- `transform(source, rules, session?)` transforms a string or element array. It returns a string for string input and an element array for array input.
- `transformAsync(source, rules, session?)` is the asynchronous equivalent of `transform` and returns a promise of the corresponding result.

The transform functions accept the same rule and session shapes as `@satorijs/element`'s `transform` and `transformAsync` APIs.
