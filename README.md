# xprezzo-stream-unpipe

Unpipe a stream from all destinations and fire all the onclose and cleanup events

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```sh
$ npm install xprezzo-stream-unpipe
```

## API

```js
const unpipe = require('xprezzo-stream-unpipe')
```

### unpipe(stream)

Unpipes all destinations from a given stream. With stream 2+, this is
equivalent to `stream.unpipe()`. When used with streams 1 style streams
(typically Node.js 0.8 and below), this module attempts to undo the
actions done in `stream.pipe(dest)`.

## People

Xprezzo and related projects are maintained by [Cloudgen Wong](mailto:cloudgen.wong@gmail.com).

## License

[MIT](LICENSE)
