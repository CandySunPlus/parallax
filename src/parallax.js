/**
* parallax class
* parallax player class
*
* @author Fengming Sun <s@sfmblog.cn>
*/
(function(exports) {
  /**
   * common dom selector
   */
  var $ = function(selectors, inEles) {
    var result = [];
    //if not support getElementsByTagName
    if (!document.getElementsByTagName) {
      return result;
    }
    //if selectors not is string
    if (typeof selectors == 'object') {
      return selectors;
    }
    //remove useless space
    selectors = selectors.replace(/\s*([^\w])\s*/g, '$1');
    selectors = selectors.split(',');
    //set root elements
    var rootElements = [];
    if (inEles !== undefined && typeof inEles !== 'array') {
      rootElements = [inEles];
    } else if (inEles === undefined) {
      rootElements = [document];
    } else {
      rootElements = inEles;
    }
    //all rootElements
    for (var e = 0, l = rootElements.length; e < l; e++) {
      var root = rootElements[e];
      //get all elements
      var elements = root.getElementsByTagName('*');
      //parse the selectors list
      for (var i = 0; (selector = selectors[i]) != null; i++) {
        // id selector
        if (selector.indexOf('#') == 0) {
          selector = selector.split('#');
          result.push(root.getElementById(selector[1]));
        }
        //class selector
        else if (selector.indexOf('.') == 0) {
          selector = selector.split('.');
          //for modern browsers
          if (root.getElementsByClassName) {
            result.push(root.getElementsByClassName(selector[1]));
          }
          //for IE and other old browsers
          else {
            var hasClassName =
              new RegExp('(?:^|\\s)' + selector[1] + '(?:$|\\s)');
            var element;
            //parse all elements
            for (var j = 0; (element = elements[j]) != null; j++) {
              //has class name
              if (element.className && element.className.match(hasClassName)) {
                result.push(element);
              }
            }
          }
        }
        //tag selector
        else {
          result.push(root.getElementsByTagName(selector));
        }
      }
    }
    return result;
  };

  /**
   * extend Obj
   */
  var extend = function(target, source) {
    for (property in source) {
      target[property] = source[property];
    }
    return target;
  };

  var Parallax = function(target, options) {
    this.options = options;
    this.target = $(target);
    this.scroller = $(this.options.scroller);
    this.scrollType = this.isX() ? 'scrollLeft' : 'scrollTop';
    this.addScrollEvent(this.scroller);
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
    }
  };

  var ParallaxPlayer = function(box, options) {
    this.options = {
      axis: 'y',
      delay: 3000,
      speed: 0.5,
      itemNode: '.child',
      childNode: 'div'
    };

    this.index = 0;
    this.box = $(box)[0];
    this.step = this.box.offsetHeight;
    this.options = extend(this.options, options);
    this.scrollSpeed = 100 - this.options.speed * 100;
    this.scrollType = this.isX() ? 'scrollLeft' : 'scrollTop';
    var items = $(this.options.itemNode, this.box);
    this.createParallaxes(items[0]);
  };

  ParallaxPlayer.prototype = {
    isX: function() {
      return this.options.axis === 'x';
    },
    createParallaxes: function(items) {
      for (var i = 0; i < items.length; i++) {
        new Parallax(items[i], {
          speed: 0.6,
          start: i * 600,
          axis: this.options.axis,
          scroller: this.box
        });
        var childs = items[i].children;
        for (var j = 0; j < childs.length; j++) {
          new Parallax(childs[j], {
            speed: 0.1,
            start: i * 600,
            axis: this.options.axis,
            scroller: this.box
          });
        }
      }
    },
    scrollStep: function(end, callback) {
      var perScroll;
      if (end > this.box[this.scrollType]) {
        perScroll = this.step / this.scrollSpeed;
        this.scrollInterval = setInterval(function() {
          if (end <= this.box[this.scrollType]) {
            clearTimeout(this.scrollTimeout);
            clearInterval(this.scrollInterval);
            callback();
            return;
          }
          this.box[this.scrollType] += perScroll;
        }.bind(this), 10);
      } else {
        perScroll = (this.box.scrollHeight - this.step) / this.scrollSpeed;
        this.scrollInterval = setInterval(function() {
          if (end >= this.box[this.scrollType]) {
            clearTimeout(this.scrollTimeout);
            clearInterval(this.scrollInterval);
            callback();
            return;
          }
          this.box[this.scrollType] -= perScroll;
        }.bind(this), 10);
      }
    },
    autoScroll: function() {
      if (this.box.scrollTop + this.step >
          this.box.scrollHeight - this.step) {
        this.index = 0;
      }

      this.scrollStep(this.index * this.step, function() {
        this.scrollTimeout = setTimeout(function() {
          this.autoScroll();
        }.bind(this), this.options.delay);
      }.bind(this));

      this.index++;
      this.selectIndex(this.index);
    },
    selectIndex: function(index) {
      console.log(index);
    },
    play: function() {
      this.autoScroll();
    }
  };

  //fix constructor
  Parallax.prototype.constructor = Parallax;
  ParallaxPlayer.prototype.constructor = ParallaxPlayer;

  //export Parallax class to global
  exports.Parallax = Parallax;
  //export ParallaxPlayer class to global
  exports.ParallaxPlayer = ParallaxPlayer;
})(window);
