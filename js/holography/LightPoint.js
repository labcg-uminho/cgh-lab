/**
 * Created by TiagoLuís on 02/03/2015.
 */

LightPoint = function( x, y, z)
{
    this.x = x;
    this.y = y;
    this.z = z;
    this.wave = new Wave();
};

LightPoint.prototype = {

    constructor: LightPoint
};
