import MagicString from 'magic-string'
import { describe, expect, test } from 'vitest'
import MagicStringExtra from '../src/index'

describe('replace', () => {
  function getSnap(s: MagicString | MagicStringExtra) {
    return {
      code: s.toString(),
      mappings: s.generateMap().mappings,
    }
  }

  test('global regex replace', () => {
    const code = '1 2 1 2'
    const se = new MagicStringExtra(code)
    const s = new MagicString(code)

    se.replace('2', '3')
    s.overwrite(2, 3, '3')

    expect(getSnap(se))
      .toMatchInlineSnapshot(`
        {
          "code": "1 3 1 2",
          "mappings": "AAAA,EAAE,CAAC",
        }
      `)

    expect(getSnap(se)).toEqual(getSnap(s))
  })

  test('global regex replace', () => {
    const s = new MagicStringExtra('1 2 3 4 a b c')

    expect(getSnap(s.replace(/(\d)/g, 'xx$1$10')))
      .toMatchInlineSnapshot(`
        {
          "code": "xx1\$10 xx2\$10 xx3\$10 xx4\$10 a b c",
          "mappings": "AAAA,MAAC,CAAC,MAAC,CAAC,MAAC,CAAC,MAAC",
        }
      `)
  })

  test('global regex replace $$', () => {
    const s = new MagicStringExtra('1 2 3 4 a b c')

    expect(getSnap(s.replace(/(\d)/g, '$$')))
      .toMatchInlineSnapshot(`
        {
          "code": "\$ \$ \$ \$ a b c",
          "mappings": "AAAA,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC",
        }
      `)
  })

  test('global regex replace function', () => {
    const code = 'hello my name is anthony'
    const s = new MagicStringExtra(code)

    s.replace(/(\w)(\w+)/g, (_, $1, $2) => `${$1.toUpperCase()}${$2}`)

    expect(getSnap(s)).toMatchInlineSnapshot(`
      {
        "code": "Hello My Name Is Anthony",
        "mappings": "AAAA,KAAK,CAAC,EAAE,CAAC,IAAI,CAAC,EAAE,CAAC",
      }
    `)
  })
})
