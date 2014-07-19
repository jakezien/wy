var WY = {};

WY.initSite = function(){

  // https://github.com/joaocunha/modernizr-retina-test
  Modernizr.addTest('hires', function() {
    // starts with default value for modern browsers
    var dpr = window.devicePixelRatio ||
    // fallback for IE
        (window.screen.deviceXDPI / window.screen.logicalXDPI) ||
    // default value
        1;
    return !(dpr > 1);
  });

  // AJAX History adaptation from github.com/joelhans/Jekyll-AJAX
  jQuery(document).ready(function($) {
    $('.page').removeClass('loading');
    WY.currentPage = $('.page').attr('id');
    if (Modernizr.history) {
      var siteUrl = 'http://'+(document.location.hostname||document.location.host);
      $(document).delegate('a[href^="/"],a[href^="'+siteUrl+'"]', "click", function(e) {
        e.preventDefault();
        History.pushState({}, "", this.pathname);
      });
      History.Adapter.bind(window, 'statechange', transitionPage);
    }
  });

  // $(window).resize(WY.resize);

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
    WY.cleanup();
    replacePage(data);
    $('body').removeClass('loading');
    _gaq.push(['_trackPageview', History.getState().url]);
  }

  var replacePage = function(data) {
    var dataDiv = $('<div />').html(data);
    var $newPage = $(dataDiv).find('.page')
    WY.currentPage = $newPage.attr('id');
    document.title = $(dataDiv).find('title').text();

    $('.page').attr('id', $newPage.attr('id'));
    $('.page').html($newPage.children());
  }
}

WY.resize = function(){
  WY[WY.currentPage].resize();
};

WY.cleanup = function(){
  WY[WY.currentPage].cleanup();
};

// WY.allPages = function(){

//   var oldBrowserWarning = function() {
//     $.get('/old-browser.html', function(data){
//       var dataDiv = $('<div />').html(data);
//       $('header').append(dataDiv);
//     });
//   }

//   if (!Modernizr.video) {
//     oldBrowserWarning();
//   }
// };

WY.home = function(){
  WY.allPages();

  var $photos = $('#photos');
  var imgWidth = Math.floor($photos.innerWidth() * 0.4);
  $photos.children('img').css('width',imgWidth);

  var masonry = new Masonry($photos[0], {
    'isFitWidth':true
  });
  masonry.unbindResize();

  var resizeTimer;

  WY.home.resize = function(){
    console.log('home resize')
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    };
    resizeTimer = setTimeout(function(){
      var imgWidth = Math.floor($(window).innerWidth() * 0.4);
      $photos.children('img').css('width',imgWidth);
      masonry.layout();
    },100);
  }

  WY.home.cleanup = function(){
    console.log('home cleanup')
    masonry.destroy();
    console.log(masonry)
  }

  // var feed = new Instafeed({
  //     get: 'user',
  //     userId: 286252999,
  //     clientId: '43cd0e99be424a6fa8f8fd29425148fe',
  //     accessToken: '6951572.467ede5.5a4e1be179e24d30837af4ca4a6aa42e',
  //     sortBy: 'most-recent'
  // });
  // feed.run(); 
};

WY.projects = function(){

  var resize = function(){
    console.log('resized');
  };

  window.addEventListener("resize", function(){
    _.debounce(resize, 250);
    console.log(2)
  }, false);
  console.log(4)

};

WY.expeditions = function(){
  WY.expeditions.cleanup = function(){
    console.log('expedition cleanup')
  }
  WY.expeditions.resize = function(){
    console.log('expedition resize')
  }
}