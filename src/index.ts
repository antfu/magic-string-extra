import type { ExclusionRange, IndentOptions, MagicStringOptions, OverwriteOptions, SourceMap, SourceMapOptions } from 'magic-string'
import MagicString from 'magic-string'

export default class MagicStringExtra {
  private s: MagicString

  constructor(s: MagicString)
  constructor(code: string, options?: Partial<MagicStringOptions>)
  constructor(code: string | MagicString, options?: Partial<MagicStringOptions>) {
    if (typeof code === 'string')
      // https://github.com/Rich-Harris/magic-string/pull/183
      this.s = new MagicString(code, options as MagicStringOptions)
    else
      this.s = code
  }

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

  toRollupResult(sourcemap = true, options?: Partial<SourceMapOptions>) {
    if (!this.hasChanged())
      return null
    const result: { code: string; map?: SourceMap } = {
      code: this.s.toString(),
    }
    if (sourcemap)
      result.map = this.s.generateMap(options)
    return result
  }

  hasChanged() {
    return this.s.toString() !== this.s.original
  }

  /* ========== Methods Proxy ========== */
  toString() {
    return this.s.toString()
  }

  get original() {
    return this.s.original
  }

  addSourcemapLocation(char: number) {
    this.s.addSourcemapLocation(char)
  }

  append(content: string) {
    this.s.append(content)
    return this
  }

  appendLeft(index: number, content: string) {
    this.s.appendLeft(index, content)
    return this
  }

  appendRight(index: number, content: string) {
    this.s.appendRight(index, content)
    return this
  }

  clone() {
    return new MagicStringExtra(this.s.clone())
  }

  generateMap(options?: Partial<SourceMapOptions>) { return this.s.generateMap(options) }
  generateDecodedMap(options?: Partial<SourceMapOptions>) { return this.s.generateDecodedMap(options) }
  getIndentString(): string { return this.s.getIndentString() }

  indent(options?: IndentOptions): MagicStringExtra
  indent(indentStr?: string, options?: IndentOptions): MagicStringExtra
  indent(arg1?: any, arg2?: any) {
    this.s.indent(arg1, arg2)
    return this
  }

  get indentExclusionRanges(): ExclusionRange | Array<ExclusionRange> {
    return this.s.indentExclusionRanges
  }

  move(start: number, end: number, index: number) {
    this.s.move(start, end, index)
    return this
  }

  overwrite(start: number, end: number, content: string, options?: boolean | OverwriteOptions) {
    this.s.overwrite(start, end, content, options)
    return this
  }

  prepend(content: string) {
    this.s.prepend(content)
    return this
  }

  prependLeft(index: number, content: string) {
    this.s.prependLeft(index, content)
    return this
  }

  prependRight(index: number, content: string) {
    this.s.prependRight(index, content)
    return this
  }

  remove(start: number, end: number): MagicString {
    this.s.remove(start, end)
    return this
  }

  slice(start: number, end: number) {
    return this.s.slice(start, end)
  }

  snip(start: number, end: number) {
    this.s.snip(start, end)
    return this
  }

  trim(charType?: string) {
    this.s.trim(charType)
    return this
  }

  trimStart(charType?: string) {
    this.s.trimStart(charType)
    return this
  }

  trimEnd(charType?: string) {
    this.s.trimEnd(charType)
    return this
  }

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

  isEmpty() {
    return this.s.isEmpty()
  }

  length() {
    return this.s.length()
  }
}
