cmake_minimum_required(VERSION 3.15)
project(MLKEM_Exchange C CXX)

set(CMAKE_CXX_STANDARD 17)

# 1. Configuration Toggle
option(FORCE_GENERIC "Force generic build" OFF)

if(FORCE_GENERIC)
    message(STATUS "Generic build forced. Using OQS_OPT_TARGET=generic")
    
    # Zamiast OQS_PORTABLE_BUILD używamy tych trzech flag:
    set(OQS_OPT_TARGET "generic" CACHE STRING "" FORCE)
    set(OQS_DIST_BUILD OFF CACHE BOOL "" FORCE)
    set(OQS_BUILD_ONLY_LIB ON CACHE BOOL "" FORCE)

    # Wyłączamy absolutnie wszystkie silniki optymalizacji
    set(OQS_ENABLE_AES_NI OFF CACHE BOOL "" FORCE)
    set(OQS_ENABLE_AVX OFF CACHE BOOL "" FORCE)
    set(OQS_ENABLE_AVX2 OFF CACHE BOOL "" FORCE)
    set(OQS_ENABLE_AVX512 OFF CACHE BOOL "" FORCE)
    set(OQS_ENABLE_SSE2 OFF CACHE BOOL "" FORCE)
    set(OQS_ENABLE_SHA3_x86_64_AVX2 OFF CACHE BOOL "" FORCE)
    
    # To makro wstrzykujemy do kompilatora (często pomaga uciszyć kod C)
    add_compile_definitions(OQS_PORTABLE_BUILD=1)
endif()

set(OQS_USE_OPENSSL OFF CACHE BOOL "" FORCE)

# 2. Fetch and Configure
include(FetchContent)
FetchContent_Declare(
  liboqs
  GIT_REPOSITORY https://github.com/open-quantum-safe/liboqs.git
  GIT_TAG main
)
# MakeAvailable wywoła konfigurację liboqs
FetchContent_MakeAvailable(liboqs)

# 3. Setup targets
function(setup_oqs_target target)
    add_executable(${target} ${target}.cpp)
    target_link_libraries(${target} PRIVATE oqs)
    
    if(WIN32)
        target_link_libraries(${target} PRIVATE ws2_32)
    endif()
    
    target_include_directories(${target} PRIVATE 
        ${liboqs_SOURCE_DIR}/src 
        ${liboqs_BINARY_DIR}/include
    )
endfunction()

setup_oqs_target(alice)
setup_oqs_target(bob)
setup_oqs_target(eve)
