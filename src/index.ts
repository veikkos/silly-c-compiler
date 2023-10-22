import { readFileSync, writeFileSync } from 'fs';
import { parse as p } from 'path';
import { compile } from './silly';

const fileName = process.argv[2];

if (!fileName) {
    console.error(
        'Error: Please provide the input file name as a command line argument',
    );
    process.exit(1);
}

const code = readFileSync(fileName, 'utf8');
const assemblyCode = compile(code);

console.log('Generated Assembly Code:');
console.log(assemblyCode);

const outputFileName = `${p(fileName).name}.asm`;
console.log(`Writing to ${outputFileName}`);
writeFileSync(outputFileName, assemblyCode, 'utf8');
