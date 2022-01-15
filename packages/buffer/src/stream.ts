import * as streams from '@jil/stream';
import {TinyBuffer} from './buffer';

export interface TinyBufferReadable extends streams.Readable<TinyBuffer> {}

export interface TinyBufferReadableStream extends streams.ReadableStream<TinyBuffer> {}

export interface TinyBufferWriteableStream extends streams.WriteableStream<TinyBuffer> {}

export interface TinyBufferReadableBufferedStream extends streams.ReadableBufferedStream<TinyBuffer> {}

export function readableToBuffer(readable: TinyBufferReadable): TinyBuffer {
  return streams.consumeReadable<TinyBuffer>(readable, chunks => TinyBuffer.concat(chunks));
}

export function bufferToReadable(buffer: TinyBuffer): TinyBufferReadable {
  return streams.toReadable<TinyBuffer>(buffer);
}

export function streamToBuffer(stream: streams.ReadableStream<TinyBuffer>): Promise<TinyBuffer> {
  return streams.consumeStream<TinyBuffer>(stream, chunks => TinyBuffer.concat(chunks));
}

export async function bufferedStreamToBuffer(
  bufferedStream: streams.ReadableBufferedStream<TinyBuffer>,
): Promise<TinyBuffer> {
  if (bufferedStream.ended) {
    return TinyBuffer.concat(bufferedStream.buffer);
  }

  return TinyBuffer.concat([
    // Include already read chunks...
    ...bufferedStream.buffer,

    // ...and all additional chunks
    await streamToBuffer(bufferedStream.stream),
  ]);
}

export function bufferToStream(buffer: TinyBuffer): streams.ReadableStream<TinyBuffer> {
  return streams.toStream<TinyBuffer>(buffer, chunks => TinyBuffer.concat(chunks));
}

export function streamToBufferReadableStream(
  stream: streams.ReadableStreamEvents<Uint8Array | string>,
): streams.ReadableStream<TinyBuffer> {
  return streams.transform<Uint8Array | string, TinyBuffer>(
    stream,
    {data: data => (typeof data === 'string' ? TinyBuffer.fromString(data) : TinyBuffer.wrap(data))},
    chunks => TinyBuffer.concat(chunks),
  );
}

export function newWriteableBufferStream(
  options?: streams.WriteableStreamOptions,
): streams.WriteableStream<TinyBuffer> {
  return streams.newWriteableStream<TinyBuffer>(chunks => TinyBuffer.concat(chunks), options);
}

export function prefixedBufferReadable(prefix: TinyBuffer, readable: TinyBufferReadable): TinyBufferReadable {
  return streams.prefixedReadable(prefix, readable, chunks => TinyBuffer.concat(chunks));
}

export function prefixedBufferStream(prefix: TinyBuffer, stream: TinyBufferReadableStream): TinyBufferReadableStream {
  return streams.prefixedStream(prefix, stream, chunks => TinyBuffer.concat(chunks));
}
