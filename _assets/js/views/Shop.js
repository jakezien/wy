define([
  'jquery',
  'underscore',
  'backbone',
  'modernizr',
  'view'
], function($, _, Backbone, Modernizr, View){

  var Shop = View.extend({
    page: 'shop',
    beforeAppend: function(){
      // WY.appInstance.menu.transparent();
    }
  });

  return Shop;
});