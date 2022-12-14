/*
 * Copyright (c) 2019-2021, NVIDIA CORPORATION.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-FileCopyrightText: Copyright (c) 2019-2021 NVIDIA CORPORATION
 * SPDX-License-Identifier: Apache-2.0
 */

#version 450
#extension GL_ARB_separate_shader_objects : enable
#extension GL_EXT_nonuniform_qualifier : enable
#extension GL_GOOGLE_include_directive : enable
#extension GL_EXT_scalar_block_layout : enable

#extension GL_EXT_shader_explicit_arithmetic_types_int64 : require
#extension GL_EXT_buffer_reference2 : require

#include "wavefront.glsl"


layout(push_constant) uniform _PushConstantRaster
{
  PushConstantRaster pcRaster;
};

// clang-format off
// Incoming 
layout(location = 1) in vec3 i_worldPos;
layout(location = 2) in vec3 i_worldNrm;
layout(location = 3) in vec3 i_viewDir;
layout(location = 4) in vec2 i_texCoord;
// Outgoing
layout(location = 0) out vec4 o_color;

layout(buffer_reference, scalar) buffer Vertices {Vertex v[]; }; // Positions of an object
layout(buffer_reference, scalar) buffer Indices {uint i[]; }; // Triangle indices

layout(binding = eObjDescs, scalar) buffer ObjDesc_ { ObjDesc i[]; } objDesc;
layout(binding = eTextures) uniform sampler2D[] textureSamplers;
// clang-format on


void main()
{
    ObjDesc    sunDesc = objDesc.i[eSun];
    ObjDesc    earthDesc = objDesc.i[eEarth];
    ObjDesc    moonDesc = objDesc.i[eMoon];

    vec3 otherPlanetsPos[2];
    float otherPlanetsRadius[2];

    uint planetType;
  
    vec3 sunPos = vec3(pcRaster.sunMatrix * vec4(0.0f, 0.0f, 0.0f, 1.0f));

    if (moonDesc.indexOffset <= gl_PrimitiveID * 3)
    {
        planetType = eMoon;
    }

    else if (earthDesc.indexOffset <= gl_PrimitiveID * 3)
    {
        planetType = eEarth;
    }
    else
    {
        planetType = eSun;

    }

    // Diffuse
    vec3 diffuse = texture(textureSamplers[objDesc.i[planetType].txtOffset], i_texCoord).xyz;

    if(planetType == eSun)
    {
        o_color = vec4(diffuse, 1);
        return;
    }

    vec3 otherPlanetPos;
    float otherPlanetRadius;

    vec3 normal = normalize(i_worldNrm);

    if(planetType == eEarth)
    {
        vec3 textNormal = texture(textureSamplers[earthDesc.txtOffset + 1], i_texCoord).xyz;
        vec3 tangent, bitangent;
        createCoordinateSystem(normal, tangent, bitangent);
        normal = textNormal.y * bitangent + textNormal.x * tangent + textNormal.z * normal;

        otherPlanetPos = vec3(pcRaster.moonMatrix * vec4(0.0f, 0.0f, 0.0f, 1.0f));
        otherPlanetRadius = moonDesc.planetRadius;
    }
    else 
    {
        otherPlanetPos = vec3(pcRaster.earthMatrix * vec4(0.0f, 0.0f, 0.0f, 1.0f));
        otherPlanetRadius = earthDesc.planetRadius;
    }

    vec3  L;

    vec3 lightVec = sunPos - i_worldPos;
    float d = length(lightVec);
    //lightIntensity = pcRaster.lightIntensity / (d * d);
    vec3 lightDir = normalize(lightVec);
    float dotNL = max(dot(normal, lightDir), 0.02);

    float otherPlanetProj = dot(otherPlanetPos - i_worldPos, lightDir);
    if (otherPlanetProj > 0 && length(i_worldPos + otherPlanetProj * lightDir  - otherPlanetPos) < otherPlanetRadius)
    {
        dotNL = 0.02;
    }

  // Result
  o_color = vec4(diffuse * dotNL, 1);
}
