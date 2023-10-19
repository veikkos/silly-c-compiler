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

        const expectedAssemblyCode = `section .data
a dd 3
section .text
global main
main:
mov eax, 10
push eax
mov eax, [a]
pop ebx
add eax, ebx
ret
`;

        const generatedCode = generateAssemblyCode(ast);
        expect(generatedCode).toEqual(expectedAssemblyCode);
    });
});
