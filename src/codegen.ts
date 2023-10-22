import {
    ASTNode,
    FunctionDeclarationNode,
    ParameterNode,
    IdentifierNode,
} from './ast';

let assemblyCode = '';
let dataSegment = 'section .data\n';
let labelCounter = 0;

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
        assemblyCode += 'push ebp\n';
        assemblyCode += 'mov ebp, esp\n';
    }

    node.body.forEach((statement) =>
        generateStatement(statement, node.parameters),
    );

    if (node.identifier.value !== 'main') {
        assemblyCode += 'mov esp, ebp\n';
        assemblyCode += 'pop ebp\n';
    }

    assemblyCode += 'ret\n';
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

        case 'IfStatement': {
            const endLabel = generateUniqueLabel('end_if');
            generateCondition(node.condition, endLabel, parameters);
            node.body.forEach((statement) =>
                generateStatement(statement, parameters),
            );
            assemblyCode += `${endLabel}:\n`;
            break;
        }
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

        case 'UnaryExpression':
            if (node.operator === '-') {
                generateExpression(node.operand, parameters);
                assemblyCode += 'neg eax\n';
            } else {
                throw new Error(`Unsupported unary operator: ${node.operator}`);
            }
            break;

        case 'BinaryExpression':
            generateExpression(node.right, parameters);
            assemblyCode += `push eax\n`;
            generateExpression(node.left, parameters);
            assemblyCode += `pop ebx\n`;
            assemblyCode += getBinaryOperation(node.operator);
            break;

        case 'FunctionCall':
            node.arguments.reverse().forEach((arg) => {
                generateExpression(arg, parameters);
                assemblyCode += `push eax\n`;
            });
            assemblyCode += `call ${node.identifier.value}\n`;
            if (node.arguments.length > 0) {
                assemblyCode += `add esp, ${4 * node.arguments.length}\n`;
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

function generateCondition(
    node: ASTNode,
    endLabel: string,
    parameters: ParameterNode[],
): void {
    generateExpression(node, parameters);
    assemblyCode += 'test eax, eax\n';
    assemblyCode += `je ${endLabel}\n`;
}

function generateUniqueLabel(base: string): string {
    return `${base}_${labelCounter++}`;
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
            return 'xor edx, edx\nidiv ebx\n';
        default:
            throw new Error(`Unsupported operator: ${operator}`);
    }
};

export { generateAssemblyCode };
