import { ASTNode } from './ast';

export function performSemanticAnalysis(asts: ASTNode[]): void {
    function traverse(node: ASTNode): void {
        switch (node.type) {
            case 'BinaryExpression':
                traverse(node.left);
                traverse(node.right);
                break;

            case 'VariableDeclaration':
            case 'Assignment':
                traverse(node.identifier);
                traverse(node.value);
                break;

            case 'ReturnStatement':
                traverse(node.argument);
                break;

            case 'FunctionDeclaration':
                traverse(node.identifier);
                node.body.forEach(traverse);
                break;

            case 'FunctionCall':
                traverse(node.identifier);
                node.arguments.forEach(traverse);
                break;

            case 'IfStatement':
                traverse(node.condition);
                node.body.forEach(traverse);
                break;

            case 'UnaryExpression':
                traverse(node.operand);
                break;

            case 'Identifier':
            case 'Literal':
                break;

            default:
                throw new Error(`Unsupported node type: ${node.type}`);
        }
    }

    asts.forEach(traverse);
}
