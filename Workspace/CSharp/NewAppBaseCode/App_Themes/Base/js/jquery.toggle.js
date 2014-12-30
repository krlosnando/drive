$(function () {

    // run the currently selected effect
    function runEffect() {
        
        // get effect type from 
        var selectedEffect = "slide";
        //"blind"
        //"bounce"
        //"clip"
        //"drop"
        //"explode"
        //"fold"
        //"highlight"
        //"puff"
        //"pulsate"
        //"scale"
        //"shake"
        //"size"
        //"slide"

        // most effect types need no options passed by default
        var options = {};

        // some effects have required parameters
        if (selectedEffect === "scale") {
            options = { percent: 0 };
        } else if (selectedEffect === "size") {
            options = { to: { width: 200, height: 60} };
        }

        // run the effect
        $("#toggle").toggle(selectedEffect, options, 500);
    };

    // set effect from select menu value
    $("#togglebutton").click(function () {
        runEffect();
        return false;
    });

    // set effect from select menu value
    $("#toggleclose").click(function () {
        runEffect();
        return false;
    });

    $("#toggle").hide();
});