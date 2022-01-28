const {Suite} = require('benchmark');
const {BufferReader} = require('..');

function run() {
  benchRead();
}

function benchRead() {
  const buffer = Buffer.allocUnsafe(10240);
  const br = new BufferReader(buffer);

  return new Suite('bufio.read vs buffer.read')
    .add('Buffer', () => {
      buffer.readUInt8();
      buffer.readInt8();
      buffer.readInt32BE();
      buffer.readInt32LE();
    })
    .add('BufferReader', () => {
      // eslint-disable-next-line no-unused-expressions
      br.offset + 10 > buffer.length && br.seek(-br.offset);
      br.readU8();
      br.readI8();
      br.readI32();
      br.readI32BE();
    })
    .on('error', error => {
      console.error(error);
    })
    .on('cycle', function (event) {
      console.log(String(event.target));
    })
    .on('complete', function () {
      // eslint-disable-next-line @typescript-eslint/no-invalid-this
      console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run({async: false});
}

run();
