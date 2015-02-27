/**
 * Created by TiagoLuís on 27/02/2015.
 */

HoloObject = function ( position, rotation )
{
    this.position = position;
    this.rotation = rotation;

    this.object = new THREE.Mesh;
};

HoloObject.prototype = {

    constructor: HoloObject,

    setObject: function( geometry )
    {
        var objectGeometry;
        if (geometry == 'cube') objectGeometry = new THREE.BoxGeometry(1, 1, 1);
        else if (geometry == 'sphere') objectGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        var objectMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 , ambient: 0x00ff00});
        this.object = new THREE.Mesh(objectGeometry, objectMaterial);
        this.object.scale.set(3,3,3);
        this.object.position.set(this.position.x, this.position.y, this.position.z);
        this.object.rotateY(this.rotation);
        this.object.name = 'object';
    }

};