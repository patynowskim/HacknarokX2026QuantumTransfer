#pragma once

#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <netdb.h>

#ifndef SOCKET
#define SOCKET int
#define INVALID_SOCKET (-1)
#define SOCKET_ERROR (-1)
#endif

#ifndef WSADATA_DEFINED
#define WSADATA_DEFINED
struct WSAData { int dummy; };
typedef WSAData WSADATA;
#endif

static inline int WSAStartup(int wVersionRequested, WSADATA* lpWSAData) { return 0; }
static inline int WSACleanup(void) { return 0; }

#ifndef closesocket
#define closesocket close
#endif

#ifndef MAKEWORD
#define MAKEWORD(a,b) ((a) | ((b)<<8))
#endif
