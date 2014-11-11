if (!window.console) console = {log: function() {}}; // fix for IE console undefined

require.config({
  paths: {
    jquery: '//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min',
    underscore: 'vendor/underscore/underscore-min',
    backbone: 'vendor/backbone/backbone-min',
    modernizr: 'vendor/modernizr/modernizr.custom',
    detectizr: 'vendor/modernizr/detectizr.min',
    util: 'util',
    view: 'extensions/View',
    pagemodel: 'models/PageModel'
  }, 

  shim: {
    'modernizr' : {exports: 'Modernizr'},
    'detectizr' : {exports: 'Detectizr'},
  },
});

require([
  // Load our app module and pass it to our definition function
  'app',
], function(App){
  // The "app" dependency is passed in as "App"
  App.initialize();
});