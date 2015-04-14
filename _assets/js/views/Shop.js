define([
  'jquery',
  'underscore',
  'backbone',
  'modernizr',
  'view',
  'vendor/js-yaml.min',
  'shopItem',
  'shopCollection',
], function($, _, Backbone, Modernizr, View, Yaml, ShopItem, ShopCollection){

  var Shop = View.extend({
    page: 'shop',
    beforeAppend: function(){
      _.bindAll(this, 'loadItems', 'render');
      this.itemTemplate = _.template(this.$el.find('#shopItem-template').html());
      this.items = new ShopCollection();
      this.loadItems();
    },

    loadItems: function(){
      var yaml = null;
      var that = this;
      $.ajax({
        'async': true,
        'global': false,
        'url': "/shopItems.yml",
        'success': function (data) {
          try {
            var items = Yaml.safeLoad(data);
            for (item in items) {
              that.items.add( new ShopItem(items[item]) );
            }
            console.log(that.items)
          } catch (e) {
            console.log(e);
          }
        }
      })
    },

    render: function(){
      var renderedContent = this.itemTemplate(this.items.toJSON());
      this.$el.find('#items').html(renderedContent)
    }
  });

  return Shop;
});