define([
  'jquery',
  'underscore',
  'backbone',
  'modernizr',
  'vendor/modernizr/modernizr-hidpi',
  'view',
  'views/Menu',
  'views/Donate',
  'pagemodel',
  'views/ScrollNagger'
], function($, _, Backbone, Modernizr, HiDpi, View, Menu, Donate, PageModel, ScrollNagger){

  var AppView = View.extend({
    el: 'body',
    initialize: function(opts){
       _.bindAll(this, 'render', 'onScroll', 'onResize', 'hideDonate', 'updateMenu');

      this.menu = new Menu({el: $('#site-nav')});
      this.donate = new Donate({
        el: $('#donate'), 
        donateBtn:$('.donate-btn')
      });
      this.scrollNagger = new ScrollNagger({el: $('#scrollNagger'), });

      this.$contentEl = $(this.$el.children('#content'));

      this.latestKnownScrollY = 0;
      this.ticking = false;
      this.scrollEffects = true;
      this.firstLoad = true;

      this.eventBus = _({}).extend(Backbone.Events);


      this.hiDpi = Modernizr.hidpi;

      window.addEventListener('scroll', this.onScroll, false);
      window.addEventListener('resize', this.onResize, false);

      this.menu.on('nav-clicked', function(){
        console.log('click')
        this.hideDonate();
      }.bind(this));

      this.listenTo(this.eventBus, 'donate-show', this.showDonate);
    },

    createTimelines: function() {},

    render: function(){
      this.ticking = false;
      var currentScrollY = this.latestKnownScrollY;
      // tell subviews to render
      this.menu.render(currentScrollY);
      this.scrollNagger.render(currentScrollY);
      this.currentPageView.render(currentScrollY);
    },

    goto: function(view){
      if (this.isTransitioning) {
        // return;
      }

      this.isTransitioning = true;

      if (this.firstLoad) {
        this.firstLoad = false;
        this.menu.ignoreScroll();
        view.$el = $('#content .page');
        view.hiDpi = this.hiDpi;
        view.beforeAppend();
        view.$el.addClass(view.page);
        this.currentPageView = view;
        this.currentPageView.transitionIn();
        if (this.currentPageView.scrollNaggerEnabled && $(window).scrollTop() <= 50) {
          this.scrollNagger.startCountdown(this.currentPageView.scrollNaggerDelay);
        }
        // window.scrollTo(0, 0);
        this.isTransitioning = false;
        this.menu.watchScroll();
        return;
      }

      var previousView = this.currentPageView || null;
      var nextView = view;

      previousView.willTransitionOut();
      this.menu.ignoreScroll();

      this.currentPageModel = new PageModel();
      if (nextView.url) {
        this.currentPageModel.fetchHTML(nextView.url);
      } else {
        this.currentPageModel.fetchHTML(nextView.page);
      }

      var finishGoto = function(){
        this.transitionInNextView(nextView);
      }.bind(this);

      if (previousView) {
        this.scrollNagger.stopCountdown();
        this.scrollNagger.hide();
        previousView.transitionOut(function() {
          previousView.remove();
          this.currentPageModel.promise.always(function(){finishGoto();});
          // WY.appInstance.currentPageModel.promise.always(finishGoto);
        }.bind(this));
      } else {
        this.currentPageModel.promise.always(finishGoto);
      }
    },

    transitionInNextView: function(nextView) {
      this.currentPageView = nextView;
      nextView.hiDpi = this.hiDpi;
      nextView.buildEl(this.currentPageModel);
      this.$contentEl.append(nextView.$el);
      window.scrollTo(0, 0);
      document.title = this.currentPageModel.get('title');
      nextView.transitionIn();
      if (this.currentPageView.scrollNaggerEnabled) {
        this.scrollNagger.startCountdown(this.currentPageView.scrollNaggerDelay);
      }
      this.isTransitioning = false;
      this.menu.watchScroll();
    },

    onResize: _.debounce(function(e) {
      this.currentPageView.onResizeDebounced();
    }, 100),
    
    onScroll: function(){
      this.latestKnownScrollY = window.pageYOffset;
      if (this.scrollEffects) {
        this.requestTick();
      }
    },

    showDonate: function(){
      console.log('yay')
      this.donate.show();
      this.menu.scrollShow();
    },

    hideDonate: function(){
      this.donate.hide();
    },

    updateMenu: function(route){
      this.menu.update(route);
    },

    requestTick: function() {
      if (!this.ticking) {
        requestAnimationFrame(this.render);
      }
      this.ticking = true;
    }
  });

  return AppView;
});