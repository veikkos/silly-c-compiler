import {
    ASTNode,
    FunctionDeclarationNode,
    ParameterNode,
    IdentifierNode,
} from './ast';

let assemblyCode = '';
let dataSegment = 'section .data\n';

function generateAssemblyCode(ast: ASTNode[]): string {
    assemblyCode = '';
    dataSegment = 'section .data\n';

    ast.forEach((node) => {
        generateProgram(node);
    });

    return dataSegment + 'section .text\nglobal main\n' + assemblyCode;
}

function generateProgram(node: ASTNode): void {
    if (node.type !== 'FunctionDeclaration') {
        throw new Error('Program must contain a function declaration');
    }
    generateFunctionDeclaration(node);
}

function generateFunctionDeclaration(node: FunctionDeclarationNode): void {
    assemblyCode += `${node.identifier.value}:\n`;

    if (node.identifier.value !== 'main') {
        // Prologue
        assemblyCode += 'push ebp\n'; // Save old base pointer
        assemblyCode += 'mov ebp, esp\n'; // Set new base pointer
    }

    node.body.forEach((statement) =>
        generateStatement(statement, node.parameters),
    );

    if (node.identifier.value !== 'main') {
        // Epilogue
        assemblyCode += 'mov esp, ebp\n'; // Restore stack pointer
        assemblyCode += 'pop ebp\n'; // Pop old base pointer
    }

    assemblyCode += 'ret\n'; // Return instruction for all functions, including main.
}

function generateStatement(node: ASTNode, parameters: ParameterNode[]): void {
    switch (node.type) {
        case 'VariableDeclaration':
            if (node.value.type === 'Literal') {
                dataSegment += `${node.identifier.value} dd ${node.value.value}\n`;
            } else {
                dataSegment += `${node.identifier.value} dd 0\n`;
                generateExpression(node.value, parameters);
                assemblyCode += `mov [${node.identifier.value}], eax\n`;
            }
            break;

        case 'Assignment':
            generateExpression(node.value, parameters);
            assemblyCode += `mov [${node.identifier.value}], eax\n`;
            break;

        case 'ReturnStatement':
            generateExpression(node.argument, parameters);
            break;

        default:
            throw new Error(`Unsupported statement type: ${node.type}`);
    }
}

function generateExpression(node: ASTNode, parameters: ParameterNode[]): void {
    switch (node.type) {
        case 'Identifier':
            if (parameters && isParameter(node, parameters)) {
                const offset = getParameterOffset(parameters, node);
                assemblyCode += `mov eax, [ebp + ${offset}]\n`;
            } else {
                assemblyCode += `mov eax, [${node.value}]\n`;
            }
            break;

        case 'Literal':
            assemblyCode += `mov eax, ${node.value}\n`;
            break;

        case 'BinaryExpression':
            generateExpression(node.right, parameters); // Evaluate the right-hand side first
            assemblyCode += `push eax\n`; // Push the result of the right-hand side to the stack
            generateExpression(node.left, parameters); // Then, evaluate the left-hand side
            assemblyCode += `pop ebx\n`; // Pop the result of the right-hand side to ebx
            assemblyCode += getBinaryOperation(node.operator);
            break;

        case 'FunctionCall':
            node.arguments.reverse().forEach((arg) => {
                // Reverse to handle right-to-left convention
                generateExpression(arg, parameters);
                assemblyCode += `push eax\n`; // Push arguments onto the stack
            });
            assemblyCode += `call ${node.identifier.value}\n`;
            // Clean up arguments from the stack if there are any
            if (node.arguments.length > 0) {
                assemblyCode += `add esp, ${4 * node.arguments.length}\n`; // Assuming 32-bit words
            }
            break;

        default:
            throw new Error(`Unsupported expression type: ${node.type}`);
    }
}

function isParameter(
    identifier: IdentifierNode,
    parameters: ParameterNode[],
): boolean {
    return parameters.some(
        (param) => param.identifier.value === identifier.value,
    );
}

function getParameterOffset(
    parameters: ParameterNode[],
    paramName: IdentifierNode,
): number {
    const paramIndex = parameters.findIndex(
        (param) => param.identifier.value === paramName.value,
    );
    if (paramIndex === -1)
        throw new Error(`Parameter ${paramName.value} not found!`);

    // Calculate the offset: remember ebp is at [ebp], return address at [ebp + 4]
    return 8 + paramIndex * 4;
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
