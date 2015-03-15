define([
  'jquery',
  'underscore',
  'backbone',
  'modernizr',
  'view',
  'vendor/js-yaml.min'
], function($, _, Backbone, Modernizr, View, Yaml){

  var Shop = View.extend({
    page: 'shop',
    beforeAppend: function(){
      _.bindAll(this, 'loadItems');
      this.loadItems();
    },

    loadItems: function(){
      var yaml = null;
      $.ajax({
        'async': true,
        'global': false,
        'url': "/shopItems.yml",
        'success': function (data) {
          try {
            var items = Yaml.safeLoad(data);
            this.items = items;
            console.log(this.items)
          } catch (e) {
            console.log(e);
          }
        }
      });

    }
  });

  return Shop;
});