import { readFileSync } from 'fs';
import { compile } from '../src/silly';

describe('compile', () => {
    const testFilePath = './tests/inputs';

    test('should compile simple.c', () => {
        const code = readFileSync(`${testFilePath}/simple.c`, 'utf8');
        const expectedAssemblyCode = `section .data
section .text
global main
main:
push ebp
mov ebp, esp
sub esp, 20
mov dword [ebp -4], 5
mov dword [ebp -8], 10
mov dword [ebp -12], 3
mov eax, [ebp -8]
push eax
mov eax, [ebp -4]
pop ebx
add eax, ebx
mov [ebp -16], eax
mov eax, [ebp -12]
push eax
mov eax, [ebp -16]
pop ebx
xor edx, edx
idiv ebx
mov [ebp -20], eax
mov eax, [ebp -20]
mov [ebp  -4], eax
mov eax, [ebp -4]
mov esp, ebp
pop ebp
ret
`;

        const generatedCode = compile(code);
        expect(generatedCode).toEqual(expectedAssemblyCode);
    });

    test('should compile fn.c', () => {
        const code = readFileSync(`${testFilePath}/fn.c`, 'utf8');
        const expectedAssemblyCode = `section .data
section .text
global main
fn:
push ebp
mov ebp, esp
mov eax, 3
push eax
mov eax, [ebp +8]
pop ebx
add eax, ebx
mov esp, ebp
pop ebp
ret
main:
push ebp
mov ebp, esp
sub esp, 4
mov eax, 2
push eax
call fn
add esp, 4
mov [ebp -4], eax
mov eax, [ebp -4]
mov esp, ebp
pop ebp
ret
`;

        const generatedCode = compile(code);
        expect(generatedCode).toEqual(expectedAssemblyCode);
    });

    test('should compile if.c', () => {
        const code = readFileSync(`${testFilePath}/if.c`, 'utf8');
        const expectedAssemblyCode = `section .data
section .text
global main
main:
push ebp
mov ebp, esp
sub esp, 4
mov dword [ebp -4], 0
mov eax, [ebp -4]
test eax, eax
je end_if_0
mov eax, 9
push eax
mov eax, [ebp -4]
pop ebx
add eax, ebx
mov [ebp  -4], eax
end_if_0:
mov eax, 1
test eax, eax
je end_if_1
mov eax, 5
push eax
mov eax, [ebp -4]
pop ebx
add eax, ebx
mov [ebp  -4], eax
end_if_1:
mov eax, [ebp -4]
mov esp, ebp
pop ebp
ret
`;

        const generatedCode = compile(code);
        expect(generatedCode).toEqual(expectedAssemblyCode);
    });
});
