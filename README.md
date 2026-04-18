# jak uzyc?????

### kompiliren machen

```
cmake -B build
```

```
cmake --build build --config Release
```

```
alice.exe 0.0.0.0 8080 "A: DUPA WOLOWA"
```

```
bob.exe 127.0.0.1 8080 "B: TEST TEST"
```

### Evesdropping example

```
alice.exe 0.0.0.0 8080 "A: DUPA WOLOWA"
```

```
eve.exe 127.0.0.1 8080 8081
```

```
bob.exe 127.0.0.1 8081 "B: TEST TEST"
```

### PNS attack example

```
alice.exe 0.0.0.0 8080 "A: DUPA WOLOWA"
```

```
eve.exe 127.0.0.1 8080 8081 --pns
```

```
bob.exe 127.0.0.1 8081 "B: TEST TEST"
```

### DDoS attack example

```
alice.exe 0.0.0.0 8080 "A: DUPA WOLOWA"
```

```
eve.exe 127.0.0.1 8080 8081 --ddos
```

```
bob.exe 127.0.0.1 8081 "B: TEST TEST"
```