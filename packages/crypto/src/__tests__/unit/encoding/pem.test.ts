import {pem, pemcrypt} from '../../../encoding';

const txt1 = `
-----BEGIN BCRYPTO MESSAGE-----
Bcrypto-Header: foo

soWLOTC9I8bbnYcwAaLa1sMwEvWrzt1iXkV8F/r8v1M=
-----END BCRYPTO MESSAGE-----
`;

const txt2 = `
-----BEGIN BCRYPTO MESSAGE-----
Bcrypto-Header: foo
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-256-CBC,5BA1D17455E9AD3C92F85262965DE95B

HPwPa7m6RZX6welEvuqoJ8DEdw2QDvAUEzkAYwCKGgZubrGJiFD4ljtqPXSRlIYV
-----END BCRYPTO MESSAGE-----
`;

const txt3 = `
-----BEGIN BCRYPTO MESSAGE-----
soWLOTC9I8bbnYcwAaLa1sMwEvWrzt1iXkV8F/r8v1M=
-----END BCRYPTO MESSAGE-----
`;

describe('PEM', function () {
  it('should serialize PEM', () => {
    const data = Buffer.alloc(32, 0xaa);
    const block1 = new pem.PEMBlock();
    block1.type = 'BCRYPTO MESSAGE';
    block1.headers.set('Bcrypto-Header', 'foo');
    block1.data = data;

    const str = block1.toString();

    const block2 = pem.PEMBlock.fromString(str);

    expect(block2.type).toEqual(block1.type);
    expect(block2.headers.get('Bcrypto-Header')).toEqual('foo');
    expect(block2.data).toEqual(data);
  });

  it('should serialize and encrypt PEM', () => {
    const data = Buffer.alloc(32, 0xaa);
    const block1 = new pem.PEMBlock();
    block1.type = 'BCRYPTO MESSAGE';
    block1.headers.set('Bcrypto-Header', 'foo');
    block1.data = data;

    pemcrypt.encrypt(block1, 'AES-256-CBC', 'hello world');

    const str = block1.toString();

    const block2 = pem.PEMBlock.fromString(str);

    pemcrypt.decrypt(block2, 'hello world');

    expect(block2.type).toEqual(block1.type);
    expect(block2.headers.get('Bcrypto-Header')).toEqual('foo');
    expect(block2.data).toEqual(data);
  });

  it('should deserialize PEM from vector', () => {
    const block = pem.PEMBlock.fromString(txt1);

    expect(block.type).toEqual('BCRYPTO MESSAGE');
    expect(block.headers.get('Bcrypto-Header')).toEqual('foo');
    expect(block.data).toEqual(Buffer.from('soWLOTC9I8bbnYcwAaLa1sMwEvWrzt1iXkV8F/r8v1M=', 'base64'));

    expect(block.toString().trim()).toEqual(txt1.trim());
  });

  it('should decrypt PEM from vector', () => {
    const block = pem.PEMBlock.fromString(txt2);

    expect(block.toString().trim()).toEqual(txt2.trim());

    pemcrypt.decrypt(block, 'hello world');

    expect(block.type).toEqual('BCRYPTO MESSAGE');
    expect(block.headers.get('Bcrypto-Header')).toEqual('foo');
    expect(block.data).toEqual(Buffer.from('YXxIZ7jipxJVI2/nZsA59F79pkk0s+9cPcAF/lLhsvY=', 'base64'));
  });

  it('should iterate over blocks', () => {
    const txt = [txt1, txt2].join('\n\n');
    const blocks: pem.PEMBlock[] = [];

    for (const block of pem.decode(txt)) blocks.push(block);

    expect(blocks.length).toBe(2);
  });

  it('should parse strictly', () => {
    const data = pem.fromPEM(txt1, 'BCRYPTO MESSAGE');

    expect(data).toEqual(Buffer.from('soWLOTC9I8bbnYcwAaLa1sMwEvWrzt1iXkV8F/r8v1M=', 'base64'));

    const str = pem.toPEM(data, 'BCRYPTO MESSAGE');

    expect(str.trim()).toEqual(txt3.trim());
  });
});
