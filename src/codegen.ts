import { ASTNode, FunctionDeclarationNode } from './ast';

let assemblyCode = '';

function generateAssemblyCode(ast: ASTNode): string {
    generateProgram(ast);
    return assemblyCode;
}

function generateProgram(node: ASTNode): void {
    if (node.type !== 'FunctionDeclaration') {
        throw new Error('Program must contain a function declaration');
    }

    generateFunctionDeclaration(node);
}

function generateFunctionDeclaration(node: FunctionDeclarationNode): void {
    if (node.identifier.type !== 'Identifier') {
        throw new Error('Function declaration must have an identifier');
    }

    assemblyCode += `${node.identifier.value}:`;
    newline();

    node.body.forEach(generateStatement);
}

function generateStatement(node: ASTNode): void {
    switch (node.type) {
        case 'VariableDeclaration':
            generateExpression(node.identifier);
            assemblyCode += ' dw ';
            generateExpression(node.value);
            newline();
            break;

        case 'Assignment':
            assemblyCode += 'mov ';
            assemblyCode += node.identifier.value;
            assemblyCode += ', ';
            generateExpression(node.value);
            newline();
            break;

        case 'ReturnStatement':
            assemblyCode += 'mov ax, ';
            generateExpression(node.argument);
            newline();
            assemblyCode += 'ret';
            newline();
            break;

        default:
            throw new Error(`Unsupported statement type: ${node.type}`);
    }
}

function generateExpression(node: ASTNode): void {
    switch (node.type) {
        case 'Identifier':
            if (node.type !== 'Identifier') {
                throw new Error('Identifier node must have a value');
            }
            assemblyCode += node.value;
            break;

        case 'Literal':
            if (node.type !== 'Literal') {
                throw new Error('Literal node must have a value');
            }
            assemblyCode += node.value;
            break;

        case 'BinaryExpression':
            generateExpression(node.left);
            assemblyCode += ` ${getOperatorCode(node.operator)} `;
            generateExpression(node.right);
            break;

        default:
            throw new Error(`Unsupported expression type: ${node.type}`);
    }
}

const getOperatorCode = (operator: string): string => {
    switch (operator) {
        case '+':
            return 'add';
        case '-':
            return 'sub';
        case '*':
            return 'mul';
        case '/':
            return 'div';
        default:
            throw new Error(`Unsupported operator: ${operator}`);
    }
};

function newline(): void {
    assemblyCode += '\n';
}

export { generateAssemblyCode };
