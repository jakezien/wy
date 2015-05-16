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
    categories: [],
    beforeAppend: function(){
      _.bindAll(this, 'loadItems', 'render', 'onItemsLoaded', 'updateLayout', 'updateFilters',
        'updatePagination', 'prevPage', 'nextPage', 'onProxyChange', 'showItemPage', 'hideItemPage' );
      this.itemTemplate = this.$el.find('#shopItem-template').html();
      this.itemPageTemplate = this.$el.find('#shopItemPage-template').html();
      if (!this.items) {
        this.items = new ShopCollection();
        this.loadItems();
      } else {
        this.setupUI();
        this.needsLayout = true;
      }
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
            that.onItemsLoaded(data)
          } catch (e) {
            console.log('load' + e);
          }
        }
      })
    },

    render: function(){
      if (!this.proxy) return;
      if (!this.needsLayout) return;
      this.updateLayout();
      console.log('render')
    },

    showItemPage: function(id) {
      if (this.items.length === 0) {
        this.shouldShowItem = id;
        return;
      }
      if (this.shouldShowItem) {
        this.shouldShowItem = null;
      }
      var item = this.items.at(id);
      $('#item-page').html('')
      .append(_.template(this.itemPageTemplate, item.attributes))
      .addClass('show');
    },

    hideItemPage: function() {
      this.$el.find('#item-page').removeClass('show');
      if (!this.hasLayout) {
        this.needsLayout = true;
      }
      Backbone.history.navigate('/shop/');
    },

    onItemsLoaded: function(data) {
      console.log('onItemsLoaded')
      var items = Yaml.safeLoad(data);
      for (var i in items) {
        var item = items[i];

        // create list of categories
        if (_.findWhere(this.categories, item.category) == null) {
          this.categories.push(item.category);
        }

        this.items.add( item );
      }

      // sort category list alphabetically
      this.categories = _.sortBy(this.categories, function(c) {return c});

      this.proxy = new Obscura(this.items, {perPage: 35});
      this.proxy.bind('change reset', this.onProxyChange)

      this.setupUI();
      
      this.needsLayout = true;

      if (this.shouldShowItem) {
        this.showItemPage(this.shouldShowItem);
      } else {
        this.render();
      }
    },

    setupUI: function() {
      this.$el.find('div.pagination').append(
        '<span class="page-prev"><</span>' + 
        'Page&nbsp;<span class="page-current"></span>' + 
        '&nbsp;of&nbsp;<span class="page-total"></span>' + 
        '<span class="page-next">></span>')
      this.$el.find('div.pagination .page-prev').click(this.prevPage);
      this.$el.find('div.pagination .page-next').click(this.nextPage);
      this.$el.find('#item-page').click(this.hideItemPage);

      var $filter = this.$el.find('div.filter ul');

      for (var i = -1; i < this.categories.length; i++) {
        var category;
        var categoryLabel;
        var $filterItem = $('<li class="filter-item"></li>');

        if (i === -1) {
          category = 'all'
          categoryLabel = 'All'
          $filterItem.addClass('active');
        } else {
          category = this.categories[i];
          categoryLabel = capitalize(category) + 's'
        }

        $filterItem.html(categoryLabel);
        $filterItem.data('category', category);
        $filterItem.click(this.updateFilters)
        $filter.append($filterItem);
      }
    },

    updateLayout: function(){
      var $itemList = $('#items .item-list')
      $itemList.html('');
      this.proxy.each(function(item) {
        var options = $.extend({}, item.attributes, {index: this.items.indexOf(item)});
        var renderedContent = _.template(this.itemTemplate, options);
        $itemList.append(renderedContent);
      }, this);
      this.$el.find('div[data-src]').each(function(i, el){
        this.preloadImg(el, true);
      }.bind(this));
      this.updatePagination();
      this.needsLayout = false;
      this.hasLayout = true;
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

    updateFilters: function(e) {
      var $filterItem = $(e.target);
      var category = $filterItem.data('category');
      $filterItem.addClass('active').siblings().removeClass('active');

      this.proxy.resetFilters();
      if (category !== 'all') {
        this.proxy.filterBy('', {category: category});
      }
    },

    prevPage: function(){
      if (this.proxy.hasPrevPage()) {
        this.proxy.prevPage();
      }
    },

    nextPage: function(){
      if (this.proxy.hasNextPage()) {
        this.proxy.nextPage();
      }
    },

    onProxyChange: function(){
      this.needsLayout = true;
      this.render();
      window.scrollTo(0,0);
    }
  });

  return Shop;
});