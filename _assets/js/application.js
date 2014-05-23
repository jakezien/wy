var WY = {};

WY.initSite = function(){

  // AJAX History adaptation from github.com/joelhans/Jekyll-AJAX
  jQuery(document).ready(function($) {
    $('.page').removeClass('loading');
    if (Modernizr.history) {
      var siteUrl = 'http://'+(document.location.hostname||document.location.host);
      $(document).delegate('a[href^="/"],a[href^="'+siteUrl+'"]', "click", function(e) {
        e.preventDefault();
        History.pushState({}, "", this.pathname);
      });
      History.Adapter.bind(window, 'statechange', transitionPage);
    }
  });

  var transitionPage = function(){
    var $body = $('body');
    $body.addClass('loading');
    if (Modernizr.csstransitions) {
      $body.on('transitionend webkitTransitionEnd oTransitionEnd', function(e){
        $.get(History.getState().url, onPageLoad);
        $(this).off();
      })
    } else {
      $.get(History.getState().url, onPageLoad);
    }
  }

  var onPageLoad = function(data) {
    _gaq.push(['_trackPageview', History.getState().url]);
    replacePage(data);
    $('body').removeClass('loading');
  }

  var replacePage = function(data) {
    var dataDiv = $('<div />').html(data);
    document.title = $(dataDiv).find('title').text();
    $('.page').html($(dataDiv).find('.page').children());
  }
}

WY.allPages = function(){

  var oldBrowserWarning = function() {
    $.get('/old-browser.html', function(data){
      var dataDiv = $('<div />').html(data);
      $('header').append(dataDiv);
    });
  }

  if (!Modernizr.video) {
    oldBrowserWarning();
  }

}

WY.home = function(){
  WY.allPages();
};