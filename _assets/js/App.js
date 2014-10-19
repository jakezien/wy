define([
  'jquery', 
  'underscore',
  'backbone',
  'modernizr',
  'extensions/Router',
  'views/AppView'
], function($, _, Backbone, Modernizr, Router, AppView){

  var appRouter = null;
  var appInstance = null;

  var initialize = function(){

    appInstance = new AppView();
    appRouter = new Router({appView:appInstance});

    Backbone.history.start({pushState: true, root: '/'});
    
    if (Backbone.history.location.href.indexOf('#donate') > -1) {
      _.delay(function(){
        appInstance.showDonate();
      }, 1250);
    }

    $(document).on("click", "a[href]:not([data-bypass])", function(evt) {
      var href = { 
        prop: $(this).prop("href"), 
        attr: $(this).attr("href") 
      };
      var root = location.protocol + "//" + location.host + '/';

      if (href.prop.slice(0, root.length) === root) {
        evt.preventDefault();
        Backbone.history.navigate(href.attr, true);
      }
    });

    // Modernizr.load([ {
    //   test: Modernizr.raf,
    //   nope: ['/assets/js/vendor/modernizr/polyfill-requestAnimationFrame.js'] 
    // } ]);

  };

  return {
    initialize: initialize
  };
});