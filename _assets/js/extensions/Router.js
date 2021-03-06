define([
  'jquery',
  'underscore',
  'backbone',
  'views/About',
  'views/Blog',
  'views/Expeditions',
  'views/Home',
  'views/Projects',
  'views/Qeros',
  'views/Schools',
  'views/Shop',
], function($, _, Backbone, About, Blog, Expeditions, Home, Projects, Qeros, Schools, Shop){

  var Router = Backbone.Router.extend({
  
    initialize: function(opts) {
      this.last = null;
      _.bindAll(this, 'storeRoute', 'previous', 'updateMenu', 'onAll');
      this.bind('route', this.onAll);
      this.opts = opts;
    },

    routes: {
      'qeros(/)': 'qeros',
      'qeros-old(/)': 'qerosOld',
      'projects(/)': 'projects',
      'schools(/)': 'schools',
      'expeditions(/)': 'expeditions',
      'about(/)': 'about',
      'blog/*id': 'blog',
      'blog(/)': 'blog',
      'shop/:id': 'shop',
      'shop(/)': 'shop',
      '': 'home',
      // '*default': 'blog'
    },

    onAll: function(route) {
      this.currentRoute = route;
      this.storeRoute();
      this.updateMenu(route);
    },

    storeRoute: function(){
      this.last = Backbone.history.fragment;
      // console.log('store ' + this.last)
    },

    updateMenu: function(route) {
      this.opts.appView.updateMenu(route);
    },

    previous: function() {
      if (this.last) {
        this.navigate(this.last);
      }
    },

    home: function() {
      var view = new Home({page:'home', url:'index.html', eventBus:this.opts.appView.eventBus});
      this.opts.appView.goto(view);
    },

    qeros: function() {
      var view = new Qeros({page:'qeros'});
      this.opts.appView.goto(view);
    },

    qerosOld: function() {
      var view = new QerosOld({page:'qeros-old'});
      this.opts.appView.goto(view);
    },

    projects: function() {
      var view = new Projects({page:'projects', menu:this.opts.appView.menu});
      this.opts.appView.goto(view);
    },

    blog: function(id) {
      var view;
      if (id) {
        view = new Blog({page:'post-page', url:'blog/' + id});
      } else {
        view = new Blog({page:'blog'});
      }
      this.opts.appView.goto(view);
    },

    shop: function(id) {
      var view;
      var appView = this.opts.appView;

      // create shopview if necessary
      if (appView.shopView) {
        view = appView.shopView;
      } else {
        view = new Shop({page:'shop'});
      }

      appView.goto(view);

      if (id) {
        view.showItemPage(Number(id));
      } else {
        view.hideItemPage();
      }
    },

    schools: function() {
      var view = new Schools({page:'schools'});
      this.opts.appView.goto(view);
    },

    expeditions: function() {
      var view = new Expeditions({page:'expeditions'});
      this.opts.appView.goto(view);
    },

    about: function() {
      var view = new About({page:'about'});
      this.opts.appView.goto(view);
    },

  });

  return Router;
});