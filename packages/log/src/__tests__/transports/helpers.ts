/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import {PortablePath} from '@jil/ncommon';
import {FileTransport} from '../../transports/file-transport';

export function existsFile(path: PortablePath): boolean {
  return fs.existsSync(String(path));
}

export function readFile(path: PortablePath): string {
  if (existsFile(path)) {
    return fs.readFileSync(String(path), 'utf8');
  }

  // istanbul ignore next
  return '';
}

export function writeFile(path: PortablePath, content: string) {
  fs.writeFileSync(String(path), content, 'utf8');
}

export function sizeFile(path: PortablePath): number {
  return fs.statSync(String(path)).size;
}

export async function wait(delay: number) {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
}

export async function closeStream(transport: FileTransport<any>) {
  await wait(0);

  return new Promise((resolve, reject) => {
    if (transport.stream) {
      transport.stream.on('error', reject);
      transport.close(() => {
        resolve(undefined);
      });
    } else {
      resolve(undefined);
    }
  });
}
