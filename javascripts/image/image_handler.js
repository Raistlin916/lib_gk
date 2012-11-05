"use strict";
(function(exports, undefined){
	var utils = exports.utils,
		extend = utils.extend,
		slice = utils.slice,
		EventEmitter = utils.EventEmitter,
		inherit = utils.inherit;


	function ImageHandler( imageData ) {
		this.imageData = imageData;
		this.array = imageData.data;
		this.h = imageData.height;
		this.w = imageData.width;
		this._option = {
			similar: 30
		};
	}
	ImageHandler.prototype = {
		get : function ( x, y ) {
				if( !this.isValid(x, y) ){
					return undefined;
				}
				var r = this.array[ 4 * (x + y * this.w) ],
					g = this.array[ 4 * (x + y * this.w) + 1],
					b = this.array[ 4 * (x + y * this.w) + 2],
					a = this.array[ 4 * (x + y * this.w) + 3];
				if( r === undefined || g === undefined || b === undefined || a === undefined){
					return undefined;
				}
				return new Pixel( r, g, b, a );
			},
		set : function ( x, y, value ){
				if( value === undefined)
					return;
				if ( value.r !== undefined){
					this._set( x, y, 0, value.r);
				} 
				if ( value.g !== undefined ){
					this._set( x, y, 1, value.g);
				}
				if ( value.b !== undefined ){
					this._set( x, y, 2, value.b);
				}
				if ( value.a !== undefined ){
					this._set( x, y, 3, value.a);
				}
			},
		_set : function ( x, y , i , v) {
				if( this.isValid(x, y) )
					this.array[ 4 * (x + y * this.w) + i ] = v;
			},
		isValid : function (x, y){
			return x >= 0 && x < this.w && y >=0 && y < this.h;
		},
		putOn : function ( context, x, y ) {
				if ( x === undefined || y === undefined ){
					x = 0;
					y = 0;
				}
				context.putImageData( this.imageData, x, y );
			},
		eachPixel : function ( callback ) {
			var i, j, temp;
			for( i = this.w; i--; )
				for( j = this.h; j--;){
					this.set( i, j, callback(this.get( i, j ), i, j));
				}
		},
		getSegment : function ( from, to ) {

			var dirtx = to.x - from.x,
				dirty = to.y - from.y,
				directx = dirtx === 0 ? 0 : dirtx / Math.abs(dirtx),
				directy = dirty === 0 ? 0 : dirty / Math.abs(dirty),
				result = [],
				pixel,
				temp = extend({}, from);

			// :(
			for (; temp.x != to.x + directx || temp.y != to.y + directy; temp.x += directx) {
				for (temp.y = from.y; temp.y != to.y + directy; temp.y += directy) {
					pixel = this.get(temp.x, temp.y);
					if( !!pixel ) {
						result.push({x:temp.x, y:temp.y, pixel:pixel});
					}
				}
				if( directy === 0 ){
					pixel = this.get(temp.x, temp.y);
					if( !!pixel ) {
						result.push({x:temp.x, y:temp.y, pixel:pixel});
					}
				}
			}
			if( directx === 0 && directy === 0){
				pixel = this.get(temp.x, temp.y);
				if( !!pixel ) {
					result.push({x:temp.x, y:temp.y, pixel:pixel});
				}
			}
			return result;
		},
		setSegment : function ( from, to, callback, context ) {
			var array = this.getSegment( from, to ),
			self = this,
			result;
			array.every( function ( item ) {
				result = callback( item.pixel, item.x, item.y )
				if( result === true)
					return true;
				if( result === false)
					return false;
				self.set( item.x, item.y, result);
				return true;
			});
			if( !!context ){
				this.putOn( context );
			}
		},
		getRect : function ( upperLeft, lowerRight ) {
			var x1 = upperLeft.x,
				y1 = upperLeft.y,
				x2 = lowerRight.x,
				y2 = lowerRight.y;
			// 存在两个点的冗余
			return {
					top: this.getSegment( upperLeft, {x:x2, y:y1} ),
					left: this.getSegment( upperLeft, {x:x1, y:y2}),
					bottom: this.getSegment( {x:x1, y:y2}, lowerRight),
					right: this.getSegment( {x:x2, y:y1}, lowerRight )
				};
		},
		setRect : function ( upperLeft, lowerRight, callback, context ) {
			if( arguments[0] instanceof Rect ){
				var rect = arguments[0];
				context = arguments[2];
				callback = arguments[1];
				upperLeft = { x: rect.left, y: rect.top };
				lowerRight = { x: rect.right, y: rect.bottom };
			}
			var rect = this.getRect( upperLeft, lowerRight ),
				self = this,
				result;
			for( var line in rect ){
				rect[line].every(function( item ){
					result = callback( item.pixel, item.x, item.y, line );
					if( result === true)
						return true;
					if( result === 'next' || result === false)
						return false;
					self.set( item.x, item.y, result);
					return true;
				})
				if( result === false){
					break;
				}
			}
			if( !!context ){
				this.putOn( context );
			}
		},
		cover: function( upperLayer ){
			this.eachPixel(function ( pixel, i, j ) {
				var p = upperLayer.get( i, j );
				if( p.isValid() ){
					pixel = p;
				}
				return pixel;
			});
		},
		traverseSimilar: function( sx, sy, cb, context, diff ){
			var q = [], t, tp, sPixel = this.get(sx, sy),
				self = this, past = {}, result, diff = diff || self._option.similar;
			
			if( sPixel == undefined ){
				return;
			}
			q.push({ x:sx, y:sy, p:sPixel.copy() });
			do {
				t = q.shift();
				past[t.x+','+t.y] = true;
				result = cb( t.p, t.x, t.y );
				if( result === true || result == undefined ){

				} else if( result === false ) {
					return;
				} else {
					this.set( t.x, t.y, result );
				}
				_move(1,0);
				_move(0,1);
				_move(-1,0);
				_move(0,-1);
			} while( q.length );
			if( !!context ){
				this.putOn( context );
			}
			
			// 手动清空，不知道为啥没回收
			past = undefined;

			function _move( ox, oy ){
				var x = t.x + ox,
					y = t.y + oy;
				// 先看看有没有越界
				if( tp = self.get( x, y ) ){
					if( past[x+','+y] ){
						return;
					}
					if( tp.isSimilar( sPixel, diff ) ){
						q.push( { x: x, y: y, p: tp } );
						past[x+','+y] = true;
					}
				}
			}
		},
		setSimilar: function( sx, sy, c, context, diff ){
			this.traverseSimilar( sx, sy, function( pixel, x, y ){
					//pixel.prase( c );
					if( c.r !== undefined ){
						pixel.r = c.r;
					}
					if( c.g !== undefined ){
						pixel.g = c.g;
					}
					if( c.b !== undefined ){
						pixel.b = c.b;
					}
					if( c.a !== undefined ){
						pixel.a = c.a;
					}
					return pixel;
				}, context, diff );
		},
		option: function( op ){
			if( arguments.length ){
				extend( this._option, op );
			} else {
				return extend( {}, this._option );
			}
			
		},
		getWidth: function(){
			return this.w;
		},
		getHeight: function(){
			return this.h;
		}
	};


	function Pixel ( r, g, b, a ){
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
	Pixel.prototype = {
		isValid: function(){
			return ( this.r !== 0 ||
					this.g !== 0 ||
					this.b !== 0 ||
					this.a !== 0 );
		},
		isSimilar: function( targetPixel, range ){
			range = range || 0;
			var s = 0, self = this;
/*			for( var key in this){
				if( this.hasOwnProperty(key) ){
					s += Math.abs(targetPixel[key] - this[key]);
				}
			}*/
/*			Object.keys( this ).forEach(function(key){
				s += Math.abs(targetPixel[key] - self[key]);
			})*/
			s += Math.abs(targetPixel.r - this.r);
			s += Math.abs(targetPixel.g - this.g);
			s += Math.abs(targetPixel.b - this.b);
			s += Math.abs(targetPixel.a - this.a);
			if( s <= range ){
				return true;
			} else {
				return false;
			}
		},
		copy: function(){
			return new Pixel( this.r, this.g, this.b, this.a );
		},
		prase: function( target ){
			extend(this, target);
		},
		getRGBA: function(){
			var p = this;
			return 'rgba('+p.r+','+p.g+','+p.b+','+p.a+')';
		},
		getRGB: function(){
			var p = this;
			return 'rgb('+p.r+','+p.g+','+p.b+')';
		},
		get16: function(){
			var p = this;
			return '#'+p.r.toString(16)+p.g.toString(16)+p.b.toString(16);
		}
	}

	function Rect( left, top, right, bottom ){
		if( arguments.length == 1){
			extend(this, arguments[0]);
		} else {
			this.left = left;
			this.top = top;
			this.right = right;
			this.bottom = bottom;
		}

		this.xmax = Math.max(this.left, this.right);
		this.ymax = Math.max(this.top, this.bottom);
		this.xmin = Math.min(this.left, this.right);
		this.ymin = Math.min(this.top, this.bottom);
	}
	Rect.prototype = {
		isIn: function ( x, y ) {
				return  this.xmax >= x &&
						this.xmin <= x &&
						this.ymax >= y &&
						this.ymin <= y;
			},
		getWidth: function () {
			return this.xmax - this.xmin;
		},
		getHeight: function () {
			return this.ymax - this.ymin;
		},
		shadowTo: function ( x, y ) {
			return new Rect( x, y, x + this.getWidth(), y + this.getHeight() );
		},
		shadowOffset: function ( offsetx, offsety) {
			return new Rect( this.left + offsetx, this.top + offsety, 
						this.right + offsetx, this.bottom + offsety );
		}
	}

	// 索引，二维数组或对象属性
	function Index ( cols, rows ) {
		this.array = [];
		for(var i = cols; i--; ){
			this.array.push([]);
			for(var j = rows; j--;){
				this.array[cols-i-1].push([]);
			}
		}
	}
	Index.prototype = {
		get: function ( x, y ) {
			return this.array[x][y];
		},
		set: function ( x, y, value ) {
			this.array[x][y].push(value);
			return this;
		}
	}

	// 网格，用来优化碰撞检测
	function Grid ( w, h, cols, rows ) {
		this.all = [];
		this.index = new Index(cols, rows);
		this.gridWidth = w/cols;
		this.gridHeight = h/rows;
	}
	Grid.prototype = {
		addRect: function ( rect ) {
				this.all.push( rect );
				var left = parseInt(rect.xmin/this.gridWidth),
					top = parseInt(rect.ymin/this.gridHeight),
					right = parseInt(rect.xmax/this.gridWidth),
					bottom = parseInt(rect.ymax/this.gridHeight),
					i, j;
				for( i = left; i <= right; i++){
					for( j = top; j <= bottom; j++){
						this.index.set( i, j, rect );
					}
				}
				return this;
			},
		isIn: function ( x, y ) {
				if ( x instanceof Rect ){
					var rect = x;

				} else {
					var col = parseInt( x/this.gridWidth ),
						row = parseInt( y/this.gridHeight ),
						rects = this.index.get( col, row ),
						rect, flag;

					rects.every(function( e ){
						rect = e;
						flag = !rect.isIn( x, y );
						if( flag ) 
							rect = undefined;
						return flag;
					});
					return rect;
				}
			},
		getAll: function(){
			return this.all;
		}
	}

	function CanvasHandler ( canvas ){
		this.Super.apply( this, arguments );
		this.context = canvas.getContext('2d');
		this.canvas = canvas;
	}
	CanvasHandler.prototype = {
		drawImage: function( image ){
			var args = slice.call(arguments, 1);
			if( args[0] instanceof Rect ){
				var srect = args[0],
					drect = args[1];
				this.context.drawImage( image, srect.left, srect.top, srect.getWidth(), srect.getHeight(),
										drect.left, drect.top, drect.getWidth(), drect.getHeight());
				return;
			}

			this.context.drawImage.apply( this.context, arguments );
		},
		drawLine: function ( start, end, color ) {
			color = color || 'black';
			var context = this.context;
			context.save();
			context.beginPath();
			context.moveTo( start.x, start.y );
			context.lineTo( end.x, end.y );
			context.strokeStyle = color;
			context.stroke();
			context.restore();
			
		},
		refresh: function () {
			this.canvas.width = this.canvas.width;
		},
		clear: function(){
			this.refresh();
		},
		getWidth: function () {
			return this.canvas.width;
		},
		getHeight: function () {
			return this.canvas.height;
		},
		getCenter: function () {
			return { x: parseInt(this.getWidth()/2), y: parseInt(this.getHeight()/2) }
		},
		// 重写父类方法
		bind: function( name, cb ){
			var self = this;
			this._super.bind.apply( this, arguments );
			this.canvas.addEventListener( name, function(e){
							// 兼容要重写
							self.emit( name, e.offsetX, e.offsetY );
						});
		}
	}
	inherit( CanvasHandler, EventEmitter );

	exports.ImageHandler = ImageHandler;
	exports.CanvasHandler = CanvasHandler;
	exports.Rect = Rect;
	exports.Grid = Grid;
})(window)