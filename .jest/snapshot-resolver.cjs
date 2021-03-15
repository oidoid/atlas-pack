// See https://jestjs.io/docs/en/configuration.html#snapshotresolver-string.
module.exports = {
  /**
   * Colocate snapshots with components.
   *
   * @arg {string} testPath
   * @arg {string} snapshotExtension
   * @return {string}
   */
  resolveSnapshotPath(testPath, snapshotExtension) {
    return testPath.replace('.test.ts', `${snapshotExtension}.ts`)
  },

  /**
   * Colocate tests with components.
   *
   * @arg {string} snapshotPath
   * @arg {string} snapshotExtension
   * @return {string}
   */
  resolveTestPath(snapshotPath, snapshotExtension) {
    return snapshotPath.replace(snapshotExtension, '.test')
  },

  testPathForConsistencyCheck: '<path>/<test subject>.test.ts'
}
