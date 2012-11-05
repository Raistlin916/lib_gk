/*
  require utils.extend;

  var range = new Range( document.body, { min: 20, max: 30, step: 5 });
  range.set(25);
  var r = range.getElement();
*/

(function(exports){
  var extend = utils.extend,
      inherit = utils.inherit;

  function Range( parent, option ){
    this.Super.call(this);
    extend( this, option );
    var defaultOption = {
                    value: 0,
                    min: 0,
                    max: 100,
                    step: 1
                  }
    extend( this, defaultOption, false );
    
    this.value < this.min && (this.value = this.min);
    this.value > this.max && (this.value = this.max);
    this.init(parent);
  }
  Range.prototype = {
    init: function(parent){
      var wrapper = document.createElement('div');
      wrapper.style.width = '34px';
      wrapper.style.height = '18px';
      
      var long = document.createElement('div');
      long.style.width = '30px';
      long.style.height = '2px';
      long.style.backgroundColor = 'grey';
      long.style.display = 'block';
      long.style.padding = '0';
      long.style.margin = '0 0 3px 1px';
      long.style.cursor = 'pointer';
      
      var div = document.createElement('div');
      div.style.width = '2px';
      div.style.height = '6px';
      div.style.backgroundColor = 'skyblue';
      div.style.position = 'relative';
      div.style.top = '-2px';
      div.style.cursor = 'pointer';
      long.appendChild( div );
      
      
      
      var shower = document.createElement('span');
      shower.style.fontSize = '9px';
      shower.style.display = 'block';
      shower.style.marginLeft = '2px';
      this.shower = shower;
      this.div = div;
      this.long = long;
      this.wrapper = wrapper;
      wrapper.appendChild( shower );
      wrapper.appendChild( long );
      parent && parent.appendChild( wrapper );
      
      this.attachHandler( div, long, shower, wrapper );
      this.set( this.value );
    },
    attachHandler: function( div, long, shower, wrapper ){
      var isMousedown = false,
          self = this;
      
      div.addEventListener('mousedown', function(e){
        isMousedown = true;
      });   
      window.addEventListener('mouseup', function(e){
        if( isMousedown ){
          self.emit( 'change', self.get() );
        }
        isMousedown = false;
      });
      wrapper.addEventListener('mousemove', function(e){
        if( isMousedown ){
          var x = _getX( e );
          if( x >= 0 && x <= long.offsetWidth ){
            _format( x, long, div, shower, wrapper );
          }
        }
      });
      long.addEventListener('click', function( e ){
        _format( _getX(e), long, div, shower, wrapper );
      });
      
      function _format( x, long, div, shower, wrapper ){
        var l = self.max - self.min;
        if( x >= long.offsetWidth ){
          x = long.offsetWidth;
        } else {
          x -= x % parseInt( long.offsetWidth * self.step / l );
        }
        div.style.left = x + 'px';
        var value = parseInt( self.min + x/long.offsetWidth*l);
        self.set( value );
        wrapper.dataset.value = value;
      }
      
      function _getX( e ){
        return e.pageX - long.offsetLeft;
      }
    },
    get: function(){
      return parseInt(this.shower.innerHTML);
    },
    set: function( p ){
      if( p < this.min || p > this.max ){
        this.shower.innerHTML = NaN;
      } else {
        var l = this.max - this.min;
        this.div.style.left = parseInt(this.long.offsetWidth / l * (p - this.min)) + 'px';
        this.shower.innerHTML = p;
        this.wrapper.dataset.value = p;
      }
    },
    getElement: function(){
      return this.wrapper;
    }
  }
  inherit( Range, utils.EventEmitter );
  exports.Range = Range;
})(window);


