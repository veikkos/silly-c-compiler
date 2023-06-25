# Silly ChatGPT C compiler written in TypeScript

Messing around with ChatGPT and TypeScript. This is a very simple C compiler that compiles a very simple C program into x86 assembly code.

## Usage

```bash
$ npm install
$ npm run build
$ npm run start input.c

Generated Assembly Code:
main:
a dw 5
b dw 10
sum dw a + b
mov ax, sum
ret
```
