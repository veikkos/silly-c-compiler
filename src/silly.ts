import { tokenize } from './tokenizer';
import { parse } from './parser';
import { performSemanticAnalysis } from './semantic';
import { generateAssemblyCode } from './codegen';

export function compile(code: string): string {
    const tokens = tokenize(code);
    const ast = parse(tokens);
    performSemanticAnalysis(ast);
    return generateAssemblyCode(ast);
}
