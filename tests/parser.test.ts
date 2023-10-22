import { Token, TokenType } from '../src/tokenizer';
import { ASTNode, FunctionDeclarationNode } from '../src/ast';
import { parse } from '../src/parser';

describe('parse', () => {
    test('should parse a simple function declaration', () => {
        const tokens: Token[] = [
            { type: TokenType.IntKeyword, value: 'int' },
            { type: TokenType.Identifier, value: 'main' },
            { type: TokenType.LeftParen, value: '(' },
            { type: TokenType.RightParen, value: ')' },
            { type: TokenType.LeftBrace, value: '{' },
            { type: TokenType.IntKeyword, value: 'int' },
            { type: TokenType.Identifier, value: 'a' },
            { type: TokenType.Equal, value: '=' },
            { type: TokenType.IntLiteral, value: '3' },
            { type: TokenType.Semicolon, value: ';' },
            { type: TokenType.ReturnKeyword, value: 'return' },
            { type: TokenType.Identifier, value: 'a' },
            { type: TokenType.Plus, value: '+' },
            { type: TokenType.IntLiteral, value: '10' },
            { type: TokenType.Semicolon, value: ';' },
            { type: TokenType.RightBrace, value: '}' },
        ];

        const expectedAST: FunctionDeclarationNode[] = [
            {
                type: 'FunctionDeclaration',
                identifier: {
                    type: 'Identifier',
                    value: 'main',
                },
                parameters: [],
                body: [
                    {
                        type: 'VariableDeclaration',
                        identifier: {
                            type: 'Identifier',
                            value: 'a',
                        },
                        value: {
                            type: 'Literal',
                            value: '3',
                        },
                    },
                    {
                        type: 'ReturnStatement',
                        argument: {
                            type: 'BinaryExpression',
                            operator: '+',
                            left: {
                                type: 'Identifier',
                                value: 'a',
                            },
                            right: {
                                type: 'Literal',
                                value: '10',
                            },
                        },
                    },
                ],
            },
        ];

        const ast: ASTNode[] = parse(tokens);
        expect(ast).toEqual(expectedAST);
    });

    test('should parse function call', () => {
        const tokens: Token[] = [
            { type: TokenType.IntKeyword, value: 'int' },
            { type: TokenType.Identifier, value: 'fn' },
            { type: TokenType.LeftParen, value: '(' },
            { type: TokenType.IntKeyword, value: 'int' },
            { type: TokenType.Identifier, value: 'g' },
            { type: TokenType.RightParen, value: ')' },
            { type: TokenType.LeftBrace, value: '{' },
            { type: TokenType.ReturnKeyword, value: 'return' },
            { type: TokenType.Identifier, value: 'g' },
            { type: TokenType.Plus, value: '+' },
            { type: TokenType.IntLiteral, value: '3' },
            { type: TokenType.Semicolon, value: ';' },
            { type: TokenType.RightBrace, value: '}' },
            { type: TokenType.IntKeyword, value: 'int' },
            { type: TokenType.Identifier, value: 'main' },
            { type: TokenType.LeftParen, value: '(' },
            { type: TokenType.RightParen, value: ')' },
            { type: TokenType.LeftBrace, value: '{' },
            { type: TokenType.IntKeyword, value: 'int' },
            { type: TokenType.Identifier, value: 'c' },
            { type: TokenType.Equal, value: '=' },
            { type: TokenType.Identifier, value: 'fn' },
            { type: TokenType.LeftParen, value: '(' },
            { type: TokenType.IntLiteral, value: '2' },
            { type: TokenType.RightParen, value: ')' },
            { type: TokenType.Semicolon, value: ';' },
            { type: TokenType.ReturnKeyword, value: 'return' },
            { type: TokenType.Identifier, value: 'c' },
            { type: TokenType.Semicolon, value: ';' },
            { type: TokenType.RightBrace, value: '}' },
        ];

        const expectedAST: FunctionDeclarationNode[] = [
            {
                type: 'FunctionDeclaration',
                identifier: {
                    type: 'Identifier',
                    value: 'fn',
                },
                parameters: [
                    {
                        type: 'Parameter',
                        identifier: {
                            type: 'Identifier',
                            value: 'g',
                        },
                    },
                ],
                body: [
                    {
                        type: 'ReturnStatement',
                        argument: {
                            type: 'BinaryExpression',
                            operator: '+',
                            left: {
                                type: 'Identifier',
                                value: 'g',
                            },
                            right: {
                                type: 'Literal',
                                value: '3',
                            },
                        },
                    },
                ],
            },
            {
                type: 'FunctionDeclaration',
                identifier: {
                    type: 'Identifier',
                    value: 'main',
                },
                parameters: [],
                body: [
                    {
                        type: 'VariableDeclaration',
                        identifier: {
                            type: 'Identifier',
                            value: 'c',
                        },
                        value: {
                            type: 'FunctionCall',
                            identifier: {
                                type: 'Identifier',
                                value: 'fn',
                            },
                            arguments: [
                                {
                                    type: 'Literal',
                                    value: '2',
                                },
                            ],
                        },
                    },
                    {
                        type: 'ReturnStatement',
                        argument: {
                            type: 'Identifier',
                            value: 'c',
                        },
                    },
                ],
            },
        ];

        const ast: ASTNode[] = parse(tokens);
        expect(ast).toEqual(expectedAST);
    });
});
