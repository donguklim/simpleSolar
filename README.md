# simpleSolar
Just a simple rendering example


## How to enable Draco mesh compression
In order to enable support for loading Draco compressed glTF files you need to:
- Clone and build https://github.com/google/draco as per their [build instructions](https://github.com/google/draco#building)
- Copy the Draco decoder library ```draco.lib``` into ```libs\draco```
- Copy the ```include``` folder contents into ```external\draco```, make sure the ```draco_features.h``` is also present
- If everything is in place, running CMake will output ```Draco mesh compression enabled``` and loading Draco compressed meshes will work out of the box