import path from 'path';
import {createTranslator} from '@jil/translate';

export const msg = createTranslator(['cli', 'prompt'], path.join(__dirname, '../res'));
