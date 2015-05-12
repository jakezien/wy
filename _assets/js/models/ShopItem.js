define([
  'jquery',
  'underscore',
  'backbone',
  'modernizr',
], function($, _, Backbone, Modernizr){

  var ShopItem = Backbone.Model.extend({
    defaults: {
      category: '',
      size: '',
      condition: '',
      fiber: '',
      images: '',
      description: ''
    }
  });

  return ShopItem;

});