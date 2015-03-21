/**
 * Created by tiago on 3/21/15.
 */

CGHLab.ObjectPerspective = function( position, rotation, object, center, referenceWave ){
    this.scene = new THREE.Scene();

    this.position = position;
    this.rotation = rotation;

    this.object = object;

    this.center = center;

    this.referenceWave = referenceWave;
};

CGHLab.ObjectPerspective.prototype = {

    constructor: CGHLab.ObjectPerspective,

    updateParameters: function( object, referenceWave )
    {
        this.referenceWave = referenceWave;
        this.object = object;

        this.scene = new THREE.Scene();

        this.init();
    },

    init: function()
    {
        var axes = new THREE.AxisHelper(100);
        this.scene.add( axes );
        this.scene.add(this.object.object);

        var ambLight = new THREE.AmbientLight( 0x505050 );
        //var light = new THREE.PointLight( 0xffffff, 1);
        var light = new THREE.PointLight(0xffffff, 1);
        light.position.set( this.center.x, 500, this.center.z);
        this.scene.add( ambLight );
        this.scene.add( light );
    }

};