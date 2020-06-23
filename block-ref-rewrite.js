/* eslint-disable require-atomic-updates */
const createAsyncMiddleware = require('json-rpc-engine/src/createAsyncMiddleware')
const { blockTagParamIndex } = require('./cache-utils')

module.exports = function createBlockRefRewriteMiddleware (opts = {}) {

  const { blockTracker } = opts
  if (!blockTracker) {
    throw Error('BlockRefRewriteMiddleware - mandatory "blockTracker" option is missing.')
  }

  return createAsyncMiddleware(async (req, _res, next) => {
    const blockRefIndex = blockTagParamIndex(req)
    // skip if method does not include blockRef
    if (blockRefIndex === undefined) {
      return next()
    }
    // skip if not "latest"
    let blockRef = req.params[blockRefIndex]
    // omitted blockRef implies "latest"
    if (blockRef === undefined) {
      blockRef = 'latest'
    }
    if (blockRef !== 'latest') {
      return next()
    }
    // rewrite blockRef to block-tracker's block number
    req.params[blockRefIndex] = await blockTracker.getLatestBlock()
    return next()
  })
}
