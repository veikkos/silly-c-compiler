# Silly ChatGPT C compiler written in TypeScript

[![Build](https://github.com/veikkos/silly-chatgpt-c-compiler/actions/workflows/build.yml/badge.svg)](https://github.com/veikkos/silly-chatgpt-c-compiler/actions/workflows/build.yml)

Messing around with ChatGPT and TypeScript. This is a very simple C compiler that compiles a very simple C program into x86 assembly code.

## Usage

```bash
$ npm install
$ npm run build
$ npm run start tests/inputs/simple.c

section .data
a dd 5
b dd 10
c dd 3
sum dd 0
another dd 0
section .text
global main
main:
mov eax, [b]

[...]

mov [a], eax
mov eax, [a]
ret

Writing to simple.asm
```

The generated assembly code can be assembled and linked with `nasm` and `gcc` (32-bit only):

```
nasm -f elf32 simple.asm -o simple.o
gcc -m32 -o simple simple.o
```

And finally the executable can be run and the output checked:

```
./simple
echo $? # Should print 5
```
