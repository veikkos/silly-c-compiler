import { Token, TokenType } from './tokenizer';
import {
    ASTNode,
    IdentifierNode,
    LiteralNode,
    VariableDeclarationNode,
    ReturnStatementNode,
    FunctionDeclarationNode,
    BinaryExpressionNode,
    ParameterNode,
    FunctionCallNode,
    IfStatementNode,
    UnaryExpressionNode,
} from './ast';

class ParserContext {
    tokens: Token[];
    cursor: number;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.cursor = 0;
    }

    currentToken(): Token {
        return this.tokens[this.cursor];
    }
}

export function parse(tokenList: Token[]): ASTNode[] {
    const context = new ParserContext(tokenList);
    const astNodes: ASTNode[] = [];

    while (context.cursor < context.tokens.length) {
        const currentToken = context.currentToken();
        if (currentToken.type === TokenType.IntKeyword) {
            const nextToken = context.tokens[context.cursor + 1];
            if (nextToken.type === TokenType.Identifier) {
                const afterNextToken = context.tokens[context.cursor + 2];
                if (afterNextToken.type === TokenType.LeftParen) {
                    astNodes.push(parseFunctionDeclaration(context));
                } else {
                    astNodes.push(parseVariableDeclaration(context));
                }
            } else {
                throw new Error(
                    `Unexpected token after int keyword: ${nextToken.type}`,
                );
            }
        } else {
            throw new Error(`Unexpected token: ${currentToken.type}`);
        }
    }

    return astNodes;
}

function parseFunctionDeclaration(
    context: ParserContext,
): FunctionDeclarationNode {
    match(context, TokenType.IntKeyword);
    const identifier = parseIdentifier(context);
    const parameters = parseParameters(context);
    const body = parseBlock(context);

    return {
        type: 'FunctionDeclaration',
        identifier,
        parameters,
        body,
    };
}

function parseParameters(context: ParserContext): ParameterNode[] {
    const params: ParameterNode[] = [];
    match(context, TokenType.LeftParen);

    while (context.currentToken().type !== TokenType.RightParen) {
        match(context, TokenType.IntKeyword);
        const paramIdentifier = parseIdentifier(context);
        params.push({ type: 'Parameter', identifier: paramIdentifier });

        if (context.currentToken().type === TokenType.Comma) {
            match(context, TokenType.Comma);
        }
    }

    match(context, TokenType.RightParen);
    return params;
}

function parseBlock(context: ParserContext): ASTNode[] {
    const block: ASTNode[] = [];

    match(context, TokenType.LeftBrace);

    while (context.currentToken().type !== TokenType.RightBrace) {
        block.push(parseStatement(context));
    }

    match(context, TokenType.RightBrace);

    return block;
}

function parseStatement(context: ParserContext): ASTNode {
    switch (context.currentToken().type) {
        case TokenType.IntKeyword:
            return parseVariableDeclaration(context);
        case TokenType.ReturnKeyword:
            return parseReturnStatement(context);
        case TokenType.Identifier:
            return parseFunctionCallOrAssignment(context);
        case TokenType.IfKeyword:
            return parseIfStatement(context);
        default:
            throw new Error(`Unexpected token: ${context.currentToken().type}`);
    }
}

function parseFunctionCallOrAssignment(context: ParserContext): ASTNode {
    const identifier = parseIdentifier(context);

    switch (context.currentToken().type) {
        case TokenType.LeftParen: {
            const args = parseArguments(context);
            match(context, TokenType.Semicolon);
            return {
                type: 'FunctionCall',
                identifier,
                arguments: args,
            };
        }

        case TokenType.Equal: {
            match(context, TokenType.Equal);
            const value = parseExpression(context);
            match(context, TokenType.Semicolon);
            return {
                type: 'Assignment',
                identifier,
                value,
            };
        }

        default:
            throw new Error(
                `Unexpected token after identifier: ${
                    context.currentToken().type
                }`,
            );
    }
}

function parseIfStatement(context: ParserContext): IfStatementNode {
    match(context, TokenType.IfKeyword);
    match(context, TokenType.LeftParen);
    const condition = parseExpression(context);
    match(context, TokenType.RightParen);
    const body = parseBlock(context);

    return {
        type: 'IfStatement',
        condition,
        body,
    };
}

