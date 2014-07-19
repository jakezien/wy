$(function(){

  var WY = {};

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
      this.isTransitioning = true;
    },
    transitionIn: function(){
      $('#content').removeClass('transitionIn');
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
    }
  });

  WY.AppRouter = Backbone.Router.extend({
    routes: {
      '*page' : 'getPage'
    },
    getPage: function(page){
      // if (page.slice(-1) === '/'){
      //   page = page.slice(0, -1);
      // }
      if (!page) {
        WY.model.fetchPage('index.html');
      }
      WY.model.fetchPage(page);
    },
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
      console.log('fail');
      console.log(data);
    },
  });

  WY.model = new WY.Page({currentPage:window.location.pathname});
  WY.view = new WY.AppView({el: 'body', model: WY.model});
  WY.router = new WY.AppRouter();

  Backbone.history.start({pushState: true, silent: true, root: '/'});
});

