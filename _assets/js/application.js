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