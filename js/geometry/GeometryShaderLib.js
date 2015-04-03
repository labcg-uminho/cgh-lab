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
            "   gl_FragColor = vec4( vec3(0.0,0.0,1.0), 0.5 );",
            "}"
        ].join('\n')
    }

};