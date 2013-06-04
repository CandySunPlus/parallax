/**
* parallax class
*
* @author Fengming Sun <s@sfmblog.cn>
*/
(function(exports) {
  var Parallax = function(targetId, options) {
    this.step = 600;
    this.scrollSpeed = 0.3 * 1000;
    this.tick = 3000;
    this.index = 0;
    this.targetId = targetId;
    this.options = options;
    this.target = document.getElementById(targetId);
    this.scroller = document.getElementById(options.scroller);
    this.scrollType = this.isX() ? 'scrollLeft' : 'scrollTop';
    this.addScrollEvent(this.scroller);
    this.autoScroll();
  };

  Parallax.prototype = {
    isX: function() {
      return this.options.axis === 'x';
    },
    dist: function() {
      return + this.scroller[this.scrollType] - this.options.start;
    },
    addScrollEvent: function(scroller) {
      scroller.addEventListener('scroll', function(e) {
        this.onScroll(e);
      }.bind(this));
    },
    onScroll: function(e) {
      var xPos = this.isX() ? (this.dist() * this.options.speed) + 'px' : 0;
      var yPos = this.isX() ? 0 : (this.dist() * this.options.speed) + 'px';
      this.target.style.backgroundPosition = xPos + ' ' + yPos;
    },
    scrollStep: function(end, callback) {
      var perScroll;
      if (end > this.scroller[this.scrollType]) {
        perScroll = this.step / this.scrollSpeed;
        this.scrollInterval = setInterval(function() {
          if (end <= this.scroller[this.scrollType]) {
            clearTimeout(this.scrollTimeout);
            clearInterval(this.scrollInterval);
            callback();
            return;
          }
          this.scroller[this.scrollType] += perScroll;
        }.bind(this), 10);
      } else {
        perScroll = (this.scroller.scrollHeight - this.step) / this.scrollSpeed;
        this.scrollInterval = setInterval(function() {
          if (end >= this.scroller[this.scrollType]) {
            clearTimeout(this.scrollTimeout);
            clearInterval(this.scrollInterval);
            callback();
            return;
          }
          this.scroller[this.scrollType] -= perScroll;
        }.bind(this), 10);
      }
    },
    autoScroll: function() {
      if (this.scroller.scrollTop + this.step >
          this.scroller.scrollHeight - this.step) {
        this.index = 0;
      }

      this.scrollStep(this.index * this.step, function() {
        this.scrollTimeout = setTimeout(function() {
          this.autoScroll();
        }.bind(this), this.tick);
      }.bind(this));

      this.index++;
      this.selectIndex(this.index);
    },
    selectIndex: function(index) {
      console.log(index);
    }
  };

  //fix constructor
  Parallax.prototype.constructor = Parallax;

  //export Parallax class to global
  exports.Parallax = Parallax;
})(window);
