cmake_minimum_required(VERSION 3.15)
project(MLKEM_Exchange C CXX)

set(CMAKE_CXX_STANDARD 17)

# Fetch liboqs automatically
include(FetchContent)
FetchContent_Declare(
  liboqs
  GIT_REPOSITORY https://github.com/open-quantum-safe/liboqs.git
  GIT_TAG main
)

# Configure liboqs for minimal build without OpenSSL or tests to speed up compile
set(OQS_BUILD_ONLY_LIB ON CACHE BOOL "" FORCE)
set(OQS_USE_OPENSSL OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(liboqs)

# Alice (Server)
add_executable(alice alice.cpp)
target_link_libraries(alice PRIVATE oqs ws2_32)
target_include_directories(alice PRIVATE ${liboqs_SOURCE_DIR}/src)

# Bob (Client)
add_executable(bob bob.cpp)
target_link_libraries(bob PRIVATE oqs ws2_32)
target_include_directories(bob PRIVATE ${liboqs_SOURCE_DIR}/src)


# Eve (Evesdropper)
add_executable(eve eve.cpp)
target_link_libraries(eve PRIVATE oqs ws2_32)
target_include_directories(eve PRIVATE ${liboqs_SOURCE_DIR}/src)
