import { ASTNode } from "./ast";

export function performSemanticAnalysis(ast: ASTNode): void {
  function traverse(node: ASTNode): void {
    switch (node.type) {
      case "BinaryExpression":
        traverse(node.left);
        traverse(node.right);
        break;

      case "VariableDeclaration":
        traverse(node.identifier);
        traverse(node.value);
        break;

      case "ReturnStatement":
        traverse(node.argument);
        break;

      case "FunctionDeclaration":
        traverse(node.identifier);
        node.body.forEach(traverse);
        break;

      case "Identifier":
      case "Literal":
        // No semantic analysis needed for identifiers and literals
        break;

      default:
        throw new Error(`Unsupported node type: ${node}`);
    }
  }

  traverse(ast);
}
