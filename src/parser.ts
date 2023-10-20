import { Token, TokenType } from './lexer';
import {
    ASTNode,
    IdentifierNode,
    LiteralNode,
    VariableDeclarationNode,
    ReturnStatementNode,
    FunctionDeclarationNode,
    BinaryExpressionNode,
    ParameterNode,
    AssignmentNode,
    FunctionCallNode,
} from './ast';

let tokens: Token[] = [];
let cursor = 0;

export function parse(tokenList: Token[]): ASTNode[] {
    tokens = tokenList;
    cursor = 0;

    const astNodes: ASTNode[] = [];

    while (cursor < tokens.length) {
        const functionNode = parseFunctionDeclaration();
        astNodes.push(functionNode);
    }

    return astNodes;
}

function parseFunctionDeclaration(): FunctionDeclarationNode {
    match(TokenType.IntKeyword);
    const identifier = parseIdentifier();
    const parameters = parseParameters();
    const body = parseBlock();

    return {
        type: 'FunctionDeclaration',
        identifier,
        parameters,
        body,
    };
}

function parseParameters(): ParameterNode[] {
    const params: ParameterNode[] = [];
    match(TokenType.LeftParen);

    while (tokens[cursor].type !== TokenType.RightParen) {
        match(TokenType.IntKeyword);
        const paramIdentifier = parseIdentifier();
        params.push({ type: 'Parameter', identifier: paramIdentifier });

        if (tokens[cursor].type === TokenType.Comma) {
            match(TokenType.Comma);
        }
    }

    match(TokenType.RightParen);
    return params;
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
    } else if (tokens[cursor].type === TokenType.Identifier) {
        return parseFunctionCallOrAssignment();
    } else {
        throw new Error(`Unexpected token: ${tokens[cursor].type}`);
    }
}

function parseFunctionCallOrAssignment(): ASTNode {
    const identifier = parseIdentifier();

    if (tokens[cursor].type === TokenType.LeftParen) {
        const args = parseArguments();
        match(TokenType.Semicolon);
        return {
            type: 'FunctionCall',
            identifier,
            arguments: args,
        };
    } else if (tokens[cursor].type === TokenType.Equal) {
        match(TokenType.Equal);
        const value = parseExpression();
        match(TokenType.Semicolon);

        return {
            type: 'Assignment',
            identifier,
            value,
        };
    } else {
        throw new Error(
            `Unexpected token after identifier: ${tokens[cursor].type}`,
        );
    }
}

function parseArguments(): ASTNode[] {
    const args: ASTNode[] = [];
    match(TokenType.LeftParen);

    while (tokens[cursor].type !== TokenType.RightParen) {
        args.push(parseExpression());

        if (tokens[cursor].type === TokenType.Comma) {
            match(TokenType.Comma);
        }
    }

    match(TokenType.RightParen);
    return args;
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

    if (!value) {
        throw new Error('Variable declaration must have a value');
    }

    return {
        type: 'VariableDeclaration',
        identifier,
        value,
    };
}

function parseReturnStatement(): ReturnStatementNode {
    match(TokenType.ReturnKeyword);
    const argument = parseExpression();
    match(TokenType.Semicolon);

    return {
        type: 'ReturnStatement',
        argument,
    };
}

function parseExpression(): ASTNode {
    let node = parseTerm();

    while (
        tokens[cursor].type === TokenType.Plus ||
        tokens[cursor].type === TokenType.Minus ||
        tokens[cursor].type === TokenType.Multiply ||
        tokens[cursor].type === TokenType.Divide
    ) {
        const operator = tokens[cursor].type;
        match(operator);

        const binaryExpressionNode: BinaryExpressionNode = {
            type: 'BinaryExpression',
            operator: getOperatorSymbol(operator),
            left: node,
            right: parseTerm(),
        };

        node = binaryExpressionNode;
    }

    return node;
}

function getOperatorSymbol(tokenType: TokenType): string {
    switch (tokenType) {
        case TokenType.Plus:
            return '+';
        case TokenType.Minus:
            return '-';
        case TokenType.Multiply:
            return '*';
        case TokenType.Divide:
            return '/';
        default:
            throw new Error(`Unsupported operator: ${tokenType}`);
    }
}

function parseTerm(): ASTNode {
    if (
        tokens[cursor].type === TokenType.Identifier &&
        tokens[cursor + 1].type === TokenType.LeftParen
    ) {
        return parseFunctionCall();
    } else if (tokens[cursor].type === TokenType.Identifier) {
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
        type: 'Identifier',
        value: token.value,
    };
}

function parseLiteral(): LiteralNode {
    const token = match(TokenType.IntLiteral);
    return {
        type: 'Literal',
        value: token.value,
    };
}

function parseFunctionCall(): FunctionCallNode {
    const identifier = parseIdentifier();
    match(TokenType.LeftParen);
    const args: ASTNode[] = [];
    while (tokens[cursor].type !== TokenType.RightParen) {
        args.push(parseExpression());
        if (tokens[cursor].type === TokenType.Comma) {
            match(TokenType.Comma);
        }
    }
    match(TokenType.RightParen);

    return {
        type: 'FunctionCall',
        identifier,
        arguments: args,
    };
}

function match(expectedType: TokenType): Token {
    const token = tokens[cursor];

    if (token.type === expectedType) {
        cursor++;
        return token;
    } else {
        throw new Error(
            `Unexpected token: ${token.type}. Expected: ${expectedType}`,
        );
    }
}
