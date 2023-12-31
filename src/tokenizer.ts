export enum TokenType {
    IntKeyword = 'INT_KEYWORD',
    Identifier = 'IDENTIFIER',
    Equal = 'EQUAL',
    Semicolon = 'SEMICOLON',
    IntLiteral = 'INT_LITERAL',
    Plus = 'PLUS',
    Minus = 'MINUS',
    Multiply = 'MULTIPLY',
    Divide = 'DIVIDE',
    LeftBrace = 'LEFT_BRACE',
    RightBrace = 'RIGHT_BRACE',
    ReturnKeyword = 'RETURN_KEYWORD',
    LeftParen = 'LEFT_PAREN',
    RightParen = 'RIGHT_PAREN',
    Comma = 'COMMA',
    IfKeyword = 'IF_KEYWORD',
}

export interface Token {
    type: TokenType;
    value: string;
}

export function tokenize(code: string): Token[] {
    const tokens: Token[] = [];
    let cursor = 0;

    while (cursor < code.length) {
        const char = code[cursor];

        if (char === ' ' || char === '\n') {
            cursor++;
            continue;
        }

        if (char === '=') {
            tokens.push({ type: TokenType.Equal, value: char });
            cursor++;
            continue;
        }

        if (char === ';') {
            tokens.push({ type: TokenType.Semicolon, value: char });
            cursor++;
            continue;
        }

        if (char === '{') {
            tokens.push({ type: TokenType.LeftBrace, value: char });
            cursor++;
            continue;
        }

        if (char === '}') {
            tokens.push({ type: TokenType.RightBrace, value: char });
            cursor++;
            continue;
        }

        if (char === '(') {
            tokens.push({ type: TokenType.LeftParen, value: char });
            cursor++;
            continue;
        }

        if (char === ')') {
            tokens.push({ type: TokenType.RightParen, value: char });
            cursor++;
            continue;
        }

        if (char === ',') {
            tokens.push({ type: TokenType.Comma, value: char });
            cursor++;
            continue;
        }

        if (isLetter(char)) {
            let identifier = char;

            while (isLetterOrDigit(code[++cursor])) {
                identifier += code[cursor];
            }

            if (identifier === 'int') {
                tokens.push({ type: TokenType.IntKeyword, value: identifier });
            } else if (identifier === 'return') {
                tokens.push({
                    type: TokenType.ReturnKeyword,
                    value: identifier,
                });
            } else if (identifier === 'if') {
                tokens.push({ type: TokenType.IfKeyword, value: identifier });
            } else {
                tokens.push({ type: TokenType.Identifier, value: identifier });
            }

            continue;
        }

        if (isDigit(char)) {
            let number = char;

            while (isDigit(code[++cursor])) {
                number += code[cursor];
            }

            tokens.push({ type: TokenType.IntLiteral, value: number });
            continue;
        }

        if (char === '+') {
            tokens.push({ type: TokenType.Plus, value: char });
            cursor++;
            continue;
        }

        if (char === '-') {
            tokens.push({ type: TokenType.Minus, value: char });
            cursor++;
            continue;
        }

        if (char === '*') {
            tokens.push({ type: TokenType.Multiply, value: char });
            cursor++;
            continue;
        }

        if (char === '/') {
            tokens.push({ type: TokenType.Divide, value: char });
            cursor++;
            continue;
        }

        throw new Error(`Unexpected character: ${char}`);
    }

    return tokens;
}

function isLetter(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
}

function isDigit(char: string): boolean {
    return /[0-9]/.test(char);
}

function isLetterOrDigit(char: string): boolean {
    return isLetter(char) || isDigit(char);
}
