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
            "uniform vec3 plate[2];",
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
            "void main(){",
            "   if(worldPosition.y > 160.0 || worldPosition.y < 0.0) discard;",
            "   if(worldPosition.z < 0.0 || worldPosition.x > 80.0) discard;",
            "   if(check1(worldPosition.xyz) || check2(worldPosition.xyz)) discard;",
            "   gl_FragColor = vec4( vec3(1.0), 0.5 );",
            "}"
        ].join('\n')
    }

};