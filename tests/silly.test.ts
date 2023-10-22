import { readFileSync } from 'fs';
import { compile } from '../src/silly';

describe('compile', () => {
    const testFilePath = './tests/inputs';

    test('should compile simple.c', () => {
        const code = readFileSync(`${testFilePath}/simple.c`, 'utf8');
        const expectedAssemblyCode = `section .data
a dd 5
b dd 10
c dd 3
sum dd 0
another dd 0
section .text
global main
main:
mov eax, [b]
push eax
mov eax, [a]
pop ebx
add eax, ebx
mov [sum], eax
mov eax, [c]
push eax
mov eax, [sum]
pop ebx
xor edx, edx
idiv ebx
mov [another], eax
mov eax, [another]
mov [a], eax
mov eax, [a]
ret
`;

        const generatedCode = compile(code);
        expect(generatedCode).toEqual(expectedAssemblyCode);
    });

    test('should compile fn.c', () => {
        const code = readFileSync(`${testFilePath}/fn.c`, 'utf8');
        const expectedAssemblyCode = `section .data
c dd 0
section .text
global main
fn:
push ebp
mov ebp, esp
mov eax, 3
push eax
mov eax, [ebp + 8]
pop ebx
add eax, ebx
mov esp, ebp
pop ebp
ret
main:
mov eax, 2
push eax
call fn
add esp, 4
mov [c], eax
mov eax, [c]
ret
`;

        const generatedCode = compile(code);
        expect(generatedCode).toEqual(expectedAssemblyCode);
    });
});
