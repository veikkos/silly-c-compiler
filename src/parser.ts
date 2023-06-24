import { Token, TokenType } from "./lexer";
import {
    ASTNode,
    IdentifierNode,
    LiteralNode,
    VariableDeclarationNode,
    ReturnStatementNode,
    FunctionDeclarationNode,
    BinaryExpressionNode,
} from "./ast";

let tokens: Token[] = [];
let cursor = 0;

export function parse(tokenList: Token[]): ASTNode {
    tokens = tokenList;
    cursor = 0;

    const programNode: FunctionDeclarationNode = {
        type: "FunctionDeclaration",
        identifier: parseIdentifier(),
        body: parseBlock(),
    };

    return programNode;
}

function parseBlock(): ASTNode[] {
    const block: ASTNode[] = [];

    match(TokenType.LeftBrace);

    while (tokens[cursor].type !== TokenType.RightBrace) {
        block.push(parseStatement());
    }

    match(TokenType.RightBrace);

    return block;
}

function parseStatement(): ASTNode {
    if (tokens[cursor].type === TokenType.IntKeyword) {
        return parseVariableDeclaration();
    } else if (tokens[cursor].type === TokenType.ReturnKeyword) {
        return parseReturnStatement();
    } else {
        throw new Error(`Unexpected token: ${tokens[cursor].type}`);
    }
}

function parseVariableDeclaration(): VariableDeclarationNode {
    match(TokenType.IntKeyword);
    const identifier = parseIdentifier();
    let value: ASTNode | null = null;

    if (tokens[cursor].type === TokenType.Equal) {
        match(TokenType.Equal);
        value = parseExpression();
    }

    match(TokenType.Semicolon);

    return {
        type: "VariableDeclaration",
        identifier,
        value: value!!,
    };
}

function parseReturnStatement(): ReturnStatementNode {
    match(TokenType.ReturnKeyword);
    const argument = parseExpression();
    match(TokenType.Semicolon);

    return {
        type: "ReturnStatement",
        argument,
    };
}

function parseExpression(): ASTNode {
    let node = parseTerm();

    while (tokens[cursor].type === TokenType.Plus) {
        match(TokenType.Plus);

        const binaryExpressionNode: BinaryExpressionNode = {
            type: "BinaryExpression",
            operator: "+",
            left: node,
            right: parseTerm(),
        };

        node = binaryExpressionNode;
    }

    return node;
}

function parseTerm(): ASTNode {
    if (tokens[cursor].type === TokenType.Identifier) {
        return parseIdentifier();
    } else if (tokens[cursor].type === TokenType.IntLiteral) {
        return parseLiteral();
    } else {
        throw new Error(`Unexpected token: ${tokens[cursor].type}`);
    }
}

function parseIdentifier(): IdentifierNode {
    const token = match(TokenType.Identifier);
    return {
        type: "Identifier",
        value: token.value,
    };
}

function parseLiteral(): LiteralNode {
    const token = match(TokenType.IntLiteral);
    return {
        type: "Literal",
        value: token.value,
    };
}

function match(expectedType: TokenType): Token {
    const token = tokens[cursor];

    if (token.type === expectedType) {
        cursor++;
        return token;
    } else {
        throw new Error(`Unexpected token: ${token.type}. Expected: ${expectedType}`);
    }
}
