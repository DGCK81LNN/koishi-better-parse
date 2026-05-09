# @dgck81lnn/satori-element-parse-no-trim

**Finally, a parser that doesn't butcher your line breaks.**

I got so fed up with `@satorijs/element`'s `Element.parse()` — that annoying piece of logic that *helpfully* trims newlines around tags. Why would anyone think it's a good idea to strip perfectly valid whitespace? If I put a newline there, I *want* it there. So I fixed it.

## Installation

```bash
yarn add satori-element-parse-no-trim
# or
npm install satori-element-parse-no-trim
```

## Usage

```js
const parse = require('satori-element-parse-no-trim')

const elements = parse('Lorem ipsum:\n<img src="..."/>\n    Dolor sit amet.')

// Look at those beautifully preserved newlines.
console.log(elements)
/* =>
 * [
 *   Element { type: 'text', attrs: { content: 'Lorem ipsum:\n' }, children: [] },
 *   Element { type: 'img', attrs: { src: "..." }, children: [] },
 *   Element { type: 'text', attrs: { content: '\n    Dolor sit amet.' }, children: [] }
 * ]
 */
```

## API

### `parse(source)`

- `source`: `string` – Your markup, with all the precious newlines intact.
- returns: `Element[]`

Parses the markup into an array of `@satorijs/element` elements — **without stripping newlines next to tags** like the original version does.

## Notes

- No `context` parameter. Did you even know what it does? I do but I bet it's not needed for your use case.
- Newlines are **preserved**. Because they should be.
- If you want your newlines trimmed, go use the original. I won't judge you. Much.

---

感谢你读到这里，以上仅为调侃吐槽，本人理解原项目的逻辑也有其道理，但实在因此承受了太多麻烦。希望这个包也能帮到你！如有任何建议或反馈，欢迎开issue。祝编码愉快！
