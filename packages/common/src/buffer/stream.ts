import * as streams from '../stream';
import {DataBuffer} from './buffer';

export interface DataBufferReadable extends streams.Readable<DataBuffer> {}

export interface DataBufferReadableStream extends streams.ReadableStream<DataBuffer> {}

export interface DataBufferWriteableStream extends streams.WriteableStream<DataBuffer> {}

export interface DataBufferReadableBufferedStream extends streams.ReadableBufferedStream<DataBuffer> {}

export function readableToBuffer(readable: DataBufferReadable): DataBuffer {
  return streams.consumeReadable<DataBuffer>(readable, chunks => DataBuffer.concat(chunks));
}

export function bufferToReadable(buffer: DataBuffer): DataBufferReadable {
  return streams.toReadable<DataBuffer>(buffer);
}

export function streamToBuffer(stream: streams.ReadableStream<DataBuffer>): Promise<DataBuffer> {
  return streams.consumeStream<DataBuffer>(stream, chunks => DataBuffer.concat(chunks));
}

export async function bufferedStreamToBuffer(
  bufferedStream: streams.ReadableBufferedStream<DataBuffer>,
): Promise<DataBuffer> {
  if (bufferedStream.ended) {
    return DataBuffer.concat(bufferedStream.buffer);
  }

  return DataBuffer.concat([
    // Include already read chunks...
    ...bufferedStream.buffer,

    // ...and all additional chunks
    await streamToBuffer(bufferedStream.stream),
  ]);
}

export function bufferToStream(buffer: DataBuffer): streams.ReadableStream<DataBuffer> {
  return streams.toStream<DataBuffer>(buffer, chunks => DataBuffer.concat(chunks));
}

export function streamToBufferReadableStream(
  stream: streams.ReadableStreamEvents<Uint8Array | string>,
): streams.ReadableStream<DataBuffer> {
  return streams.transform<Uint8Array | string, DataBuffer>(
    stream,
    {data: data => (typeof data === 'string' ? DataBuffer.fromString(data) : DataBuffer.wrap(data))},
    chunks => DataBuffer.concat(chunks),
  );
}

export function newWriteableBufferStream(
  options?: streams.WriteableStreamOptions,
): streams.WriteableStream<DataBuffer> {
  return streams.newWriteableStream<DataBuffer>(chunks => DataBuffer.concat(chunks), options);
}

export function prefixedBufferReadable(prefix: DataBuffer, readable: DataBufferReadable): DataBufferReadable {
  return streams.prefixedReadable(prefix, readable, chunks => DataBuffer.concat(chunks));
}

export function prefixedBufferStream(prefix: DataBuffer, stream: DataBufferReadableStream): DataBufferReadableStream {
  return streams.prefixedStream(prefix, stream, chunks => DataBuffer.concat(chunks));
}
