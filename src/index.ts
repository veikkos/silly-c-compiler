import { tokenize } from "./lexer";
import { parse } from "./parser";
import { performSemanticAnalysis } from "./semantic";
import { generateAssemblyCode } from "./codegen";

const code = `
  int main() {
    int a = 5;
    int b = 10;
    int sum = a + b;
    return sum;
  }
`;

const tokens = tokenize(code);
console.log(tokens)
const ast = parse(tokens);
console.log(tokens)
performSemanticAnalysis(ast);
const assemblyCode = generateAssemblyCode(ast);

console.log("Generated Assembly Code:");
console.log(assemblyCode);
