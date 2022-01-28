export interface Curve {
  id: string;
  type: string;
  size: number;
  bits: number;

  privateKeyGenerate(key: Buffer): Buffer;
  privateKeyVerify?(key: Buffer): boolean;

  scalarGenerate?(): Buffer;
  scalarClamp?(key: Buffer): Buffer;
}
