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
  'vendor/paypal-button'
], function($, _, Backbone, Modernizr, View, Yaml, ShopItem, ShopCollection, Obscura, Paypal){

  var Shop = View.extend({
    page: 'shop',
    categories: [],
    beforeAppend: function(){
      _.bindAll(this, 'loadItems', 'render', 'onItemsLoaded', 'updateLayout', 'updateFilters',
        'updatePagination', 'prevPage', 'nextPage', 'onProxyChange', 'showItemPage', 'hideItemPage', 'prevItem', 'nextItem' );
      this.$el.find('*[data-src]').each(function(i, el){
        this.preloadImg(el);
      }.bind(this));
      this.createTimelines();
      this.itemTemplate = this.$el.find('#shopItem-template').html();
      this.categoryHeaderTemplate = this.$el.find('#shopCategoryHeader-template').html();
      this.itemPageTemplate = this.$el.find('#shopItemPage-template').html();
      this.noItemsTemplate = this.$el.find('#shopNoItems-template').html();
      this.itemPage = this.$el.find('#item-page');
      this.itemList = this.$el.find('#items .item-list');
      this.filter = this.$el.find('div.filter')
      this.currentCategory = '-1'
      this.paypalId = 'SF6MWPM36E8ZU'
      this.categories = [];
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
        'url': "/shopData.yml",
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
      
      this.currentItem = id;
      var item = this.items.findWhere({itemNumber: id});

      var paypalButton;
      var soldButton = $('<p class="sold">This item has been sold.</p>');
      var itemPrice = item.get('price');

      if ( typeof itemPrice === 'string' && itemPrice.indexOf('request') > -1 ) {
        paypalButton = null;
      } else {
        var paypalData = {
          name: { value: 'Willka Yachay: ' + toTitleCase(item.get('category')) },
          amount: { value: itemPrice },
          tax: { value: (itemPrice * 0.085).toFixed(2) },
          shipping: { value: '10.00' },
          currency_code: { value: 'USD' },
          item_number: { value: 'WillkaYachay' + item.get('itemNumber') },
        }
        paypalButton = PAYPAL.apps.ButtonFactory.create(this.paypalId, paypalData, 'buynow');
        $(paypalButton).removeClass('paypal-button').find('button').removeClass('paypal-button').html('Buy');
      }

      this.itemPage.html('')
      .append(_.template(this.itemPageTemplate, item.attributes))
      .find('.info').append(item.get('sold') ? soldButton : paypalButton);

      this.itemPage.addClass('show')
      .find('.close').click(this.hideItemPage);
      this.itemPage.find('nav .prev').click(this.prevItem);
      this.itemPage.find('nav .next').click(this.nextItem);

      this.preloadImg(this.itemPage.find('div[data-src]'), true);
      $('body').addClass('stop-scroll');
    },

    nextItem: function () {
      this.currentItem = this.currentItem++;
      this.showItemPage(this.currentItem)
    },

    prevItem: function () {
      this.currentItem = this.currentItem--;
      this.showItemPage(this.currentItem)
    },

    hideItemPage: function() {
      this.$el.find('#item-page').removeClass('show');
      $('body').removeClass('stop-scroll');
      if (!this.hasLayout) {
        this.needsLayout = true;
      }
      this.currentItem = null;
      Backbone.history.navigate('/shop/');
    },

    onItemsLoaded: function(data) {
      var shopData = Yaml.safeLoad(data);
      var categories = shopData.categories;
      var items = shopData.items;

      for (var i in categories) {
        this.categories.push( categories[i] );
      }
      for (var i in items) {
        this.items.add( items[i] );
      }

      // sort category list alphabetically
      this.categories = _.sortBy( this.categories, function(c) {return c.name.english.singular;} );

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
          categoryLabel = toTitleCase(category.name.english.plural);
        }

        $filterItem.html(categoryLabel);
        $filterItem.data('category', i);
        $filterItem.click(this.updateFilters)
        $ul.append($filterItem);
      }
    },

    updateLayout: function(){
      this.itemList.html('');
      if (this.currentCategory > -1) {
        // Category header
        this.itemList.append( _.template( this.categoryHeaderTemplate, this.categories[this.currentCategory] ) )
      }
      if (this.proxy.getFilteredLength() === 0 && 
        this.categories[this.currentCategory].name.english.singular.indexOf('custom') < 0) {
        this.itemList.append( this.noItemsTemplate );
      } else {      
        this.proxy.each(function(item) {
          var options = $.extend({}, item.attributes, {index: item.get('itemNumber')});
          var renderedContent = _.template(this.itemTemplate, options);
          this.itemList.append(renderedContent);
        }, this);
      }

      this.$el.find('div[data-src]').each(function(i, el){
        this.preloadImg(el, true);
      }.bind(this));
      
      this.updatePagination();
      this.needsLayout = false;
      this.hasLayout = true;
    },

    updatePagination: function(){
      $pagination = $('div.pagination')
      $prevButtons = $('div.pagination a.page-prev');
      $nextButtons = $('div.pagination a.page-next');
      $currPage = $('div.pagination span.page-current');
      $pageTotal = $('div.pagination span.page-total');

      var numPages = this.proxy.getNumPages();
      if (numPages) {
        $currPage.html(this.proxy.getPage() + 1);
        $pageTotal.html(this.proxy.getNumPages());
        $pagination.show();
      } else {
        $pagination.hide();
      }

      $prevButtons.toggleClass('disabled', !this.proxy.hasPrevPage());
      $nextButtons.toggleClass('disabled', !this.proxy.hasNextPage());
    },

    updateFilters: function(e) {
      var $filterItem = $(e.target);
      this.currentCategory = $filterItem.data('category');
      $filterItem.addClass('active').siblings().removeClass('active');

      this.proxy.resetFilters();
      if (this.currentCategory > -1) {
        this.proxy.filterBy('', {category: this.categories[this.currentCategory].name.english.singular});
      }
      // Filter out sold items
      // this.proxy.filterBy(function(item){
      //   return !item.get('sold');
      // });
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