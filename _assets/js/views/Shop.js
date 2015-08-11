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
      this.$el.find('*[data-src]').each(function(i, el){
        this.preloadImg(el);
      }.bind(this));
      this.createTimelines();
      this.itemTemplate = this.$el.find('#shopItem-template').html();
      this.itemPageTemplate = this.$el.find('#shopItemPage-template').html();
      this.itemPage = this.$el.find('#item-page');
      this.itemList = this.$el.find('#items .item-list');
      this.filter = this.$el.find('div.filter')
      if (!this.items) {
        this.items = new ShopCollection();
        this.loadItems();
      } else {
        this.setupUI();
        this.needsLayout = true;
      }
    },

    createTimelines: function() {
      this.timelines = {};

      var createTopTL = function() {
        var tl = new TimelineLite({paused: true});
        tl.to(this.$el.find('.bg .frame-img'), 4, {opacity:0}, 0);
        tl.to(this.$el.find('.bg .frame-img div'), 4.5, {y:'-5%'}, 0);
        tl.fromTo(this.$el.find('#top .cell, #story'), 3, {color:'#FAFAFF'}, {color:'#533B3A'}, 0);
        tl.to(this.$el.find('#story .keyline'), 5, {backgroundColor:'#533B3A'}, 0);
        tl.from(this.$el.find('#items'), 2, {opacity: 0}, 2.5);
        return tl;
      }.bind(this);

      this.timelines['top'] = createTopTL();
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

    render: function(currentScrollY){
      this.seekTimelines(currentScrollY);
      this.stickyFilter(currentScrollY);
      if (!this.proxy) return;
      if (!this.needsLayout) return;
      this.updateLayout();
    },

    stickyFilter: function(currentScrollY) {
      var itemsTop = this.$el.find('#items').offset().top;
      if (currentScrollY >= itemsTop) {
        this.filter.addClass('fixed');
      } else {
        this.filter.removeClass('fixed');
      }
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
      this.itemPage.html('')
      .append(_.template(this.itemPageTemplate, item.attributes))
      .addClass('show')
      .find('.close').click(this.hideItemPage);

      this.preloadImg(this.itemPage.find('div[data-src]'), true);
      $('body').addClass('stop-scroll');
    },

    hideItemPage: function() {
      this.$el.find('#item-page').removeClass('show');
      $('body').removeClass('stop-scroll');
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

      this.proxy = new Obscura(this.items, {perPage: 36});
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
      console.log(this.$el.find('#item-page .close'))
      var $ul = this.filter.find('ul');

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
        $ul.append($filterItem);
      }
    },

    updateLayout: function(){
      this.itemList.html('');
      this.proxy.each(function(item) {
        var options = $.extend({}, item.attributes, {index: this.items.indexOf(item)});
        var renderedContent = _.template(this.itemTemplate, options);
        this.itemList.append(renderedContent);
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
      var itemsTop = this.itemList.offset().top;
      if ($(window).scrollTop() > itemsTop) {
        window.scrollTo(0, this.itemList.offset().top - 48);
      }
    }
  });

  return Shop;
});