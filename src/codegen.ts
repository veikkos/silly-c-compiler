import {
    ASTNode,
    FunctionDeclarationNode,
    ParameterNode,
    IdentifierNode,
    VariableDeclarationNode,
} from './ast';

interface CodeGenerationContext {
    assemblyCode: string;
    dataSegment: string;
    bssSegment: string;
    labelCounter: number;
    variableMap: Map<string, number>;
    globalVariables: Set<string>;
    currentOffset: number;
}

function generateAssemblyCode(ast: ASTNode[]): string {
    const context: CodeGenerationContext = {
        assemblyCode: '',
        dataSegment: 'section .data\n',
        bssSegment: 'section .bss\n',
        labelCounter: 0,
        variableMap: new Map(),
        globalVariables: new Set(),
        currentOffset: 0,
    };

    ast.forEach((node) => {
        if (node.type === 'FunctionDeclaration') {
            generateProgram(context, node);
        } else if (node.type === 'VariableDeclaration') {
            generateGlobalVariable(context, node);
        } else {
            throw new Error('Unsupported top-level node type');
        }
    });

    return (
        context.dataSegment +
        context.bssSegment +
        'section .text\nglobal main\n' +
        context.assemblyCode
    );
}

function generateGlobalVariable(
    context: CodeGenerationContext,
    node: VariableDeclarationNode,
): void {
    if (node.value) {
        if (node.value.type === 'Literal') {
            context.dataSegment += `${node.identifier.value} dd ${node.value.value}\n`;
        } else {
            throw new Error(
                `Unsupported global initializer of type: ${node.value.type}`,
            );
        }
    } else {
        context.bssSegment += `${node.identifier.value} resd 1\n`;
    }

    context.globalVariables.add(node.identifier.value);
}

function generateProgram(context: CodeGenerationContext, node: ASTNode): void {
    if (node.type !== 'FunctionDeclaration') {
        throw new Error('Program must contain a function declaration');
    }
    generateFunctionDeclaration(context, node);
}

function generateFunctionDeclaration(
    context: CodeGenerationContext,
    node: FunctionDeclarationNode,
): void {
    context.assemblyCode += `${node.identifier.value}:\n`;
    context.assemblyCode += 'push ebp\n';
    context.assemblyCode += 'mov ebp, esp\n';

    const totalSpaceForVariables =
        node.body.filter(
            (statement) => statement.type === 'VariableDeclaration',
        ).length * 4;

    if (totalSpaceForVariables > 0) {
        context.assemblyCode += `sub esp, ${totalSpaceForVariables}\n`;
    }

    node.body.forEach((statement) =>
        generateStatement(context, statement, node.parameters),
    );

    context.assemblyCode += 'mov esp, ebp\n';
    context.assemblyCode += 'pop ebp\n';
    context.assemblyCode += 'ret\n';
}

function generateStatement(
    context: CodeGenerationContext,
    node: ASTNode,
    parameters: ParameterNode[],
): void {
    switch (node.type) {
        case 'VariableDeclaration':
            {
                context.currentOffset += 4;
                context.variableMap.set(
                    node.identifier.value,
                    context.currentOffset,
                );
                const variableOffset = getOffsetFromEBP(
                    node.identifier,
                    parameters,
                    context,
                );

                const offsetWithSign =
                    variableOffset >= 0
                        ? `+${variableOffset}`
                        : `${variableOffset}`;
                if (node.value) {
                    if (node.value.type === 'Literal') {
                        context.assemblyCode += `mov dword [ebp ${offsetWithSign}], ${node.value.value}\n`;
                    } else {
                        generateExpression(context, node.value, parameters);
                        context.assemblyCode += `mov [ebp ${offsetWithSign}], eax\n`;
                    }
                } else {
                    context.assemblyCode += `mov dword [ebp ${offsetWithSign}], 0\n`;
                }
            }
            break;

        case 'Assignment':
            {
                generateExpression(context, node.value, parameters);
                if (isGlobalVariable(context, node.identifier)) {
                    context.assemblyCode += `mov [${node.identifier.value}], eax\n`;
                } else {
                    const offset = getOffsetFromEBP(
                        node.identifier,
                        parameters,
                        context,
                    );
                    context.assemblyCode += `mov [ebp ${
                        offset >= 0 ? '+' : ''
                    } ${offset}], eax\n`;
                }
            }
            break;

        case 'ReturnStatement':
            generateExpression(context, node.argument, parameters);
            break;

        case 'IfStatement': {
            const endLabel = generateUniqueLabel(context, 'end_if');
            generateCondition(context, node.condition, endLabel, parameters);
            node.body.forEach((statement) =>
                generateStatement(context, statement, parameters),
            );
            context.assemblyCode += `${endLabel}:\n`;
            break;
        }
        default:
            throw new Error(`Unsupported statement type: ${node.type}`);
    }
}

