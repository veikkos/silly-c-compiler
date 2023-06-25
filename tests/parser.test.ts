import { Token, TokenType } from '../src/lexer';
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

        const expectedAST: FunctionDeclarationNode = {
            type: 'FunctionDeclaration',
            identifier: {
                type: 'Identifier',
                value: 'main',
            },
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
        };

        const ast: ASTNode = parse(tokens);
        expect(ast).toEqual(expectedAST);
    });
});
