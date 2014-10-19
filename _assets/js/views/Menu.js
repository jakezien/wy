define([
  'view'
], function(View){

  var Menu = Backbone.View.extend({

    isShowing: false,
    events: {
      'click #menu-btn': 'toggleMenu',
      'click li': 'navClicked'
    },
    initialize: function(){
      _.bindAll(this, 'show', 'hide', 'toggleMenu', 'navClicked');
      this.lastScrollTop = 0;
      this.isWatchingScroll = true;
    },
    render : function(currentScrollY){
      if (!this.isWatchingScroll) return;

      var pageHeight = $('#content').innerHeight();
      var windowHeight = $(window).innerHeight();
      var st = Math.max(0, currentScrollY);

      if (st <= 50 || st + windowHeight >= pageHeight - 100) {
        // always show at top and bottom
        this.scrollShow();
        return;
      }

      if (Math.abs(st - this.lastScrollTop) < 20) return;
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
    transparent: function(){
      $(this.el).addClass('transparent');
    },
    opaque: function(){
      $(this.el).removeClass('transparent');
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
      this.trigger('nav-clicked');
    },
    watchScroll: function(){
      this.isWatchingScroll = true;
    },
    ignoreScroll: function(){
      this.isWatchingScroll = false;
    }

  });

  return Menu;
});