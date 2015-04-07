/**
 * Created by Tiago on 23/03/2015.
 */

CGHLab.Helpers = {

    deg2rad: function (angle) {
        var rad = angle * (Math.PI) / 180;
        return rad;
    },

    rad2deg: function (angle) {
        var deg = angle * 180 / (Math.PI);
        return deg;
    },

    uniq_fast: function (array) {
        var seen = {};
        var out = [];
        var len = array.length;
        var j = 0;
        for (var i = 0; i < len; i++) {
            var item = array[i];
            if (seen[item] !== 1) {
                seen[item] = 1;
                out[j++] = item;
            }
        }
        return out;
    }
};
