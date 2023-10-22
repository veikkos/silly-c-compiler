import { readFileSync, writeFileSync } from 'fs';
import { parse as p } from 'path';
import { tokenize } from './tokenizer';
import { parse } from './parser';
import { performSemanticAnalysis } from './semantic';
import { generateAssemblyCode } from './codegen';

// Get the filename from the command line arguments
const fileName = process.argv[2];

if (!fileName) {
    console.error(
        'Error: Please provide the input file name as a command line argument',
    );
    process.exit(1);
}

// Read the input C code from the file
const code = readFileSync(fileName, 'utf8');

const tokens = tokenize(code);
const ast = parse(tokens);
performSemanticAnalysis(ast);
const assemblyCode = generateAssemblyCode(ast);

console.log('Generated Assembly Code:');
console.log(assemblyCode);

const outputFileName = `${p(fileName).name}.asm`;
console.log(`Writing to ${outputFileName}`);
writeFileSync(outputFileName, assemblyCode, 'utf8');
