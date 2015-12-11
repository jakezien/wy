define([
  'jquery',
  'underscore',
  'backbone',
  'modernizr',
  'shopItem'
], function($, _, Backbone, Modernizr, ShopItem){

  var ShopCollection = Backbone.Collection.extend({
    model: ShopItem,
    comparator: 'itemNumber'
  });

  return ShopCollection;

});