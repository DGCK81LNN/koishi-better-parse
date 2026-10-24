# @dgck81lnn/koishi-argv-parser

[![npm](https://img.shields.io/npm/v/@dgck81lnn/koishi-argv-parser?style=flat-square)](https://www.npmjs.com/package/@dgck81lnn/koishi-argv-parser)

A Koishi argv parser that preserves whitespace around message elements, plus a literal parser that does not interpret interpolation syntax.

## Why

Koishi's normal element parsing can remove newlines adjacent to tags. That is often convenient when writing markup, but it can change a user's message when Koishi serializes it and later parses it as command input. For example, a newline between a command name and an image may disappear, joining the command name and element into one token. Newlines around inline elements can also be lost. See [koishijs/koishi#1561](https://github.com/koishijs/koishi/issues/1561).

This package uses [`@dgck81lnn/satori-element-input`](https://www.npmjs.com/package/@dgck81lnn/satori-element-input) to parse Satori elements without trimming their surrounding text, then applies Koishi's argv tokenization.

## Install

```bash
npm install @dgck81lnn/koishi-argv-parser
```

## Usage

```ts
import { parse, parseLiteral } from '@dgck81lnn/koishi-argv-parser'

const argv = parse('echo\n<img src="https://example.com/image.png"/>')
// The newline remains a separator between argv tokens.

const literalArgv = parseLiteral('echo ${name}')
// Interpolation syntax is kept as ordinary token text, not parsed into `inters`.
```

## API

### `parse(source, terminator?)`

Parses command input with Koishi's standard tokenizer behavior while preserving newlines around Satori elements. Returns Koishi's `Argv` object (`tokens`, `rest`, and `source`). The optional `terminator` is forwarded to the tokenizer, as in Koishi's argv parser.

Use this when you want normal Koishi interpolation handling and need message whitespace around elements preserved.

### `Tokenizer`

An `Argv.Tokenizer` subclass with the whitespace-preserving behavior used by `parse()`. Instantiate it if you need to define additional interpolation syntax locally.

### `parseLiteral(source)`

Parses whitespace-separated, quoted command tokens without interpreting Koishi interpolation syntax. Interpolation-looking text remains in token `content`, and token `inters` arrays are empty. Returns an object with Koishi-compatible `tokens`, `rest`, and `source` fields.

Use this when input should be treated literally rather than expanded through Koishi's interpolation mechanism. Quoted arguments are still recognized.

