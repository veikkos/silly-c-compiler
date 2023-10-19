import { ASTNode, FunctionDeclarationNode } from './ast';

let assemblyCode = '';
let dataSegment = 'section .data\n';

function generateAssemblyCode(ast: ASTNode): string {
    assemblyCode = '';
    generateProgram(ast);
    return dataSegment + 'section .text\nglobal main\n' + assemblyCode;
}

function generateProgram(node: ASTNode): void {
    if (node.type !== 'FunctionDeclaration') {
        throw new Error('Program must contain a function declaration');
    }
    generateFunctionDeclaration(node);
}

function generateFunctionDeclaration(node: FunctionDeclarationNode): void {
    if (node.type !== 'FunctionDeclaration') {
        throw new Error('Program must contain a function declaration');
    }
    assemblyCode += `${node.identifier.value}:\n`;
    node.body.forEach(generateStatement);
}

function generateStatement(node: ASTNode): void {
    switch (node.type) {
        case 'VariableDeclaration':
            if (node.value.type === 'Literal') {
                dataSegment += `${node.identifier.value} dd ${node.value.value}\n`;
            } else {
                dataSegment += `${node.identifier.value} dd 0\n`;
                generateExpression(node.value);
                assemblyCode += `mov [${node.identifier.value}], eax\n`;
            }
            break;

        case 'Assignment':
            generateExpression(node.value);
            assemblyCode += `mov [${node.identifier.value}], eax\n`;
            break;

        case 'ReturnStatement':
            generateExpression(node.argument);
            assemblyCode += 'ret\n';
            break;

        default:
            throw new Error(`Unsupported statement type: ${node.type}`);
    }
}

function generateExpression(node: ASTNode): void {
    switch (node.type) {
        case 'Identifier':
            assemblyCode += `mov eax, [${node.value}]\n`;
            break;

        case 'Literal':
            assemblyCode += `mov eax, ${node.value}\n`;
            break;

        case 'BinaryExpression':
            generateExpression(node.left);
            assemblyCode += `push eax\n`; // Push the result of the left-hand side to the stack
            generateExpression(node.right);
            assemblyCode += `pop ebx\n`; // Pop the result of the left-hand side to ebx
            assemblyCode += getBinaryOperation(node.operator);
            break;

        default:
            throw new Error(`Unsupported expression type: ${node.type}`);
    }
}

const getBinaryOperation = (operator: string): string => {
    switch (operator) {
        case '+':
            return 'add eax, ebx\n';
        case '-':
            return 'sub eax, ebx\n';
        case '*':
            return 'imul eax, ebx\n';
        case '/':
            return 'xor edx, edx\nidiv ebx\n'; // Note that the divisor is now in ebx
        default:
            throw new Error(`Unsupported operator: ${operator}`);
    }
};

export { generateAssemblyCode };