function generateExpression(
    context: CodeGenerationContext,
    node: ASTNode,
    parameters: ParameterNode[],
): void {
    switch (node.type) {
        case 'Identifier':
            {
                if (isGlobalVariable(context, node)) {
                    context.assemblyCode += `mov eax, [${node.value}]\n`;
                } else {
                    const offset = getOffsetFromEBP(node, parameters, context);
                    context.assemblyCode += `mov eax, [ebp ${
                        offset >= 0 ? '+' : ''
                    }${offset}]\n`;
                }
            }
            break;

        case 'Literal':
            context.assemblyCode += `mov eax, ${node.value}\n`;
            break;

        case 'UnaryExpression':
            if (node.operator === '-') {
                generateExpression(context, node.operand, parameters);
                context.assemblyCode += 'neg eax\n';
            } else {
                throw new Error(`Unsupported unary operator: ${node.operator}`);
            }
            break;

        case 'BinaryExpression':
            generateExpression(context, node.right, parameters);
            context.assemblyCode += `push eax\n`;
            generateExpression(context, node.left, parameters);
            context.assemblyCode += `pop ebx\n`;
            context.assemblyCode += getBinaryOperation(node.operator);
            break;

        case 'FunctionCall':
            node.arguments.reverse().forEach((arg) => {
                generateExpression(context, arg, parameters);
                context.assemblyCode += `push eax\n`;
            });
            context.assemblyCode += `call ${node.identifier.value}\n`;
            if (node.arguments.length > 0) {
                context.assemblyCode += `add esp, ${
                    4 * node.arguments.length
                }\n`;
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

function isGlobalVariable(
    context: CodeGenerationContext,
    identifier: IdentifierNode,
): boolean {
    return context.globalVariables.has(identifier.value);
}

function generateCondition(
    context: CodeGenerationContext,
    node: ASTNode,
    endLabel: string,
    parameters: ParameterNode[],
): void {
    generateExpression(context, node, parameters);
    context.assemblyCode += 'test eax, eax\n';
    context.assemblyCode += `je ${endLabel}\n`;
}

function generateUniqueLabel(
    context: CodeGenerationContext,
    base: string,
): string {
    return `${base}_${context.labelCounter++}`;
}

function getOffsetFromEBP(
    identifier: IdentifierNode,
    parameters: ParameterNode[],
    context: CodeGenerationContext,
): number {
    if (isGlobalVariable(context, identifier)) {
        throw new Error(
            `Attempting to get EBP offset for global variable: ${identifier.value}`,
        );
    }
    return isParameter(identifier, parameters)
        ? getParameterOffset(parameters, identifier)
        : -getVariableOffsetFromEBP(identifier, context);
}

function getParameterOffset(
    parameters: ParameterNode[],
    paramName: IdentifierNode,
): number {
    const paramIndex = parameters.findIndex(
        (param) => param.identifier.value === paramName.value,
    );
    if (paramIndex === -1) {
        throw new Error(`Parameter ${paramName.value} not found!`);
    }
    return 8 + paramIndex * 4;
}

function getVariableOffsetFromEBP(
    identifier: IdentifierNode,
    context: CodeGenerationContext,
): number {
    const offset = context.variableMap.get(identifier.value);
    if (offset === undefined) {
        throw new Error(
            `Variable ${identifier.value} not found in the context.`,
        );
    }
    return offset;
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
