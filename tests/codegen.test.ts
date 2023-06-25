import { ASTNode } from '../src/ast';
import { generateAssemblyCode } from '../src/codegen';

describe('generateAssemblyCode', () => {
    test('should generate assembly code for a function declaration with variable declaration and return statement', () => {
        const ast: ASTNode = {
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

        const expectedAssemblyCode = `main:
a dw 3
mov ax, a add 10
ret
`;

        const generatedCode = generateAssemblyCode(ast);
        expect(generatedCode).toEqual(expectedAssemblyCode);
    });
});
