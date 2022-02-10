import { mockNormalizedFilePath } from '@jil/common-node/mocks';

export function mockSystemPath(part: string, wrap = true) {
	return process.platform === 'win32' && wrap && !part.match(/^[A-Z]:/u)
		? mockNormalizedFilePath('D:', part)
		: mockNormalizedFilePath(part);
}
