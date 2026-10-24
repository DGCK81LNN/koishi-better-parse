# koishi-better-parse

Utilities for parsing Satori elements and Koishi command input without losing meaningful message whitespace.

## Why

Whitespace normalization can be useful when parsing markup authored for readability. It can be harmful when the markup represents a user's original message: removing newlines around an inline element may join command tokens or change the content passed to a command. This behavior is described in [koishijs/koishi#1561](https://github.com/koishijs/koishi/issues/1561).

The packages in this repository preserve that input while offering APIs suited to different layers of a Koishi application.

## Packages

| Package | Purpose |
| --- | --- |
| [`@dgck81lnn/satori-element-input`](packages/satori-element-input) | Parse and process Satori element markup while preserving the text whitespace around tags. Includes helpers for normalizing, stringifying, escaping, selecting, and transforming elements. |
| [`@dgck81lnn/koishi-argv-parser`](packages/koishi-argv-parser) | Parse Koishi command input while preserving whitespace around Satori elements. Includes `parseLiteral()` for tokenizing quoted input without interpreting interpolation syntax. |

Choose `satori-element-input` when working directly with Satori element strings or arrays. Choose `koishi-argv-parser` when parsing command arguments; it uses `satori-element-input` internally.

## License

MIT.