function parseArguments(context: ParserContext): ASTNode[] {
    const args: ASTNode[] = [];
    match(context, TokenType.LeftParen);

    while (context.currentToken().type !== TokenType.RightParen) {
        args.push(parseExpression(context));

        if (context.currentToken().type === TokenType.Comma) {
            match(context, TokenType.Comma);
        }
    }

    match(context, TokenType.RightParen);
    return args;
}

function parseVariableDeclaration(
    context: ParserContext,
): VariableDeclarationNode {
    match(context, TokenType.IntKeyword);
    const identifier = parseIdentifier(context);
    let value: ASTNode | null = null;

    if (context.currentToken().type === TokenType.Equal) {
        match(context, TokenType.Equal);
        value = parseExpression(context);
    }

    match(context, TokenType.Semicolon);

    return {
        type: 'VariableDeclaration',
        identifier,
        value,
    };
}

function parseReturnStatement(context: ParserContext): ReturnStatementNode {
    match(context, TokenType.ReturnKeyword);
    const argument = parseExpression(context);
    match(context, TokenType.Semicolon);

    return {
        type: 'ReturnStatement',
        argument,
    };
}

function parseExpression(context: ParserContext): ASTNode {
    let node = parseTerm(context);

    while (
        context.currentToken().type === TokenType.Plus ||
        context.currentToken().type === TokenType.Minus ||
        context.currentToken().type === TokenType.Multiply ||
        context.currentToken().type === TokenType.Divide
    ) {
        const operator = context.currentToken().type;
        match(context, operator);

        const binaryExpressionNode: BinaryExpressionNode = {
            type: 'BinaryExpression',
            operator: getOperatorSymbol(operator),
            left: node,
            right: parseTerm(context),
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

function parseTerm(context: ParserContext): ASTNode {
    switch (context.currentToken().type) {
        case TokenType.Identifier:
            if (
                context.tokens[context.cursor + 1].type === TokenType.LeftParen
            ) {
                return parseFunctionCall(context);
            }
            return parseIdentifier(context);

        case TokenType.IntLiteral:
            return parseLiteral(context);

        case TokenType.Minus:
            if (isExpressionFollowing(context)) {
                return parseUnaryExpression(context);
            }
            throw new Error(
                `Unexpected next token: ${
                    context.tokens[context.cursor + 1].type
                }`,
            );

        default:
            throw new Error(`Unexpected token: ${context.currentToken().type}`);
    }
}

function isExpressionFollowing(context: ParserContext): boolean {
    const nextTokenType = context.tokens[context.cursor + 1].type;
    return (
        nextTokenType === TokenType.IntLiteral ||
        nextTokenType === TokenType.Identifier
    );
}

function parseUnaryExpression(context: ParserContext): UnaryExpressionNode {
    const operator = context.currentToken().type;
    match(context, operator);

    return {
        type: 'UnaryExpression',
        operator: getOperatorSymbol(operator),
        operand: parseTerm(context),
    };
}

function parseIdentifier(context: ParserContext): IdentifierNode {
    const token = match(context, TokenType.Identifier);
    return {
        type: 'Identifier',
        value: token.value,
    };
}

function parseLiteral(context: ParserContext): LiteralNode {
    const token = match(context, TokenType.IntLiteral);
    return {
        type: 'Literal',
        value: token.value,
    };
}

function parseFunctionCall(context: ParserContext): FunctionCallNode {
    const identifier = parseIdentifier(context);
    match(context, TokenType.LeftParen);
    const args: ASTNode[] = [];
    while (context.currentToken().type !== TokenType.RightParen) {
        args.push(parseExpression(context));
        if (context.currentToken().type === TokenType.Comma) {
            match(context, TokenType.Comma);
        }
    }
    match(context, TokenType.RightParen);

    return {
        type: 'FunctionCall',
        identifier,
        arguments: args,
    };
}

function match(context: ParserContext, expectedType: TokenType): Token {
    const token = context.currentToken();
    if (token.type === expectedType) {
        context.cursor++;
        return token;
    } else {
        throw new Error(
            `Unexpected token: ${token.type}. Expected: ${expectedType}`,
        );
    }
}
