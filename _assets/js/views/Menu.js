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