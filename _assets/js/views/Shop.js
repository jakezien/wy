define([
  'jquery',
  'underscore',
  'backbone',
  'modernizr',
  'view',
  'vendor/js-yaml.min',
  'shopItem',
  'shopCollection',
  'obscura',
], function($, _, Backbone, Modernizr, View, Yaml, ShopItem, ShopCollection, Obscura){

  var Shop = View.extend({
    page: 'shop',
    beforeAppend: function(){
      _.bindAll(this, 'loadItems', 'render', 'updateLayout', 'updatePagination', 'prevPage', 'nextPage', 'onProxyChange');
      // this.itemTemplate = _.template(this.$el.find('#shopItem-template').html());
      this.setupUI();
      this.itemTemplate = this.$el.find('#shopItem-template').html();
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
            that.proxy = new Obscura(that.items, {perPage: 20});
            that.proxy.bind('change reset', that.onProxyChange)
            that.needsLayout = true;
          } catch (e) {
            console.log(e);
          }
        }
      })
    },

    render: function(){
      if (!this.proxy) return;
      if (!this.needsLayout) return;
      this.updateLayout();
    },

    updateLayout: function(){
      $('#items').html('');
      this.proxy.each(function(item) {
        var renderedContent = _.template(this.itemTemplate, item.attributes);
        $('#items').append(renderedContent);
      }, this);
      this.updatePagination();
      this.needsLayout = false;
    },

    updatePagination: function(){
      $prevButtons = $('div.pagination a.page-prev');
      $nextButtons = $('div.pagination a.page-next');
      $currPage = $('div.pagination span.page-current');
      $pageTotal = $('div.pagination span.page-total');

      $currPage.html(this.proxy.getPage() + 1)
      $pageTotal.html(this.proxy.getNumPages())

      $prevButtons.toggleClass('disabled', !this.proxy.hasPrevPage());
      $nextButtons.toggleClass('disabled', !this.proxy.hasNextPage());
    },

    setupUI: function() {
      $('div.pagination').append('<span class="page-prev"><</span><span class="page-current"></span>&nbsp;of&nbsp;<span class="page-total"></span><span class="page-next">></span>')
      $('div.pagination .page-prev').click(this.prevPage);
      $('div.pagination .page-next').click(this.nextPage);
    },

    prevPage: function(){
      this.proxy.prevPage();
      console.log(this.proxy.models)
    },

    nextPage: function(){
      this.proxy.nextPage();
      console.log(this.proxy.models)
    },

    onProxyChange: function(){
      this.needsLayout = true;
      this.render()
      console.log('change')
    }

  });

  return Shop;
});