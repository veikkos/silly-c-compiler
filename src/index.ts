import { tokenize } from "./lexer";
import { parse } from "./parser";
import { performSemanticAnalysis } from "./semantic";
import { generateAssemblyCode } from "./codegen";

// hacked for now: int main() {
const code = `
  main {
    int a = 5;
    int b = 10;
    int sum = a + b;
    return sum;
  }
`;

const tokens = tokenize(code);
const ast = parse(tokens);
performSemanticAnalysis(ast);
const assemblyCode = generateAssemblyCode(ast);

console.log("Generated Assembly Code:");
console.log(assemblyCode);
