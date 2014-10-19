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

      if (Backbone.history.location.href.indexOf('#donate') > -1) {
        _.delay(function(){
          this.appInstance.showDonate();
        }.bind(this), 1250);
      }
      
      $(document).on("click", "a[href]:not([data-bypass])", function(evt) {
        var href = { 
          prop: $(this).prop("href"), 
          attr: $(this).attr("href") 
        };
        var root = location.protocol + "//" + location.host + '/';

        if (href.prop.slice(0, root.length) === root) {
          evt.preventDefault();
          Backbone.history.navigate(href.attr, true);
        }
      });



      Modernizr.load([ {
        test: Modernizr.raf,
        nope: ['/assets/js/vendor/modernizr/polyfill-requestAnimationFrame.js'] 
      } ]);
    }
  };

  $(function() {
    WY.init(); // Kick off the party
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
      console.log('fetch: ' + page);
      this.promise = $.ajax({
        url: '/' + page,
        type: 'GET',
      })
      .done(this.onRequestSuccess)
      .fail(this.onRequestError)
      .always(function(){console.log('FUCK')});
      console.log(this.promise)
    }, 
    
    onRequestSuccess: function(data){
      console.log('success');

      var $dataDiv = $('<div />').html(data);
      var $page = $dataDiv.find('#content .page');
      var title = $dataDiv.find('title').text();

      this.set('rawHTML', data);
      this.set('template', $page);
      this.set('title', title);
      
      console.log('success: ' + title);
    },
    
    onRequestError: function(data){
      console.log('error');
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

  WY.Views.QerosOld = WY.Extensions.View.extend({
    initialize: function(){
      this.render(0);
    },
    page: 'qeros-old',
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
    }
  });

  WY.Views.ZoomImg = Backbone.View.extend({
    initialize: function () {
      _.bindAll(this, 'onMouseenter', 'onMouseleave', 'onMousemove');
      this.$imgEl = this.$el.children().first();
      // this.$el.hover(this.onMouseenter, this.onMouseleave);
      // this.$el.on('mousemove', this.onMousemove);
    },

    onMouseenter: function() {
      this.$el.addClass('zoom');
      this.lastTransform = this.$imgEl.css('transform');
      var transEvent = whichTransitionEvent();
      var afterDelay = function() {
        this.$el.removeClass('zoom');
        console.log('remove')
      }.bind(this);
      _.delay(afterDelay, 500);
    },

    onMousemove: function(e) {
      var elOffset = this.$el.offset();
      var x = e.pageX - elOffset.left;
      var y = e.pageY - elOffset.top;
      var w = this.$el.outerWidth();
      var h = this.$el.outerHeight();

      var xOffset = (1 - x/w) * 100 - 50;
      var yOffset = (1 - y/h) * 100 - 50;

      this.$imgEl.css({ transform: 'translateX(' + xOffset + '%) translateY(' + yOffset + '%) scale(1.66)' });
    },

    onMouseleave: function() {
      this.$el.addClass('zoom');
      this.$imgEl.css({transform: 'scale(1)'});
      var transEvent = whichTransitionEvent();
      this.$el.one(transEvent, function(){
          $(this).removeClass('zoom');
      });

    }
  });
}());