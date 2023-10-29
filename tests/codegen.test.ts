import { ASTNode } from '../src/ast';
import { generateAssemblyCode } from '../src/codegen';

describe('generateAssemblyCode', () => {
    test('should generate assembly code for a function declaration with variable declaration and return statement', () => {
        const ast: ASTNode[] = [
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

        const expectedAssemblyCode = `section .data
section .bss
section .text
global main
main:
push ebp
mov ebp, esp
sub esp, 4
mov dword [ebp -4], 3
mov eax, 10
push eax
mov eax, [ebp -4]
pop ebx
add eax, ebx
mov esp, ebp
pop ebp
ret
`;

        const generatedCode = generateAssemblyCode(ast);
        expect(generatedCode).toEqual(expectedAssemblyCode);
    });
});
