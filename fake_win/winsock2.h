#pragma once
typedef int SOCKET;
#define INVALID_SOCKET (-1)
#define SOCKET_ERROR (-1)
struct WSAData { int dummy; };
typedef WSAData WSADATA;
static inline int WSAStartup(int wVersionRequested, WSADATA* lpWSAData) { return 0; }
static inline int WSACleanup(void) { return 0; }
static inline int closesocket(SOCKET s) { extern int close(int); return close(s); }
#define MAKEWORD(a,b) ((a) | ((b)<<8))
