/**
 * Created by tiago on 3/12/15.
 */

CGHLab.HologramShaderLib = {

    'bipolar': {
        uniforms: {
            "color": { type: "c", value: new THREE.Color( 0x666666 ) }
        },
        vertexShader: [
            "void main(){",
            "   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
            "}"
        ].join('\n'),

        fragmentShader: [
            "uniform vec3 color;",
            "void main(){",
            "   gl_FragColor = vec4( color, 1.0 );",
            "}"
        ].join('\n')
    }
};