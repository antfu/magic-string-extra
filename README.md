# DEPRECATED. It has been ported back to [magic-string](https://github.com/Rich-Harris/magic-string) `>= 0.26.0`

-----

# magic-string-extra

[![NPM version](https://img.shields.io/npm/v/magic-string-extra?color=a1b858&label=)](https://www.npmjs.com/package/magic-string-extra)

Extended [Rich-Harris/magic-string](https://github.com/Rich-Harris/magic-string) with extra utilities.

## Install

```bash
npm i magic-string-extra
```

`magic-string-extra` can be a drop-in replacement for `magic-string`:

```diff
- import MagicString from 'magic-string'
+ import MagicString from 'magic-string-extra'
```

## Extra Utils

Check [`magic-string`](https://github.com/Rich-Harris/magic-string)'s documentation for the base utils.

### `.replace()`

Shares the same signature as [`String.prototype.replace`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace). Supports RegExp and replacer functions.

```ts
import MagicString from 'magic-string-extra'

const s = new MagicString(source)

s.replace(foo, 'bar')
s.replace(/foo/g, 'bar')
s.replace(/(\w)(\d+)/g, (_, $1, $2) => $1.toUpperCase() + $2)
```

The differences from `String.replace`:
- It will always match against the **original string**
- It mutates the magic string state (use `.clone()` to be immutable)

### `.hasChanged()`

In some cases, when the string does not change you might be able to skip the sourcemap generation to improve the performance (e.g. Rollup and Vite's transform hook). This function allows you to check the state without tracking it externally.

```ts
import MagicString from 'magic-string-extra'

const s = new MagicString(source)

s.hasChanged() // false

s.prepend('foo')

s.hasChanged() // true
```

### `.toRollupResult()`

It's common to use the magic string for code transformations in plugins. This function provides a shorthand to generate the result in Rollup's `TransformResult` format. When the string has not changed, `null` will be returned to skip the Rollup transformation.

```ts
import MagicString from 'magic-string-extra'

const s = new MagicString(source)

s.toRollupResult() // { code, map } | null
```

## Included Upstream PRs

- [#183 - fix(types): mark MagicString options as optional](https://github.com/Rich-Harris/magic-string/pull/183)
- [#179 - docs: add TSDoc](https://github.com/Rich-Harris/magic-string/pull/179)

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License ?? 2022 [Anthony Fu](https://github.com/antfu)
