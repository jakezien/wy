(function() {

  var WY = { 
    Views: {},
    Extensions: {},
    appRouter: null,
    appInstance: null,

    init: function() {
      this.appRouter = new WY.Extensions.Router();
      this.appInstance = new WY.Views.AppView();

      Backbone.history.start({pushState: true, silent: true, root: '/'});
      
      $(document).on("click", "a[href]:not([data-bypass])", function(evt) {
        var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };
        var root = location.protocol + "//" + location.host + '/';

        if (href.prop.slice(0, root.length) === root) {
          evt.preventDefault();
          Backbone.history.navigate(href.attr, true);
        }
      });
    }
  };

  $(function() {
    WY.init(); // Kick off the party
  });


  // Extensions 
  // ———————————————————————————————————————————

  WY.Extensions.View = Backbone.View.extend({

    initialize: function(options) {
      if (options.page) {
        this.className = this.page;
      }
    },

    buildEl: function(model){
      this.$el = model.get('template');
    },

    render: function(options) {
      options = options || {};
      return this;
    },

    transitionIn: function(callback) {
      var view = this, delay;
      var transitionIn = function() {
        view.$el.addClass('is-visible');
        view.$el.one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function(){
          if (_.isFunction(callback)) {
            callback();
          }
        });
      };

      _.delay(transitionIn, 20);
    },

    transitionOut: function(callback) {
      var view = this;
      view.$el.removeClass('is-visible');
      view.$el.one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function(){
        if (_.isFunction(callback)) {
          callback();
        }
      });
    }
  });

  WY.Extensions.Router = Backbone.Router.extend({

    routes: {
      'qeros': 'qeros',
      'projects(/)': 'projects',
      'schools(/)': 'schools',
      'expeditions(/)': 'expeditions',
      'about(/)': 'about',
      '': 'home'
    },

    home: function() {
      var view = new WY.Views.Home({page:'index'});
      WY.appInstance.goto(view);
    },

    qeros: function() {
      var view = new WY.Views.Qeros({page:'qeros'});
      WY.appInstance.goto(view);
    },

    projects: function() {
      var view = new WY.Views.Projects({page:'projects'});
      WY.appInstance.goto(view);
    },

    schools: function() {
      var view = new WY.Views.Schools({page:'schools'});
      WY.appInstance.goto(view);
    },

    expeditions: function() {
      var view = new WY.Views.Expeditions({page:'expeditions'});
      WY.appInstance.goto(view);
    },

    about: function() {
      var view = new WY.Views.About({page:'about'});
      WY.appInstance.goto(view);
    }
  });


  // Model
  // ———————————————————————————————————————————

  WY.PageModel = Backbone.Model.extend({
    defaults: {template: null, rawHTML: null},

    initialize: function() {
      _.bindAll(this, 'onRequestSuccess', 'onRequestError');
    },

    getUrl: function(page) {
      return window.location.host + '/' + page;
    },

    fetchHTML: function(page){
      this.promise = $.ajax({
        url: '/' + page,
        type: 'GET',
        success: this.onRequestSuccess,
        error: this.onRequestError
      });
    }, 
    
    onRequestSuccess: function(data){
      var $dataDiv = $('<div />').html(data);
      var $page = $dataDiv.find('#content .page');
      var title = $dataDiv.find('title').text();

      this.set('rawHTML', data);
      this.set('template', $page);
      this.set('title', title);
    },
    
    onRequestError: function(data){
      var $dataDiv = $('<div />').html(data);
      $dataDiv.addClass('page');
      this.set('rawHTML', data);
      this.set('template', $dataDiv);
      this.set('title', '404');
      console.log('fail');
    }
  });


  // Views
  // ———————————————————————————————————————————

  WY.Views.AppView = WY.Extensions.View.extend({
    el: 'body',
    initialize: function(){
      this.menu = new WY.Views.Menu({el: $('#site-nav')});
      this.currentPageView = new WY.Views.Home({el: $('#content .page')});
      this.currentPageView.transitionIn();
      this.$contentEl = $(this.$el.children('#content'));
    },
    goto: function(view){
      var previousView = this.currentPageView || null;
      var nextView = view;

      this.currentPageModel = new WY.PageModel();
      this.currentPageModel.fetchHTML(nextView.page);

      var finishGoto = function(){
        WY.appInstance.transitionInNextView(nextView);
      };

      if (previousView) {
        previousView.transitionOut(function() {
          previousView.remove();
          WY.appInstance.currentPageModel.promise.then(finishGoto, finishGoto);
        });
      } else {
        this.currentPageModel.promise.then(finishGoto, finishGoto);
      }
    },

    transitionInNextView: function(nextView) {
      nextView.buildEl(this.currentPageModel);
      this.$contentEl.append(nextView.$el);
      document.title = this.currentPageModel.get('title');
      nextView.transitionIn();
      this.currentPageView = nextView;
    }
  });

  WY.Views.Home = WY.Extensions.View.extend({
    page: 'home'
  });

  WY.Views.Qeros = WY.Extensions.View.extend({
    page: 'qeros'
  });

  WY.Views.Projects = WY.Extensions.View.extend({
    page: 'projects'
  });

  WY.Views.Schools = WY.Extensions.View.extend({
    page: 'schools'
  });

  WY.Views.Expeditions = WY.Extensions.View.extend({
    page: 'expeditions'
  });

  WY.Views.About = WY.Extensions.View.extend({
    page: 'about'
  });

  WY.Views.Menu = Backbone.View.extend({
    isShowing: false,
    events: {
      'click #menu-btn': 'toggleMenu',
      'click li': 'navClicked'
    },
    initialize: function(){
      _.bindAll(this, 'show', 'hide', 'toggleMenu', 'navClicked', 'onScroll');
      $(window).scroll(this.onScroll)
      this.lastScrollTop = 0;
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
    navClicked: function(e){
      this.$el.find('a').removeClass('active');
      $(e.target).addClass('active');
      if (this.isShowing) {
        this.hide();
      }
    },
    onScroll: function(e){
      var pageHeight = $('#content').innerHeight();
      var windowHeight = $(window).innerHeight();
      var st = Math.max(0, $(window).scrollTop());
      if (st + windowHeight >= pageHeight - 100) {
        this.scrollShow();
        return;
      }
      if (st > this.lastScrollTop){
        this.scrollHide();
      } else {
        this.scrollShow();
      }
      this.lastScrollTop = st;
    }
  });


  // WY.AppView = Backbone.View.extend({
  //   currentPage: null,
  //   events: {
  //     'click a': 'navigate',
  //     'transitionEnd #content': 'transitionEnded',
  //     'webkitTransitionEnd #content': 'transitionEnded',
  //     'oTransitionEnd #content': 'transitionEnded',
  //     'MSTransitionEnd #content': 'transitionEnded',
  //   },
  //   initialize: function(){
  //     // stuff
  //     _.bindAll(this, 'replacePage');
  //     this.listenTo(WY.model, 'change:currentPage', this.transitionOut);
  //     this.listenTo(WY.model, 'change:pageData', this.replacePage);
  //     this.menu = new WY.Menu({el: '#site-nav'});
  //   },
  //   navigate: function(e){
  //     e.preventDefault();
  //     var dest = $(e.target).attr('href');
  //     dest = _.last(dest.split('/'));
  //     WY.router.navigate(dest, {'trigger':'true'});
  //     this.updateNav(e.target);
  //   },
  //   updateNav: function(a){
  //     $('#site-nav a').removeClass('active');
  //     $(a).addClass('active');
  //   },
  //   transitionOut: function(){
  //     $('#content').addClass('transitionOut');
  //     $('#site-footer').addClass('transitionOut');
  //     this.isTransitioning = true;
  //   },
  //   transitionIn: function(){
  //     window.scrollTo(0,0);
  //     $('#content').removeClass('transitionIn');
  //     $('#site-footer').removeClass('transitionOut');
  //   },
  //   transitionEnded: function(e){
  //     this.isTransitioning = false;
  //     // console.log('trans end');
  //   },
  //   replacePage: function(){
  //     if (this.isTransitioning) {
  //       setTimeout(this.replacePage, 100);
  //       return;
  //     }
  //     this.currentPage = WY.model.get('currentPage');
  //     var dataDiv = $('<div />').html(WY.model.get('pageData'));
  //     var $newContent = $(dataDiv).find('#content');
  //     $newContent.addClass('transitionIn');
  //     document.title = $(dataDiv).find('title').text();
  //     $('#content').replaceWith($newContent);
  //     setTimeout(this.transitionIn, 500);
  //   },
  // });

  // WY.AppRouter = Backbone.Router.extend({
  //   routes: {
  //     '*page' : 'getPage'
  //   },
  //   initialize: function() {
  //     _.bindAll(this, 'getPage', 'verifyPage');
  //   },
  //   getPage: function(page) {
  //     // if (page.slice(-1) === '/'){
  //     //   page = page.slice(0, -1);
  //     // }
  //     if (!page || !this.verifyPage(page)) {
  //       WY.model.fetchPage('index.html');
  //     } else {
  //       WY.model.fetchPage(page);
  //     }
  //   },
  //   verifyPage: function(page) {
  //     for (var index in this.knownPages) {
  //       if (page === this.knownPages[index]) {
  //         console.log(page + ' ' + this.knownPages[index]);
  //         return true;
  //       }
  //     }
  //     console.log(page + ' unknown');
  //     return false;
  //   },
  //   knownPages: ['projects', 'expeditions', 'schools']
  // });


  // WY.model = new WY.Page({currentPage:window.location.pathname});
  // WY.view = new WY.AppView({el: 'body', model: WY.model});
  // WY.router = new WY.AppRouter();
  // Backbone.history.start({pushState: true, silent: true, root: '/'});
}());

