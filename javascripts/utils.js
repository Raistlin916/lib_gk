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
	function _getComputedStyle( elem ){
		if( window['getComputedStyle'] == undefined ){
			return elem.currentStyle;
		} else {
			return getComputedStyle( elem, false );
		}
	}

	function getClientLeft( elem ){
		var r = elem.offsetLeft, p = elem.offsetParent;
		while( p != undefined ){
			r += p.offsetLeft;
			p = p.offsetParent;
		}
    	return r;
    }

    function getClientTop( elem ){
		var r = elem.offsetLeft, p = elem.offsetParent;
		while( p != undefined ){
			r += p.offsetTop;
			p = p.offsetParent;
		}
    	return r;
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

	function toArray( target ){  // 单个转数组， 集合转数组
		(target.length == undefined) && ( target = [target] );
      	target = Array.prototype.slice.call(target);
      	return target;
	}

	function strToDom( str ){
		var callee = arguments.callee, i;
		( callee._i == undefined ) 
		&& ( callee._i = document.createElement('div'));
		i = callee._i;
		i.innerHTML = str;
		return i.children;
	}

	exports.utils = { 
					slice: slice,
					Timing: Timing,
					Event: Event,
					EventEmitter: EventEmitter,
					inherit: inherit,
					extend: extend,
					getClientLeft: getClientLeft,
					getClientTop: getClientTop,
					toArray: toArray,
					strToDom: strToDom
				};
})(window)