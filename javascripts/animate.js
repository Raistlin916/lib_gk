(function( exports, undefined ){
  
  var Animate = function( elems ){
    this._init( elems );
  }
  Animate.prototype = {
    past: function( time ){
      this.stack.push( time );
      return this;
    },
    set: function( style ){
      this._setElems( style );
      return this;
    },
    to: function( style, d, fn ){
      if( d == undefined ) d = 0;
      var self = this,
          f = function( t ){
             setTimeout(function(){
                style.webkitTransitionDuration = d/1000 + 's';
                self._setElems( style );
                fn && setTimeout(function(){
                   fn( self.elems );
                }, d);
             }, t);
          };
      this._push( f );
      this._push( d );
      return this;
    },
    revert: function( d, fn ){
      if( d == undefined ) d = 0;
      var self = this;
      this._push(function(t){
        setTimeout(function(){
          self.elems.forEach(function( elem, i ){
            elem.style.webkitTransitionDuration = d/1000 + 's';
            for( var key in self.orgStyle[i]){
                elem.style[key] = self.orgStyle[i][key];
            }
          });
          fn && setTimeout(function(){
             fn( self.elems );
          }, d);
        }, t);
      });
      this._push(d);
      return this;
    },
    start: function(){
      var t = 0, p, self = this;
      do{
        p = this.stack.shift();
        if( typeof p == 'function' ){
          p(t);
        } else {
          t += p;
        }
      } while( this.stack.length );
      t && setTimeout(function(){
          self._restore();
        }, t);
    },
    use: function( platform ){
      this._save();
      platform && platform();
      this._resotre();
      return this;
    },
    _init: function( elems ){
      (elems.length == undefined) && ( elems = [elems] );
      elems = Array.prototype.slice.call(elems);
      this.elems = elems;
      this.org = [];
      this.stack = [];
      this.orgStyle = [];
      var self = this;
      elems.forEach(function(){
        self.orgStyle.push({});
      });
      this._save();
    },
    _save: function(){
      var org = this.org, elems = this.elems, list = this._saveList,
          temp = {};
      if( org.length > 0 ) return;
      this.elems.forEach(function( elem ){
        list.forEach(function( item ){
          temp[item] = elem.style[item];
        });
        elem.style.webkitTransitionDuration = 0;
        elem.style.webkitTransitionDelay = 0;
        elem.style.webkitTransitionProperty = 'all';
        org.push( temp );
      });
    },
    _restore: function(){
      var org = this.org, elems = this.elems, temp, 
          list = this._saveList;
      this.elems.forEach(function( elem, i ){
        temp = org[org.length - i - 1];
        list.forEach(function(item){
          elem.style[item] = temp[item];
        });
      }); 
    },
    _setElems: function( style ){
      var self = this;
      this.elems.forEach(function( elem, i ){
        for( var key in style ){
          ( self.orgStyle[i][key] == undefined )
            && !~self._saveList.indexOf( key )
            && ( self.orgStyle[i][key] = elem.style[key] );
          elem.style[key] = style[key];
        }
      });
    },
    _push: function( f ){
      this.stack.push( f );
    },
    _saveList: [
      'webkitTransitionDuration',
      'webkitTransitionProperty',
      'webkitTransitionTimingFunction',
      'webkitTransitionDelay'
    ]
  }
  
  exports.Animate = Animate;
})( window ); 