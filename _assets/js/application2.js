$(function() {

  var WY = { 
    Views: {},
    Extensions: (),
    Router: null,

    init: function() {
      this.instance = new WY.Views.AppView();
      Backbone.history.start({pushState: true, silent: true, root: '/'});
    }
  };

  WY.Extensions.View = Backbone.View.extend({
    initiaize: function(){
      this.router = new WY.Router();
    },
    render: function(options) {
      options = options || {};
      if (options.page === true) {
        this.$el.addClass('page');
      }

      return this;
    },
    transitionIn: function(callback) {
      var view = this, delay;
      var transitionIn = function() {
        view.$el.addClass('is-visible');
        view.$el.one('transitionend', function(){
          if (_isFunction(callback)) {
            callback();
          }
        });
      };
      _.delay(transitionIn, 20);
    },
    transitionOut: function(callback) {
      var view = this;

      view.$el.removeClass('is-visible');
      view.$el.one('transitionend', function() {
        if (_._isFunction(callback)) {
          callback();
        }
      });
    }
  });

  WY.Extensions.Router = Backbone.Router.extend({

    routes: {
      'expeditions': 'expeditions',
      '': 'home'
    },

    home: function() {
      var view = new App.Views.Home();
      app.instance.goto(view);
    },

    expeditions: function() {
      var view = new App.Views.Home();
      app.instance.goto(view);
    }
  });

  WY.Views.AppView = app.Extensions.View.extend({
    el: 'body',
    goto: function(view){
      var previous = this.currentPage || null;
      var next = view;

      if (previous) {
        previous.transitionOut(function() {
          previous.remove();
        });
      }

      next.render({page:true});
      this.$el.append(next.$el);
      next.transitionIn();
      this.currentPage = next;
    }
  });

  WY.AppView = Backbone.View.extend({
    currentPage: null,
    events: {
      'click a': 'navigate',
      'transitionEnd #content': 'transitionEnded',
      'webkitTransitionEnd #content': 'transitionEnded',
      'oTransitionEnd #content': 'transitionEnded',
      'MSTransitionEnd #content': 'transitionEnded',
    },
    initialize: function(){
      // stuff
      _.bindAll(this, 'replacePage');
      this.listenTo(WY.model, 'change:currentPage', this.transitionOut);
      this.listenTo(WY.model, 'change:pageData', this.replacePage);
      this.menu = new WY.Menu({el: '#site-nav'});
    },
    navigate: function(e){
      e.preventDefault();
      var dest = $(e.target).attr('href');
      dest = _.last(dest.split('/'));
      WY.router.navigate(dest, {'trigger':'true'});
      this.updateNav(e.target);
    },
    updateNav: function(a){
      $('#site-nav a').removeClass('active');
      $(a).addClass('active');
    },
    transitionOut: function(){
      $('#content').addClass('transitionOut');
      $('#site-footer').addClass('transitionOut');
      this.isTransitioning = true;
    },
    transitionIn: function(){
      window.scrollTo(0,0);
      $('#content').removeClass('transitionIn');
      $('#site-footer').removeClass('transitionOut');
    },
    transitionEnded: function(e){
      this.isTransitioning = false;
      // console.log('trans end');
    },
    replacePage: function(){
      if (this.isTransitioning) {
        setTimeout(this.replacePage, 100);
        return;
      }
      this.currentPage = WY.model.get('currentPage');
      var dataDiv = $('<div />').html(WY.model.get('pageData'));
      var $newContent = $(dataDiv).find('#content');
      $newContent.addClass('transitionIn');
      document.title = $(dataDiv).find('title').text();
      $('#content').replaceWith($newContent);
      setTimeout(this.transitionIn, 500);
    },
  });

  WY.AppRouter = Backbone.Router.extend({
    routes: {
      '*page' : 'getPage'
    },
    initialize: function() {
      _.bindAll(this, 'getPage', 'verifyPage');
    },
    getPage: function(page) {
      // if (page.slice(-1) === '/'){
      //   page = page.slice(0, -1);
      // }
      if (!page || !this.verifyPage(page)) {
        WY.model.fetchPage('index.html');
      } else {
        WY.model.fetchPage(page);
      }
    },
    verifyPage: function(page) {
      for (var index in this.knownPages) {
        if (page === this.knownPages[index]) {
          console.log(page + ' ' + this.knownPages[index]);
          return true;
        }
      }
      console.log(page + ' unknown');
      return false;
    },
    knownPages: ['projects', 'expeditions', 'schools']
  });

  WY.Page = Backbone.Model.extend({
    defaults:{
      currentPage: null,
      pageData: null
    },
    fetchPage: function(page){
      this.set('currentPage', page);
      $.ajax({
        url: page,
        type: 'GET',
        success: this.onRequestSuccess,
        error: this.onRequestError
      });
    }, 
    onRequestSuccess: function(data){
      WY.model.set('pageData', data);
    },
    onRequestError: function(data){
      WY.model.set('pageData', null);
      // if (data.status === 404) {
      //   WY.router.navigate('404',{'trigger':'true', 'replace':'true'});
      // }
      console.log('fail');
      console.log(data);
    },
  });

  WY.Menu = Backbone.View.extend({
    isShowing: false,
    events: {
      'click #menu-btn': 'toggleMenu',
      'click li': 'navClicked'
    },
    initialize: function(){
      _.bindAll(this, 'show', 'hide', 'toggleMenu', 'navClicked', 'onScroll');
      $(window).scroll(this.onScroll)
    },
    show: function(){
      $(this.el).addClass('show');
      $('body').addClass('menu-show');
      this.isShowing = true;
    },
    hide: function(){
      $(this.el).removeClass('show');
      $('body').removeClass('menu-show');
      this.isShowing = false;
    },
    scrollHide: function(){
      $(this.el).addClass('scroll-hide');
    },
    scrollShow: function(){
      $(this.el).removeClass('scroll-hide');
    },
    toggleMenu: function(){
      if (this.isShowing) {
        this.hide();
      } else {
        this.show();
      }
    },
    navClicked: function(){
      if (this.isShowing) {
        this.hide();
      }
    },
    lastScrollTop: 0,
    onScroll: function(e){
      var st = Math.max(0, $(window).scrollTop());
       if (st > this.lastScrollTop){
           this.scrollHide();
       } else {
           this.scrollShow();
       }
       this.lastScrollTop = st;
    }
  });



  WY.model = new WY.Page({currentPage:window.location.pathname});
  WY.view = new WY.AppView({el: 'body', model: WY.model});
  WY.router = new WY.AppRouter();
  Backbone.history.start({pushState: true, silent: true, root: '/'});
});

