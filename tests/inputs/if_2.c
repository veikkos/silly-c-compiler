int zero() {
    return 0;
}

int one() {
    return 1;
}

int main() {
    int c = 0;
    if (zero()) {
        c = c + 9;
    }
    if (zero() + 1) {
        c = c + 2;
    }
    if (one()) {
        c = c + 3;
    }
    return c;
}
