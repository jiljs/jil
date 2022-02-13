import path from 'path';
import {createTranslator} from '@jil/translate';

export const msg = createTranslator('log', path.join(__dirname, '../res'));
