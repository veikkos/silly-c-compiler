import { ASTNode } from '../src/ast';
import { performSemanticAnalysis } from '../src/semantic';

describe('performSemanticAnalysis', () => {
    test('should not throw an error for a valid AST', () => {
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

        expect(() => performSemanticAnalysis(ast)).not.toThrow();
    });
});
