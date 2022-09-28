# simpleSolar
Just a simple rendering example


# Environment Setup


## Latest Vulkan SDK

This repository tries to always be up to date with the latest Vulkan SDK, therefore we suggest to download and install it.
Version 1.2.162.0 and up has ray tracing extensions support.

**Vulkan SDK**: https://vulkan.lunarg.com/sdk/home


## CMake

The CMakefile will use other makefiles from `nvpro_core` and look for Vulkan environment variables for the installation of the SDK. Therefore, it is important to have all the above installed before running Cmake in the 
root directory.


