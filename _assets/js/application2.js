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

  WY.Extensions.View = Backbone.View.extend({
    initialize: function(options) {
      _.bindAll(this, 'modelReady');
      this.model = new WY.PageModel();
      if (options.page) {
        this.model.fetchHTML(options.page);
      }
    },

    render: function(options) {
      options = options || {};
      // if (options.page === true) {
        // this.$el.addClass('page');
      // }
      $.when(this.model.promise).then(this.modelReady, this.modelReady);

      return this;
    },

    modelReady: function() {
      console.log('when');
      this.$el = this.model.get('template');
      WY.appInstance.$contentEl.append(this.$el); // WALKER: is this ok?
      this.transitionIn();
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
      'projects': 'projects',
      'expeditions': 'expeditions',
      '': 'home'
    },

    home: function() {
      var view = new WY.Views.Home({page:'home'});
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

    expeditions: function() {
      var view = new WY.Views.Expeditions({page:'expeditions'});
      WY.appInstance.goto(view);
    }
  });

  WY.Views.AppView = WY.Extensions.View.extend({
    el: 'body',
    events: {
      // 'click a' : navigate
    },
    initialize: function(){
      this.menu = new WY.Views.Menu({el: $('#site-nav')});
      this.currentPage = new WY.Views.Home({el: $('#content .page')});
      this.currentPage.transitionIn();
      this.$contentEl = $(this.$el.children('#content'));
    },
    goto: function(view){
      var previous = this.currentPage || null;
      var next = view;

      if (previous) {
        previous.transitionOut(function() {
          previous.remove();
          next.render();
          WY.appInstance.currentPage = next;
        });
      } else {
        next.render();
        this.currentPage = next;        
      }
    },
  });

  WY.Views.Home = WY.Extensions.View.extend({
    className: 'home'
  });

  WY.Views.Qeros = WY.Extensions.View.extend({
    className: 'qeros'
  });

  WY.Views.Projects = WY.Extensions.View.extend({
    className: 'projects'
  });

  WY.Views.Expeditions = WY.Extensions.View.extend({
    className: 'expeditions'
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

  WY.PageModel = Backbone.Model.extend({
    defaults: {template: null, rawHTML: null},

    initialize: function() {
      _.bindAll(this, 'onRequestSuccess', 'onRequestError');
    },

    fetchHTML: function(page){
      this.promise = $.ajax({
        url: page,
        type: 'GET',
        success: this.onRequestSuccess,
        error: this.onRequestError
      });
    }, 
    
    onRequestSuccess: function(data){
      var $dataDiv = $('<div />').html(data);
      var $page = $dataDiv.find('#content .page');
      this.set('rawHTML', data);
      this.set('template', $page);
      // console.log(data)
    },
    
    onRequestError: function(data){
      var $dataDiv = $('<div />').html(data);
      $dataDiv.addClass('page');
      this.set('rawHTML', null);
      this.set('template', $dataDiv);
      console.log('fail');
    }
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



  // WY.model = new WY.Page({currentPage:window.location.pathname});
  // WY.view = new WY.AppView({el: 'body', model: WY.model});
  // WY.router = new WY.AppRouter();
  // Backbone.history.start({pushState: true, silent: true, root: '/'});
}());

