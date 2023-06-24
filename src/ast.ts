export type ASTNode =
  | IdentifierNode
  | LiteralNode
  | BinaryExpressionNode
  | VariableDeclarationNode
  | ReturnStatementNode
  | FunctionDeclarationNode;

export interface IdentifierNode {
  type: "Identifier";
  value: string;
}

export interface LiteralNode {
  type: "Literal";
  value: string;
}

export interface BinaryExpressionNode {
  type: "BinaryExpression";
  operator: string;
  left: ASTNode;
  right: ASTNode;
}

export interface VariableDeclarationNode {
  type: "VariableDeclaration";
  identifier: IdentifierNode;
  value: ASTNode;
}

export interface ReturnStatementNode {
  type: "ReturnStatement";
  argument: ASTNode;
}

export interface FunctionDeclarationNode {
  type: "FunctionDeclaration";
  identifier: IdentifierNode;
  body: ASTNode[];
}