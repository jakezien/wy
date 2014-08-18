WY.Views.AppView = WY.Extensions.View.extend({
  el: 'body',
  initialize: function(){
     _.bindAll(this, 'render', 'onScroll');

    this.menu = new WY.Views.Menu({el: $('#site-nav')});
    this.currentPageView = new WY.Views.Home({el: $('#content .page')});
    this.currentPageView.transitionIn();
    this.$contentEl = $(this.$el.children('#content'));
    
    this.latestKnownScrollY = 0;
    this.ticking = false;
    this.scrollEffects = true;

    window.addEventListener('scroll', this.onScroll, false);
  },

  render: function(){
    this.ticking = false;
    var currentScrollY = this.latestKnownScrollY;
    // tell subviews to render
    this.menu.render(currentScrollY);
    this.currentPageView.render();
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