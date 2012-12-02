
(function( exports, undefined ){
  function Dialog( elems, vk ){
    this.init( elems );
  }
  Dialog.prototype = (function(){
      var _d, _mask, _lock = false, _l;
      
      function _removeMask( mask ){
        document.body.contains(mask)   
           && document.body.removeChild(mask);
        window.removeEventListener('resize', _l);
      }
    
      function _appendMask( mask ){
          document.body.appendChild(mask);
        window.addEventListener('resize', _l);
      }
      function _createDialog(){
        var d = document.createElement('div'),
            b = document.createElement('div');
        d.style.position = 'fixed';
        d.style.backgroundColor = 'white';
        d.style.borderRadius = '2px';
        d.style.left = '50%';
        d.style.top = '50%';

        
        b.style.padding = '5px 15px';
        b.style.overflowY = 'auto';
        b.style.maxHeight = '600px';
        

        
        d.appendChild( b );
        d.b = b;
        d.style.zIndex = '1001';
        document.body.appendChild( d );
        d.slideIn = function( elems ){
          document.body.appendChild(d);
          d.b.innerHTML = '';
          elems.forEach(function( elem ){
            d.b.appendChild(elem);
          });
          d.style.webkitTransitionDuration = 0; // caused by bug
          d.style.marginLeft = -d.offsetWidth/2+'px';
          d.style.marginTop = -d.offsetHeight/2+'px';
          new Animate(d).set({opacity:0}).to({opacity:1}, 500).start();
        };
        d.slideOut = function(){
          new Animate(d).to({opacity:0}, 500, 
              function(){
                document.body.contains(d)  
                  && document.body.removeChild(d);
              }).start();
        }
        return d;
      }
      function _createMask( self ){
        if( _mask ){
          return _mask;
        } else {
          var mask = document.createElement('div');
          mask.style.position = 'fixed';
          mask.style.top = 0;
          mask.style.left = 0;
          mask.style.right = 0;
          mask.style.bottom = 0;
          mask.style.opacity = .7;
          mask.style.zIndex = 1000;
          mask.style.backgroundColor = 'black';
          
          var animate = new Animate( mask );
          mask.slideIn = function(){
            _appendMask( mask ); 
            animate.set({ opacity: 0 })
              .revert( 500, function(){
              }).start();
          }
          mask.slideOut = function(){
            animate.to({ opacity: 0 }, 500,
                       function(){
                          _removeMask( mask );
                         _lock = false;
                       }).start();
          }
       
          mask.addEventListener('click',function(e){
            if(_lock) return false;
            _lock = true;
            self.die();
          });
          
          _l = function(){
            mask.left = 0;
            mask.right = 0;
            mask.top = 0;
            mask.bottom = 0;
          }  
                
          return mask;
        }
      }
      function _getD(){
        if( _d == null ){
          return _d = _createDialog();
        } else {
          return _d;
        }
      }
      function _getM( self ){
        if( _mask == undefined ){
          return _mask = _createMask( self );
        } else {
          return _mask;
        }
      }
    
    return {
      init: function( elems ){
        elems = utils.toArray( elems );
        this.elems = elems;
      },
      pop: function(){
        _getM(this).slideIn();
        _getD().slideIn( this.elems );
      },
      die: function(){
        _getM(this).slideOut();
        _getD().slideOut();
      }
    }
  })();
   exports.Dialog = Dialog;
})(window);