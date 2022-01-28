export type BcryptSalt = string | Buffer | undefined | null;

export interface Bcrypt {
  native: number;
  hash192(pass: string | Buffer, salt: BcryptSalt, rounds: number): Buffer;
  derive(pass: string | Buffer, salt: BcryptSalt, rounds: number, minor?: string): Buffer;
  generate(pass: string | Buffer, salt: BcryptSalt, rounds: number, minor?: string): Buffer;
  verify(pass: string | Buffer, record: string): boolean;
  hash256(pass: string | Buffer, salt: BcryptSalt, rounds: number): Buffer;
  pbkdf(pass: string | Buffer, salt: BcryptSalt, rounds: number, size: number): Buffer;
  pbkdfAsync(pass: string | Buffer, salt: BcryptSalt, rounds: number, size: number): Promise<Buffer>;
}
