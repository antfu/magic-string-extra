import type { ExclusionRange, IndentOptions, OverwriteOptions, SourceMap } from 'magic-string'
import MagicString from 'magic-string'
import type { MagicStringOptions, SourceMapOptions } from './types'

export type { ExclusionRange, IndentOptions, MagicStringOptions, OverwriteOptions, SourceMap, SourceMapOptions }

export class MagicStringExtra {
  private s: MagicString
  private sourcemapOptions: Partial<SourceMapOptions> | undefined

  constructor(s: MagicString)
  constructor(code: string, options?: Partial<MagicStringOptions>)
  constructor(arg1: string | MagicString, options?: Partial<MagicStringOptions>) {
    if (typeof arg1 === 'string') {
      // https://github.com/Rich-Harris/magic-string/pull/183
      this.s = new MagicString(arg1, options as MagicStringOptions)
      this.sourcemapOptions = options?.sourcemapOptions
    }
    else {
      this.s = arg1
    }
  }

  /**
   * Do a String.replace with magic!
   *
   * Caveats:
   * - It will always match against the **original string**
   * - It mutates the magic string state (use `.clone()` to be immutable)
   */
  replace(regex: RegExp | string, replacement: string | ((substring: string, ...args: any[]) => string)) {
    function getReplacement(match: RegExpMatchArray) {
      if (typeof replacement === 'string') {
        return replacement.replace(/\$(\$|\&|\d+)/g, (_, i) => {
          // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_string_as_a_parameter
          if (i === '$')
            return '$'
          if (i === '&')
            return match[0]
          const num = +i
          if (num < match.length)
            return match[+i]
          return `$${i}`
        })
      }
      else {
        return replacement(...match as unknown as [string])
      }
    }
    if (typeof regex !== 'string' && regex.global) {
      const matches = Array.from(this.original.matchAll(regex))
      matches.forEach((match) => {
        if (match.index != null)
          this.s.overwrite(match.index, match.index + match[0].length, getReplacement(match))
      })
    }
    else {
      const match = this.original.match(regex)
      if (match?.index != null)
        this.s.overwrite(match.index, match.index + match[0].length, getReplacement(match))
    }
    return this
  }

  /**
   * A shorthand to generate the result in Rollup's `TransformResult` format.
   * When the string has not changed, `null` will be returned to skip the Rollup transformation.
   */
  toRollupResult(generateMap = true, options?: Partial<SourceMapOptions>) {
    const code = this.s.toString()
    if (code === this.s.original)
      return null
    const result: { code: string; map?: SourceMap } = { code }
    if (generateMap)
      result.map = this.generateMap(options)
    return result
  }

  /**
   * Check if this magic string has been changed. Useful to bypass unnecessary transformations.
   */
  hasChanged() {
    return this.s.toString() !== this.s.original
  }

  /* ========== Methods Proxy ========== */
  /**
   * Returns the generated string.
   */
  toString() {
    return this.s.toString()
  }

  /**
   * Get the original source string.
   */
  get original() {
    return this.s.original
  }

  /**
   * Adds the specified character index (with respect to the original string) to sourcemap mappings, if `hires` is false.
   */
  addSourcemapLocation(char: number) {
    this.s.addSourcemapLocation(char)
  }

  /**
   * Appends the specified content to the end of the string.
   */
  append(content: string) {
    this.s.append(content)
    return this
  }

  /**
   * Appends the specified content at the index in the original string.
   * If a range *ending* with index is subsequently moved, the insert will be moved with it.
   * See also `s.prependLeft(...)`.
   */
  appendLeft(index: number, content: string) {
    this.s.appendLeft(index, content)
    return this
  }

  /**
   * Appends the specified content at the index in the original string.
   * If a range *starting* with index is subsequently moved, the insert will be moved with it.
   * See also `s.prependRight(...)`.
   */
  appendRight(index: number, content: string) {
    this.s.appendRight(index, content)
    return this
  }

  /**
   * Does what you'd expect.
   */
  clone() {
    const clone = new MagicStringExtra(this.s.clone())
    clone.sourcemapOptions = { ...this.sourcemapOptions }
    return clone
  }

  /**
   * Generates a version 3 sourcemap.
   */
  generateMap(options?: Partial<SourceMapOptions>) {
    return this.s.generateMap({
      ...this.sourcemapOptions,
      ...options,
    })
  }

