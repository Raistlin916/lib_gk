(function( exports ){
	var utils = exports.utils,
		extend = utils.extend,
		slice = utils.slice,
		EventEmitter = utils.EventEmitter,
		inherit = utils.inherit;
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

	exports.CanvasHandler = CanvasHandler;
})(window)