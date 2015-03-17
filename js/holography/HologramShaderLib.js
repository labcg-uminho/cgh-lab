/**
 * Created by tiago on 3/12/15.
 */

CGHLab.HologramShaderLib = {

    'bipolar': {
        uniforms: {
            "color": { type: "c", value: new THREE.Color( 0x666666 ) },
            "lightPoints": { type: "v4v", value: [ new THREE.Vector4() ] },
            "n_lightPoints": { type: "i", value: 1 },
            "horizCycleLength": { type: "f", value: 0 },
            "waveLength": { type: "f", value: 1 }
        },
        vertexShader: [
            "varying vec4 worldPosition;",
            "void main(){",
            "   worldPosition = modelMatrix * vec4( position, 1.0 );",
            "   gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );",
            "}"
        ].join('\n'),

        fragmentShader: [
            "uniform vec3 color;",
            "uniform int n_lightPoints;",
            "uniform vec4 lightPoints[512];",
            "uniform float horizCycleLength;",
            "uniform float waveLength;",
            "varying vec4 worldPosition;",
            "void main(){",
            "   const float tau = 6.283185307179586476925286766559;",
            "   float refArrivalPhase = 0.0;",
            "   float perWaveAmplitude[128];",
            "   float totalAmplitude = 0.0;",
            "   float totalIntensity = 0.0;",
            "   float normalizedIntensity = 0.0;",

            "   refArrivalPhase = tau * ( worldPosition.x / horizCycleLength );",
            "   float refAmplitude = cos(refArrivalPhase);",
            "   float k = tau / waveLength;",

            "   for(int i = 0; i < 1024; i++){",
            "       vec3 wP = vec3(worldPosition.x, worldPosition.y, worldPosition.z);",
            //"       vec3 lP = vec3(lightPoints[0].x, lightPoints[0].y, lightPoints[0].z);",
            "       float d = distance(lightPoints[i].xyz, wP);",
            "       float objArrivalPhase = (d - lightPoints[i].w) * k;",
            //"       perWaveAmplitude[i] = cos(objArrivalPhase);",
            //"       totalAmplitude += perWaveAmplitude[i];",
            "       totalIntensity += cos(objArrivalPhase - refArrivalPhase);",
            "       normalizedIntensity = totalIntensity / (n_lightPoints*2.0) + 0.5;",
            "       if (i == n_lightPoints) break;",
            "   }",
            "   gl_FragColor = vec4( color, 1.0 );",
            "}"
        ].join('\n')
    }
};