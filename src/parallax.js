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
                if (element.className &&
                  element.className.match(hasClassName)) {
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


    /**
     * Animator
     */
    var Animator = function() {
      this.tweenTypes = {
        linear: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
          5, 5, 5, 5, 5, 5, 5, 5],
        blast: [6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 4, 4, 4,
          4, 4, 4, 3, 3, 3, 3, 3, 3, 2, 2],
        acceler: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      };
      this.queue = [];
      this.active = false;
      this.timer = null;
    };

    Animator.prototype = {
      createTween: function(start, end, type) {
        type = type || 'linear';
        var tmp = start;
        var tween = [];
        var diff = end - start;
        var frameLength = this.tweenTypes[type].length;
        for (var i = 0; i < frameLength; i++) {
          tmp += diff * this.tweenTypes[type][i] * 0.01;
          tween.push({
              data: tmp,
              event: null
          });
        }
        return tween;
      },
      enqueue: function(animation) {
        animation.active = true;
        this.queue.push(animation);
      },
      animate: function() {
        if (this.queue.length <= 0) {
          this.stop();
          return;
        }

        for (var i = 0, l = this.queue.length; i < l; i++) {
          if (this.queue[i].active) {
            this.queue[i].animate();
          }
        }
      },
      start: function() {
        if (this.timer || this.active) {
          return false;
        }
        this.active = true;
        this.timer = setInterval(this.animate.bind(this), 30);
      },
      stop: function() {
        clearInterval(this.timer);
        this.timer = null;
        this.active = false;
        this.queue = [];
      }
    };

    Animator.prototype.constructor = Animator;

    var animator = new Animator();
    var Animation = function(options) {
      this.options = {
        from: 0,
        to: 100,
        tweenType: 'linear',
        onTween: function() {},
        onComplete: null
      };

      this.options = extend(this.options, options);
      this.animator = animator;
      this.tween = this.animator.createTween(
        this.options.from,
        this.options.to,
        this.options.tweenType
      );
      this.frameLength = this.animator.tweenTypes[
        this.options.tweenType
      ].length;
      this.frame = 0;
      this.active = false;
    };

    Animation.prototype = {
      animate: function() {
        if (this.active) {
          if (this.tween[this.frame]) {
            this.options.onTween(this.tween[this.frame].data);
          }
          if (this.frame++ >= this.frameLength - 1) {
            this.active = false;
            this.frame = 0;
            if (this.options.onComplete) {
              this.options.onComplete();
            }
            return false;
          }
          return true;
        }
        return false;
      },
      start: function() {
        this.animator.enqueue(this);
        if (!this.animator.active) {
          this.animator.start();
        }
      },
      stop: function() {
        this.active = false;
      }
    };

    Animation.prototype.constructor = Animation;

    var Parallax = function(target, options) {
      this.option = {
        speed: 0.5,
        start: 0,
        axis: 'y',
        scroller: document
      };

      this.options = extend(this.option, options);
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
        this.bindEvent(scroller, 'scroll', function(e) {
            this.onScroll(e);
        }.bind(this));
      },
      onScroll: function(e) {
        var xPos = this.isX() ? (this.dist() * this.options.speed) + 'px' : 0;
        var yPos = this.isX() ? 0 : (this.dist() * this.options.speed) + 'px';
        this.target.style.backgroundPosition = xPos + ' ' + yPos;
      },
      bindEvent: function(target, event, func) {
        if (window.addEventListener) {
          target.addEventListener(event, function(e) {
              func(e);
          });
        } else if (window.attachEvent) {
          target.attachEvent('on' + event, function() {
              if (window.event) {
                func(window.event);
              } else {
                func();
              }
          });
        } else {
          throw 'browser not support event listener';
        }
      }
    };

    var ParallaxPlayer = function(box, options) {
      this.options = {
        axis: 'y',
        delay: 3000,
        speed: 0.5,
        tweenType: 'blast',
        itemNode: '.child'
      };

      this.index = 0;
      this.box = $(box)[0];
      this.boxScrollAnimations = [];
      this.step = this.box.offsetHeight;
      this.options = extend(this.options, options);
      this.scrollSpeed = 100 - this.options.speed * 100;
      this.scrollType = this.isX() ? 'scrollLeft' : 'scrollTop';
      this.items = $(this.options.itemNode, this.box)[0];
      this.addIndicator();
      this.createParallaxes(this.items);
    };

    ParallaxPlayer.prototype = {
      isX: function() {
        return this.options.axis === 'x';
      },
      addIndicator: function() {
        var indicatorDots = [];
        var indicatorWidth = 0;
        var indicator = document.createElement('div');
        indicator.className = 'indicator';
        indicator.style.top = this.step - 10 + 'px';
        indicator.style.visibility = 'hidden';
        for (var i = 0, l = this.items.length; i < l; i++) {
          var indicatorDot = document.createElement('div');
          indicatorDot.className = 'dot';
          indicator.appendChild(indicatorDot);
          this.bindEvent(indicatorDot, 'click', function(e) {
              this.scrollTo(e);
          }.bind(this));
          indicatorDots.push(indicatorDot);
          indicatorWidth += indicatorDot.offsetWidth;
        }
        this.indicatorDots = indicatorDots;
        this.box.appendChild(indicator);
        indicator.style.left =
        (this.box.offsetWidth - indicatorWidth) / 2 + 'px';
        indicator.style.visibility = '';
      },
      scrollTo: function(e) {
        var className = e.target.className;
        //if the indicator dot is selected
        if (className.split(' ').indexOf('selected') !== -1) {
          return;
        }
        //clear player scroll animation
        clearTimeout(this.scrollTimeout);
        //clear parallax animation
        clearInterval(this.scrollInterval);
        //set scroll index
        this.index = this.indicatorDots.indexOf(e.target);
        //play scroll animation
        this.play();
      },
      createParallaxes: function(items) {
        for (var i = 0; i < items.length; i++) {
          var startScollTop = i * this.step;
          new Parallax(items[i], {
              speed: 0.6,
              start: startScollTop,
              axis: this.options.axis,
              scroller: this.box
          });
          //the last one scroll to the first parallax
          if (i == items.length - 1) {
            this.boxScrollAnimations.push(
              new Animation({
                  from: startScollTop,
                  to: 0,
                  tweenType: this.options.tweenType,
                  onTween: this.onTween.bind(this),
                  onComplete: this.onTweenComplete.bind(this)
              })
            );
          } else {
            this.boxScrollAnimations.push(
              new Animation({
                  from: startScollTop,
                  to: startScollTop + this.step,
                  tweenType: this.options.tweenType,
                  onTween: this.onTween.bind(this),
                  onComplete: this.onTweenComplete.bind(this)
              })
            );
          }
        }
      },
      onTween: function(data) {
        this.box[this.scrollType] = data;
      },
      onTweenComplete: function() {
        this.index++;
        if (this.index >= this.indicatorDots.length) {
          this.index = 0;
        }
        this.playTo(this.index);
      },
      selectIndex: function(index) {
        //clear all indicator dot's selected status
        for (var i = 0, l = this.indicatorDots.length; i < l; i++) {
          this.indicatorDots[i].className = 'dot';
        }
        //add selected status for selected indicator dot
        this.indicatorDots[index].className =
        this.indicatorDots[index].className + ' selected';
      },
      playTo: function(index) {
        this.selectIndex(index);
        this.scrollTimeout = setTimeout(function() {
            this.boxScrollAnimations[index].start();
        }.bind(this), this.options.delay);
      },
      play: function() {
        this.playTo(0);
      },
      bindEvent: function(target, event, func) {
        if (window.addEventListener) {
          target.addEventListener(event, function(e) {
              func(e);
          });
        } else if (window.attachEvent) {
          target.attachEvent('on' + event, function() {
              if (window.event) {
                func(window.event);
              } else {
                func();
              }
          });
        } else {
          throw 'browser not support event listener';
        }
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