  /**
   * Generates a sourcemap object with raw mappings in array form, rather than encoded as a string.
   * Useful if you need to manipulate the sourcemap further, but most of the time you will use `generateMap` instead.
   */
  generateDecodedMap(options?: Partial<SourceMapOptions>) {
    return this.s.generateDecodedMap({
      ...this.sourcemapOptions,
      ...options,
    })
  }

  getIndentString(): string {
    return this.s.getIndentString()
  }

  /**
   * Prefixes each line of the string with prefix.
   * If prefix is not supplied, the indentation will be guessed from the original content, falling back to a single tab character.
   */
  indent(options?: IndentOptions): MagicStringExtra
  /**
   * Prefixes each line of the string with prefix.
   * If prefix is not supplied, the indentation will be guessed from the original content, falling back to a single tab character.
   *
   * The options argument can have an exclude property, which is an array of [start, end] character ranges.
   * These ranges will be excluded from the indentation - useful for (e.g.) multiline strings.
   */
  indent(indentStr?: string, options?: IndentOptions): MagicStringExtra
  indent(arg1?: any, arg2?: any) {
    this.s.indent(arg1, arg2)
    return this
  }

  get indentExclusionRanges(): ExclusionRange | Array<ExclusionRange> {
    return this.s.indentExclusionRanges
  }

  /**
   * Moves the characters from `start and `end` to `index`.
   */
  move(start: number, end: number, index: number) {
    this.s.move(start, end, index)
    return this
  }

  /**
   * Replaces the characters from `start` to `end` with `content`. The same restrictions as `s.remove()` apply.
   *
   * The fourth argument is optional. It can have a storeName property — if true, the original name will be stored
   * for later inclusion in a sourcemap's names array — and a contentOnly property which determines whether only
   * the content is overwritten, or anything that was appended/prepended to the range as well.
   */
  overwrite(start: number, end: number, content: string, options?: boolean | OverwriteOptions) {
    this.s.overwrite(start, end, content, options)
    return this
  }

  /**
   * Prepends the string with the specified content.
   */
  prepend(content: string) {
    this.s.prepend(content)
    return this
  }

  /**
   * Same as `s.appendLeft(...)`, except that the inserted content will go *before* any previous appends or prepends at index
   */
  prependLeft(index: number, content: string) {
    this.s.prependLeft(index, content)
    return this
  }

  /**
   * Same as `s.appendRight(...)`, except that the inserted content will go *before* any previous appends or prepends at `index`
   */
  prependRight(index: number, content: string) {
    this.s.prependRight(index, content)
    return this
  }

  /**
   * Removes the characters from `start` to `end` (of the original string, **not** the generated string).
   * Removing the same content twice, or making removals that partially overlap, will cause an error.
   */
  remove(start: number, end: number): MagicString {
    this.s.remove(start, end)
    return this
  }

  /**
   * Returns the content of the generated string that corresponds to the slice between `start` and `end` of the original string.
   * Throws error if the indices are for characters that were already removed.
   */
  slice(start: number, end: number) {
    return this.s.slice(start, end)
  }

  /**
   * Returns a clone of `s`, with all content before the `start` and `end` characters of the original string removed.
   */
  snip(start: number, end: number) {
    this.s.snip(start, end)
    return this
  }

  /**
   * Trims content matching `charType` (defaults to `\s`, i.e. whitespace) from the start and end.
   */
  trim(charType?: string) {
    this.s.trim(charType)
    return this
  }

  /**
   * Trims content matching `charType` (defaults to `\s`, i.e. whitespace) from the start.
   */
  trimStart(charType?: string) {
    this.s.trimStart(charType)
    return this
  }

  /**
   * Trims content matching `charType` (defaults to `\s`, i.e. whitespace) from the end.
   */
  trimEnd(charType?: string) {
    this.s.trimEnd(charType)
    return this
  }

  /**
   * Removes empty lines from the start and end.
   */
  trimLines() {
    this.s.trimLines()
    return this
  }

  lastChar() {
    return this.s.lastChar()
  }

  lastLine() {
    return this.s.lastLine()
  }

  /**
   * Returns true if the resulting source is empty (disregarding white space).
   */
  isEmpty() {
    return this.s.isEmpty()
  }

  length() {
    return this.s.length()
  }
}

export default MagicStringExtra
