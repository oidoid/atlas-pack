import {assert} from './assert.js'

test('assert(false)', () => expect(() => assert(false, 'msg')).toThrow('msg'))

test('assert(true)', () => expect(assert(true)).toBeUndefined())
