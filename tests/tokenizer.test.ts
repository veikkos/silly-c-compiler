import { tokenize, Token, TokenType } from '../src/tokenizer';

describe('tokenize', () => {
    test('should tokenize a simple C code', () => {
        const code = `
            int main() {
                int a = 5;
                return a + 10;
            }
        `;

        const expectedTokens: Token[] = [
            { type: TokenType.IntKeyword, value: 'int' },
            { type: TokenType.Identifier, value: 'main' },
            { type: TokenType.LeftParen, value: '(' },
            { type: TokenType.RightParen, value: ')' },
            { type: TokenType.LeftBrace, value: '{' },
            { type: TokenType.IntKeyword, value: 'int' },
            { type: TokenType.Identifier, value: 'a' },
            { type: TokenType.Equal, value: '=' },
            { type: TokenType.IntLiteral, value: '5' },
            { type: TokenType.Semicolon, value: ';' },
            { type: TokenType.ReturnKeyword, value: 'return' },
            { type: TokenType.Identifier, value: 'a' },
            { type: TokenType.Plus, value: '+' },
            { type: TokenType.IntLiteral, value: '10' },
            { type: TokenType.Semicolon, value: ';' },
            { type: TokenType.RightBrace, value: '}' },
        ];

        const tokens = tokenize(code);
        expect(tokens).toEqual(expectedTokens);
    });

    test('should tokenize code with whitespace and newlines', () => {
        const code = `int a = 5;\nint b = 10;`;

        const expectedTokens: Token[] = [
            { type: TokenType.IntKeyword, value: 'int' },
            { type: TokenType.Identifier, value: 'a' },
            { type: TokenType.Equal, value: '=' },
            { type: TokenType.IntLiteral, value: '5' },
            { type: TokenType.Semicolon, value: ';' },
            { type: TokenType.IntKeyword, value: 'int' },
            { type: TokenType.Identifier, value: 'b' },
            { type: TokenType.Equal, value: '=' },
            { type: TokenType.IntLiteral, value: '10' },
            { type: TokenType.Semicolon, value: ';' },
        ];

        const tokens = tokenize(code);
        expect(tokens).toEqual(expectedTokens);
    });

    test('should tokenize several functions', () => {
        const code = `
            int fn(int g) {
                return g + 3;
            }

            int main() {
                int c = fn(2);
                return c;
            }
        `;

        const expectedTokens: Token[] = [
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

        const tokens = tokenize(code);
        expect(tokens).toEqual(expectedTokens);
    });
});
