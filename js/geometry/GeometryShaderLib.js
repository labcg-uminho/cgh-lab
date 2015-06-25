/**
 * Created by tiago on 3/30/15.
 */

CGHLab.GeometryShaderLib = {

    'sphereShader': {
        uniforms: {
            "origin": { type: "v3", value: new THREE.Vector3() },
            "plate": { type: "v3v", value: [ new THREE.Vector3() ]}
        },

        vertexShader: [
            "varying vec4 worldPosition;",
            "void main(){",
            "   worldPosition = modelMatrix * vec4( position, 1.0 );",
            "   gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );",
            "}"
        ].join('\n'),

        fragmentShader: [
            "uniform vec3 origin;",
            "uniform vec3 plate[4];",
            "varying vec4 worldPosition;",
            "bool check1(vec3 position){",
            "   if (position.z > (position.x - origin.x) * ((plate[0].z - origin.z)/(plate[0].x - origin.x)) + origin.z)",
            "       return false;",
            "   else",
            "       return true;",
            "}",
            "bool check2(vec3 position){",
            "   if (position.z < (position.x - origin.x) * ((plate[1].z - origin.z)/(plate[1].x - origin.x)) + origin.z)",
            "       return false;",
            "   else",
            "       return true;",
            "}",
            "bool check3(vec3 position){",
            "   vec3 op0 = plate[0] - origin;",
            "   vec3 op1 = plate[1] - origin;",
            "   vec3 n = cross(normalize(op0), normalize(op1));",
            "   float d = -(n.x * origin.x + n.y * origin.y + n.z * origin.z);",
            "   if (n.x * position.x + n.y * position.y + n.z * position.z + d > 0.0)",
            //"   if (position.y < (position.x - origin.x) * ((plate[0].y - origin.y)/(plate[0].x - origin.x)) + origin.y)",
            "       return false;",
            "   else",
            "       return true;",
            "}",
            "bool check4(vec3 position){",
            "   vec3 op2 = plate[2] - origin;",
            "   vec3 op3 = plate[3] - origin;",
            "   vec3 n = cross(normalize(op2), normalize(op3));",
            "   float d = -(n.x * origin.x + n.y * origin.y + n.z * origin.z);",
            "   if (n.x * position.x + n.y * position.y + n.z * position.z + d < 0.0)",
            "       return false;",
            "   else",
            "       return true;",
            "}",
            "void main(){",
            //"   if(worldPosition.y > 160.0 || worldPosition.y < 0.0) discard;",
            "   if(worldPosition.z < 0.0 || worldPosition.x > 80.0) discard;",
            "   if(check1(worldPosition.xyz) || check2(worldPosition.xyz)) discard;",
            "   if(check3(worldPosition.xyz) || check4(worldPosition.xyz)) discard;",
            "   gl_FragColor = vec4( vec3(0.5,0.5,1.0), 0.5 );",
            "}"
        ].join('\n')
    },

    'myLambertSphere': {

        uniforms: THREE.UniformsUtils.merge( [

            THREE.UniformsLib[ "common" ],
            THREE.UniformsLib[ "fog" ],
            THREE.UniformsLib[ "lights" ],
            THREE.UniformsLib[ "shadowmap" ],

            {
                "ambient"  : { type: "c", value: new THREE.Color( 0xffffff ) },
                "emissive" : { type: "c", value: new THREE.Color( 0x000000 ) },
                "wrapRGB"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },
                "origin": { type: "v3", value: new THREE.Vector3() },
                "plate": { type: "v3v", value: [ new THREE.Vector3() ]}
            }

        ] ),

        vertexShader: [

            "#define MYLAMBERT",

            "varying vec3 vLightFront;",

            "varying vec4 worldPosition;",

            "#ifdef DOUBLE_SIDED",

            "	varying vec3 vLightBack;",

            "#endif",

            THREE.ShaderChunk[ "map_pars_vertex" ],
            THREE.ShaderChunk[ "lightmap_pars_vertex" ],
            THREE.ShaderChunk[ "envmap_pars_vertex" ],
            THREE.ShaderChunk[ "lights_lambert_pars_vertex" ],
            THREE.ShaderChunk[ "color_pars_vertex" ],
            THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
            THREE.ShaderChunk[ "skinning_pars_vertex" ],
            THREE.ShaderChunk[ "shadowmap_pars_vertex" ],
            THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],

            "void main() {",

            "   worldPosition = modelMatrix * vec4( position, 1.0 );",

            THREE.ShaderChunk[ "map_vertex" ],
            THREE.ShaderChunk[ "lightmap_vertex" ],
            THREE.ShaderChunk[ "color_vertex" ],

            THREE.ShaderChunk[ "morphnormal_vertex" ],
            THREE.ShaderChunk[ "skinbase_vertex" ],
            THREE.ShaderChunk[ "skinnormal_vertex" ],
            THREE.ShaderChunk[ "defaultnormal_vertex" ],

            THREE.ShaderChunk[ "morphtarget_vertex" ],
            THREE.ShaderChunk[ "skinning_vertex" ],
            THREE.ShaderChunk[ "default_vertex" ],
            THREE.ShaderChunk[ "logdepthbuf_vertex" ],

            THREE.ShaderChunk[ "worldpos_vertex" ],
            THREE.ShaderChunk[ "envmap_vertex" ],
            THREE.ShaderChunk[ "lights_lambert_vertex" ],
            THREE.ShaderChunk[ "shadowmap_vertex" ],

            "}"

        ].join("\n"),

        fragmentShader: [

            "uniform float opacity;",

            "uniform vec3 origin;",
            "uniform vec3 plate[4];",
            "varying vec4 worldPosition;",

            "varying vec3 vLightFront;",

            "#ifdef DOUBLE_SIDED",

            "	varying vec3 vLightBack;",

            "#endif",

            THREE.ShaderChunk[ "color_pars_fragment" ],
            THREE.ShaderChunk[ "map_pars_fragment" ],
            THREE.ShaderChunk[ "alphamap_pars_fragment" ],
            THREE.ShaderChunk[ "lightmap_pars_fragment" ],
            THREE.ShaderChunk[ "envmap_pars_fragment" ],
            THREE.ShaderChunk[ "fog_pars_fragment" ],
            THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
            THREE.ShaderChunk[ "specularmap_pars_fragment" ],
            THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],

            "bool check1(vec3 position){",
            "   if (position.z > (position.x - origin.x) * ((plate[0].z - origin.z)/(plate[0].x - origin.x)) + origin.z)",
            "       return false;",
            "   else",
            "       return true;",
            "}",

            "bool check2(vec3 position){",
            "   if (position.z < (position.x - origin.x) * ((plate[1].z - origin.z)/(plate[1].x - origin.x)) + origin.z)",
            "       return false;",
            "   else",
            "       return true;",
            "}",

            "bool check3(vec3 position){",
            "   vec3 op0 = plate[0] - origin;",
            "   vec3 op1 = plate[1] - origin;",
            "   vec3 n = cross(normalize(op0), normalize(op1));",
            "   float d = -(n.x * origin.x + n.y * origin.y + n.z * origin.z);",
            "   if (n.x * position.x + n.y * position.y + n.z * position.z + d > 0.0)",
            //"   if (position.y < (position.x - origin.x) * ((plate[0].y - origin.y)/(plate[0].x - origin.x)) + origin.y)",
            "       return false;",
            "   else",
            "       return true;",
            "}",

            "bool check4(vec3 position){",
            "   vec3 op2 = plate[2] - origin;",
            "   vec3 op3 = plate[3] - origin;",
            "   vec3 n = cross(normalize(op2), normalize(op3));",
            "   float d = -(n.x * origin.x + n.y * origin.y + n.z * origin.z);",
            "   if (n.x * position.x + n.y * position.y + n.z * position.z + d < 0.0)",
            "       return false;",
            "   else",
            "       return true;",
            "}",

            "void main() {",

            "   if(worldPosition.z < 0.0 || worldPosition.x > 80.0) discard;",
            "   if(check1(worldPosition.xyz) || check2(worldPosition.xyz)) discard;",
            "   if(check3(worldPosition.xyz) || check4(worldPosition.xyz)) discard;",

            "	gl_FragColor = vec4( vec3( 0.5, 0.5, 1.0 ), opacity );",

            THREE.ShaderChunk[ "logdepthbuf_fragment" ],
            THREE.ShaderChunk[ "map_fragment" ],
            THREE.ShaderChunk[ "alphamap_fragment" ],
            THREE.ShaderChunk[ "alphatest_fragment" ],
            THREE.ShaderChunk[ "specularmap_fragment" ],

            "	#ifdef DOUBLE_SIDED",

            //"float isFront = float( gl_FrontFacing );",
            //"gl_FragColor.xyz *= isFront * vLightFront + ( 1.0 - isFront ) * vLightBack;",

            "		if ( gl_FrontFacing )",
            "			gl_FragColor.xyz *= vLightFront;",
            "		else",
            "			gl_FragColor.xyz *= vLightBack;",

            "	#else",

            "		gl_FragColor.xyz *= vLightFront;",

            "	#endif",

            THREE.ShaderChunk[ "lightmap_fragment" ],
            THREE.ShaderChunk[ "color_fragment" ],
            THREE.ShaderChunk[ "envmap_fragment" ],
            THREE.ShaderChunk[ "shadowmap_fragment" ],

            THREE.ShaderChunk[ "linear_to_gamma_fragment" ],

            THREE.ShaderChunk[ "fog_fragment" ],

            "}"

        ].join("\n")

    },

    'myLambertLaser': {

        uniforms: THREE.UniformsUtils.merge( [

            THREE.UniformsLib[ "common" ],
            THREE.UniformsLib[ "fog" ],
            THREE.UniformsLib[ "lights" ],
            THREE.UniformsLib[ "shadowmap" ],

            {
                "ambient"  : { type: "c", value: new THREE.Color( 0xffffff ) },
                "emissive" : { type: "c", value: new THREE.Color( 0x000000 ) },
                "wrapRGB"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },
                "limit": { type: "f", value: 1},
                "mirror": {type: "v3v", value: [ new THREE.Vector3( 1, 1, 1) ] },
                "referenceWaveAngle": { type: "f", value: 45 },
                "beam": {type: "v3v", value: [ new THREE.Vector3( 1, 1, 1) ]}
            }

        ] ),

        vertexShader: [

            "#define MYLAMBERT",

            "varying vec3 vLightFront;",

            "varying vec4 worldPosition;",

            "#ifdef DOUBLE_SIDED",

            "	varying vec3 vLightBack;",

            "#endif",

            THREE.ShaderChunk[ "map_pars_vertex" ],
            THREE.ShaderChunk[ "lightmap_pars_vertex" ],
            THREE.ShaderChunk[ "envmap_pars_vertex" ],
            THREE.ShaderChunk[ "lights_lambert_pars_vertex" ],
            THREE.ShaderChunk[ "color_pars_vertex" ],
            THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
            THREE.ShaderChunk[ "skinning_pars_vertex" ],
            THREE.ShaderChunk[ "shadowmap_pars_vertex" ],
            THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],

            "void main() {",

            "   worldPosition = modelMatrix * vec4( position, 1.0 );",

            THREE.ShaderChunk[ "map_vertex" ],
            THREE.ShaderChunk[ "lightmap_vertex" ],
            THREE.ShaderChunk[ "color_vertex" ],

            THREE.ShaderChunk[ "morphnormal_vertex" ],
            THREE.ShaderChunk[ "skinbase_vertex" ],
            THREE.ShaderChunk[ "skinnormal_vertex" ],
            THREE.ShaderChunk[ "defaultnormal_vertex" ],

            THREE.ShaderChunk[ "morphtarget_vertex" ],
            THREE.ShaderChunk[ "skinning_vertex" ],
            THREE.ShaderChunk[ "default_vertex" ],
            THREE.ShaderChunk[ "logdepthbuf_vertex" ],

            THREE.ShaderChunk[ "worldpos_vertex" ],
            THREE.ShaderChunk[ "envmap_vertex" ],
            THREE.ShaderChunk[ "lights_lambert_vertex" ],
            THREE.ShaderChunk[ "shadowmap_vertex" ],

            "}"

        ].join("\n"),

        fragmentShader: [

            "uniform float opacity;",

            "uniform float limit;",
            "uniform vec3 mirror[2];",
            "uniform vec3 beam[3];",
            "uniform float referenceWaveAngle;",
            "varying vec4 worldPosition;",

            "varying vec3 vLightFront;",

            "#ifdef DOUBLE_SIDED",

            "	varying vec3 vLightBack;",

            "#endif",

            THREE.ShaderChunk[ "color_pars_fragment" ],
            THREE.ShaderChunk[ "map_pars_fragment" ],
            THREE.ShaderChunk[ "alphamap_pars_fragment" ],
            THREE.ShaderChunk[ "lightmap_pars_fragment" ],
            THREE.ShaderChunk[ "envmap_pars_fragment" ],
            THREE.ShaderChunk[ "fog_pars_fragment" ],
            THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
            THREE.ShaderChunk[ "specularmap_pars_fragment" ],
            THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],

            "bool checkMirror(vec3 position){",
            "   const float pi = 3.1415926535897932384626433832795;",
            "   if(referenceWaveAngle < pi/4.0){",
            "       if (position.z < (position.x - mirror[0].x) * ((mirror[1].z - mirror[0].z)/(mirror[1].x - mirror[0].x)) + mirror[0].z)",
            "           return false;",
            "       else",
            "           return true;",
            "   }",
            "   else{",
            "       if (position.z > (position.x - mirror[0].x) * ((mirror[1].z - mirror[0].z)/(mirror[1].x - mirror[0].x)) + mirror[0].z)",
            "           return false;",
            "       else",
            "           return true;",
            "   }",
            "}",

            /*"bool checkBeamLaser(vec3 position){",
            "   if (position.z < (position.x - beam[0].x) * ((beam[1].z - beam[0].z)/(beam[1].x - beam[0].x)) + beam[0].z)",
            "       return false;",
            "   else",
            "       return true;",
            "}",

            "bool checkBeamLaser2(vec3 position){",
            "   if (position.z > (position.x - beam[2].x) * ((beam[3].z - beam[2].z)/(beam[3].x - beam[2].x)) + beam[2].z)",
            "       return false;",
            "   else",
            "       return true;",
            "}",*/

            "bool checkBeamDuplicate(vec3 position){",
            "   if (position.z < (position.x - beam[0].x) * ((beam[2].z - beam[0].z)/(beam[2].x - beam[0].x)) + beam[0].z)",
            "       return false;",
            "   else",
            "       return true;",
            "}",

            "void main() {",
            //"   if(limit == 0.0){",
            //"       if(checkBeamLaser(worldPosition.xyz) && checkBeamLaser2(worldPosition.xyz)) discard;",
            //"   }",
            "   if(limit == 1.0){",
            "       if(checkMirror(worldPosition.xyz)) discard;",
            "       if(checkBeamDuplicate(worldPosition.xyz)) discard;",
            "   }",
            "   else if(limit == 2.0){",
            //"       if(worldPosition.z < 0.0) discard;",
            "       if(checkMirror(worldPosition.xyz)) discard;",
            "   }",
            "   else if(limit == 3.0){",
            "       if(worldPosition.z < 0.0) discard;",
            "   }",

            "	gl_FragColor = vec4( vec3( 0.5, 0.5, 1.0 ), opacity );",

            THREE.ShaderChunk[ "logdepthbuf_fragment" ],
            THREE.ShaderChunk[ "map_fragment" ],
            THREE.ShaderChunk[ "alphamap_fragment" ],
            THREE.ShaderChunk[ "alphatest_fragment" ],
            THREE.ShaderChunk[ "specularmap_fragment" ],

            "	#ifdef DOUBLE_SIDED",

            //"float isFront = float( gl_FrontFacing );",
            //"gl_FragColor.xyz *= isFront * vLightFront + ( 1.0 - isFront ) * vLightBack;",

            "		if ( gl_FrontFacing )",
            "			gl_FragColor.xyz *= vLightFront;",
            "		else",
            "			gl_FragColor.xyz *= vLightBack;",

            "	#else",

            "		gl_FragColor.xyz *= vLightFront;",

            "	#endif",

            THREE.ShaderChunk[ "lightmap_fragment" ],
            THREE.ShaderChunk[ "color_fragment" ],
            THREE.ShaderChunk[ "envmap_fragment" ],
            THREE.ShaderChunk[ "shadowmap_fragment" ],

            THREE.ShaderChunk[ "linear_to_gamma_fragment" ],

            THREE.ShaderChunk[ "fog_fragment" ],

            "}"

        ].join("\n")

    }

};