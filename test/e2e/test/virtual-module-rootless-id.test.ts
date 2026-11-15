import { expect, test } from 'vitest'
import { runInlineTests } from '../../test-utils'

test.for(['threads', 'forks', 'vmThreads'] as const)(
  'inlines a virtual module with a rootless id (%s)',
  async (pool) => {
    const { stderr, errorTree } = await runInlineTests(
      {
        'vitest.config.js': `
export default {
  plugins: [{
    name: 'rootless-virtual-module',
    resolveId(source) {
      if (source === '/__rootless-virtual-helper') {
        return source
      }
    },
    load(id) {
      if (id === '/__rootless-virtual-helper') {
        return 'export const sep = require("node:path").posix.sep'
      }
    },
  }],
}
      `,
        'basic.test.js': `
import { expect, test } from 'vitest'
import { sep } from '/__rootless-virtual-helper'

test('virtual module is evaluated', () => {
  expect(sep).toBe('/')
})
      `,
      },
      { pool },
    )

    expect(stderr).toBe('')
    expect(errorTree()).toMatchInlineSnapshot(`
      {
        "basic.test.js": {
          "virtual module is evaluated": "passed",
        },
      }
    `)
  },
)
