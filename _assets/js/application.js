(function() {

  var WY = { 
    Views: {},
    Extensions: {},
    appRouter: null,
    appInstance: null,

    init: function() {
      this.appRouter = new WY.Extensions.Router();
      this.appInstance = new WY.Views.AppView();

      Backbone.history.start({pushState: true, root: '/'});
      
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
      'qeros(/)': 'qeros',
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
       _.bindAll(this, 'render', 'onScroll');

      this.menu = new WY.Views.Menu({el: $('#site-nav')});
      this.$contentEl = $(this.$el.children('#content'));

      this.latestKnownScrollY = 0;
      this.ticking = false;
      this.scrollEffects = true;
      this.firstLoad = true;

      window.addEventListener('scroll', this.onScroll, false);
    },

    render: function(){
      this.ticking = false;
      var currentScrollY = this.latestKnownScrollY;
      // tell subviews to render
      this.menu.render(currentScrollY);
      this.currentPageView.render(currentScrollY);
    },

    goto: function(view){

      if (this.firstLoad) {
        this.firstLoad = false;
        view.$el = $('#content .page');
        view.transitionIn();
        this.currentPageView = view;
        return;
      }

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
    },

    onScroll: function(){
      this.latestKnownScrollY = window.scrollY;
      if (this.scrollEffects) {
        this.requestTick();
      }
    },

    requestTick: function() {
      if (!this.ticking) {
        requestAnimationFrame(this.render);
      }
      this.ticking = true;
    }
  });

  WY.Views.Home = WY.Extensions.View.extend({
    page: 'home'
  });

  WY.Views.Qeros = WY.Extensions.View.extend({
    initialize: function(){
      this.render(0);
    },
    page: 'qeros',
    render: function(currentScrollY){
      var pageHeight = $('#content').innerHeight();
      var windowHeight = $(window).innerHeight();
      var st = Math.max(0, currentScrollY);

      $('.multiply .container').css('transform', 'translateY(' + -.95 * currentScrollY + 'px)');

      $('.page section').each(function(i,el){
        var $el = $(el);
        var $bgEl = $($('.bg-imgs div')[i]);
        var elTop = $el.offset().top;
        var elHeight = $el.outerHeight();
        var viewBottom = st + windowHeight;
        
        var rangeMin = elTop + elHeight * .1;
        var rangeMax = elTop + elHeight * 0.66;

        var opacityRatio = (viewBottom - rangeMin) / (rangeMax - rangeMin);
        var transformRatio = (viewBottom - rangeMin) / (rangeMax + elHeight/2 - rangeMin);
        if (opacityRatio > 5) {
          $bgEl.css('opacity', 0);
        } else {
          opacityRatio = Math.max(0, Math.min(opacityRatio, 1));
          $bgEl.css({ 
                      opacity: opacityRatio, 
                      transform: 'translateY(-' + Math.min(2, transformRatio) * 5 + 'vh)'
                    });
        }
      });


      _.delay(function(){
        $('.multiply').addClass('animate');
      }, 1300)
    }
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
      _.bindAll(this, 'show', 'hide', 'toggleMenu', 'navClicked');
      this.lastScrollTop = 0;
    },
    render : function(currentScrollY){
      var pageHeight = $('#content').innerHeight();
      var windowHeight = $(window).innerHeight();
      var st = Math.max(0, currentScrollY);
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
    }
  });
}());