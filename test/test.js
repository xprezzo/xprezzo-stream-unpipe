const assert = require('assert')
const stream = require('readable-stream')
const unpipe = require('..')
const util = require('util')

describe('unpipe(stream)', function () {
  describe('arguments', function () {
    describe('stream', function () {
      it('should be required', function () {
        assert.throws(unpipe, /argument stream is required/)
      })
    })
  })

  describe('stream with unpipe support', function () {
    it('should unpipe no destinations', function (done) {
      const testStream = new SlowReadStream()

      process.nextTick(function () {
        unpipe(testStream)
        done()
      })
    })

    it('should unpipe single destination', function (done) {
      let pipes = 0
      const testStream = new SlowReadStream()
      const dest = new SlowWriteStream()

      dest.on('pipe', function () {
        pipes++
      })

      dest.on('unpipe', function (src) {
        process.nextTick(function () {
          done()
        })
        assert.equal(src, testStream)
      })

      testStream.on('resume', function () {
        assert.equal(pipes, 1)
        unpipe(testStream)
      })
      testStream.pipe(dest)
    })

    it('should not remove custom close events', function (done) {
      let pipes = 0
      const testStream = new SlowReadStream()
      const dest = new SlowWriteStream()

      dest.on('pipe', function () {
        pipes++
      })

      testStream.on('resume', function () {
        assert.equal(pipes, 1)
        testStream.on('close', done)
        unpipe(testStream)
        testStream.emit('close')
      })

      testStream.pipe(dest)
    })
  })

  describe('stream without unpipe support', function () {
    it('should unpipe no destinations', function (done) {
      const testStream = new SlowOldStream()

      process.nextTick(function () {
        unpipe(testStream)
        done()
      })
    })

    it('should unpipe single destination', function (done) {
      let pipes = 0
      const testStream = new SlowOldStream()
      const dest = new SlowWriteStream()

      dest.on('pipe', function () {
        pipes++
      })

      dest.once('write', function () {
        assert.equal(pipes, 1)
        dest.on('write', function () {
          throw new Error('unexpected write event')
        })

        unpipe(testStream)
        testStream.emit('data', 'pong')
        process.nextTick(done)
      })

      testStream.pipe(dest)
      testStream.emit('data', 'ping')
    })

    it('should not remove custom data events', function (done) {
      let pipes = 0
      const testStream = new SlowOldStream()
      const dest = new SlowWriteStream()

      testStream.on('data', function (chunk) {
        if (chunk === 'pong') {
          done()
        }
      })

      dest.on('pipe', function () {
        pipes++
      })

      dest.once('write', function () {
        assert.equal(pipes, 1)
        dest.on('write', function () {
          throw new Error('unexpected write event')
        })

        unpipe(testStream)
        testStream.emit('data', 'pong')
      })

      testStream.pipe(dest)
      testStream.emit('data', 'ping')
    })

    it('should not remove custom close events', function (done) {
      let pipes = 0
      const testStream = new SlowOldStream()
      const dest = new SlowWriteStream()

      dest.on('pipe', function () {
        pipes++
      })

      dest.once('write', function () {
        assert.equal(pipes, 1)
        dest.on('write', function () {
          throw new Error('unexpected write event')
        })

        testStream.on('close', done)

        unpipe(testStream)
        testStream.emit('data', 'pong')
        testStream.emit('close')
      })

      testStream.pipe(dest)
      testStream.emit('data', 'ping')
    })
  })
})

function SlowOldStream () {
  stream.Stream.call(this)
}

util.inherits(SlowOldStream, stream.Stream)

function SlowReadStream () {
  stream.Readable.call(this)
}

util.inherits(SlowReadStream, stream.Readable)

SlowReadStream.prototype._read = function _read () {
  const that = this
  setTimeout(() => { that.push.bind(that, '.') }, 1000)
}

function SlowWriteStream () {
  stream.Writable.call(this)
}

util.inherits(SlowWriteStream, stream.Writable)

SlowWriteStream.prototype._write = function _write (chunk, encoding, callback) {
  this.emit('write')
  setTimeout(() => { callback() }, 1000)
}
