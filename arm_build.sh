/usr/bin/cmake -B build -DFORCE_GENERIC=ON

C_INCLUDE_PATH=$PWD/fake_win CPLUS_INCLUDE_PATH=$PWD/fake_win /usr/bin/cmake --build build --config Release -j 4

**Alice:**
```bash
./build/alice 0.0.0.0 8080 "A: DUPA WOLOWA"
```

**Bob:**
```bash
./build/bob 127.0.0.1 8080 "B: TEST TEST"
```