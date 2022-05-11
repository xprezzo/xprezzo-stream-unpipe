/*!
 * xprezzo-stream-unpipe
 * Copyright(c) 2022 Cloudgen Wong <cloudgen.wong@gmail.com>
 * MIT Licensed
 */

'use strict'

/**
 * Determine if there are Node.js pipe-like data listeners.
 * @private
 */

const hasPipeDataListeners = (stream) => {
    if (typeof stream === 'object' && typeof stream.listeners === 'function') {
        const listeners = stream.listeners('data')
        for (let i = 0; i < listeners.length; i++) {
            if (listeners[i].name === 'ondata') {
                return true
            }
        }
    }
    return false
}

/**
 * Unpipe a stream from all destinations.
 *
 * @param {object} stream
 * @public
 */
module.exports = (stream) => {
    if (!stream) {
        throw new TypeError('argument stream is required')
    }
    if (typeof stream === 'object' && typeof stream.unpipe === 'function') {
        // new-style
        stream.unpipe()
        return
    }
    // Node.js 0.8 hack
    if (!hasPipeDataListeners(stream)) {
        return
    }
    const listeners = stream.listeners('close')
    for (let i = 0; i < listeners.length; i++) {
        const listener = listeners[i]
        if (listener.name !== 'cleanup' && listener.name !== 'onclose') {
            continue
        }
        // invoke the listener
        listener.call(stream)
    }
}
