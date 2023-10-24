export type ASTNode =
    | IdentifierNode
    | LiteralNode
    | BinaryExpressionNode
    | VariableDeclarationNode
    | AssignmentNode
    | ReturnStatementNode
    | FunctionDeclarationNode
    | ParameterNode
    | FunctionCallNode
    | IfStatementNode
    | UnaryExpressionNode;

export interface IdentifierNode {
    type: 'Identifier';
    value: string;
}

export interface LiteralNode {
    type: 'Literal';
    value: string;
}

export interface UnaryExpressionNode {
    type: 'UnaryExpression';
    operator: string;
    operand: ASTNode;
}

export interface BinaryExpressionNode {
    type: 'BinaryExpression';
    operator: string;
    left: ASTNode;
    right: ASTNode;
}

export interface VariableDeclarationNode {
    type: 'VariableDeclaration';
    identifier: IdentifierNode;
    value: ASTNode | null;
}

export interface AssignmentNode {
    type: 'Assignment';
    identifier: IdentifierNode;
    value: ASTNode;
}

export interface ReturnStatementNode {
    type: 'ReturnStatement';
    argument: ASTNode;
}

export interface FunctionDeclarationNode {
    type: 'FunctionDeclaration';
    identifier: IdentifierNode;
    parameters: ParameterNode[];
    body: ASTNode[];
}

export interface ParameterNode {
    type: 'Parameter';
    identifier: IdentifierNode;
}

export interface FunctionCallNode {
    type: 'FunctionCall';
    identifier: IdentifierNode;
    arguments: ASTNode[];
}

export interface IfStatementNode {
    type: 'IfStatement';
    condition: ASTNode;
    body: ASTNode[];
}
