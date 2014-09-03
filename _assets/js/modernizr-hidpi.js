Modernizr.addTest('hidpi', function() {
    // starts with default value for modern browsers
    var dpr = window.devicePixelRatio ||

    // fallback for IE
        (window.screen.deviceXDPI / window.screen.logicalXDPI) ||

    // default value
        1;

    return !!(dpr > 1);
});
