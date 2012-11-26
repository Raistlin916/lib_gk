(function ( exports, undefined ) {
	var slice = Array.prototype.slice;
	if( !window['$'] ){
		var $ = function(s){
			return document.querySelectorAll(s);
		};
		exports.$ = $;
	}
	if( !window['$$'] ){
		var $$ = function(s){
			return document.querySelector(s);
		};
		exports.$$ = $$;
	}

	function getClientLeft( elem ){
      if( elem == document.body ){
      	return 0;
      }
    	return elem.offsetLeft + getClientLeft( elem.parentElement );
    }

	function extend( target, src, isOverride ){
		if( isOverride == undefined ){
			isOverride = true;
		}
		for(var key in src){
			if( isOverride || target[key] == undefined ){
				target[key] = src[key]; 
			}
		}
		return target;
	}

	var Event = function(){
		var fns = {},
			values = {};
		function on (name, callback) {
			fns[name] || (fns[name] = []);
			fns[name].push(callback);
		};
		function emit (name) {
			var args = Array.prototype.slice.call(arguments, 1);
			!!fns[name] && fns[name].forEach( function ( callback ) {
							callback.apply(this, args);
						});
		};

		function set ( key, value ) {
			values[key] = value;
		}

		function get ( key ) {
			return values[key];
		}

		return {
			on: on,
			emit: emit,
			set: set,
			get: get
		}
	}();

	function EventEmitter() {
   		this.__events = {};
	}
	EventEmitter.prototype = {
	    bind: function( name, cb ) {
	        this.__events[name] || (this.__events[name] = []);
	        this.__events[name].push(cb);
	    },
	    on: function(){
	    	this.bind.apply( this, arguments );
	    },
	    emit: function( name ) {
	        var arr = this.__events[name],
	        	argus = slice.call( arguments, 1 ),
	        	self = this;
	        if (arr) {
	            arr.forEach(function(cb) {
	                cb.apply( self, argus );
	            })
	        }
	    }
	}

	function inherit(subclass, superclass) {
	    var fn = function() {},
	        klass = subclass.prototype,
	        sp;
	    fn.prototype = superclass.prototype;
	    sp = subclass.prototype = new fn;
	    sp._super = superclass.prototype;
	    sp.Super = superclass;
	    extend(sp, klass);
	}

	var Timing = function(){
		var stack = [];

		function format ( name, elapse ) {
			return name !== undefined ? name + ' ---> ' + elapse + ' ms' :
						'cost ' + elapse + ' ms';
		}

		function start ( name ) {
			stack.push({ time: new Date().getTime(),
						name: name });
		}

		function out ( output ) {
			if( output === undefined ){
				output = function( str ){
					console.log( str );
				}
			}

			var now = new Date().getTime(),
				start = stack.pop();
			output( format( start.name, now - start.time ) );
		}

		return {
			start: start,
			out: out
		}
	}();

	exports.utils = { 
					slice: slice,
					Timing: Timing,
					Event: Event,
					EventEmitter: EventEmitter,
					inherit: inherit,
					extend: extend,
					getClientLeft: getClientLeft
				};
})(window)