/**
 * Created by Tiago on 23/03/2015.
 */

CGHLab.Helpers = {

    deg2rad: function(angle)
    {
        var rad = angle*(Math.PI)/180;
        return rad;
    },

    rad2deg: function(angle)
    {
        var deg = angle*180/(Math.PI);
        return deg;
    }
}
