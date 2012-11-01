(function ( exports, undefined ) {
	var requestAnimFrame  =  (function() {
				return 	window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
					window.setTimeout(callback, 1000/60);
				};
			})();


			var loops = [];
			function Loop ( callback, name, that ) {
				if( this === window )
					throw 'err';
				loops.push({name:name, instance:this});
				this.callback = callback;
				this.context = that;
				this.steps = [];
			}
			Loop.clear = function(){
				// 内存是否有泄露？
				loops.forEach( function ( loop ) {
					loop.instance.pause();
				});
				loops = [];
			}
			Loop.delete = function( name , onEnd ){
				loops.forEach(function ( loop, index, array ) {
					if( loop.name === undefined )
						return;
					if( loop.name === name ){
						loop.instance.pause( onEnd );
						array.splice( index, 1 );
						loops = array;
					}
				});
			}
			Loop.prototype = (function(){
				function loop(){
					if (!this.keepRunning) {
						this.onEnd && this.onEnd();
						delete this.onEnd;
						return;
					}
					var self = this;
					requestAnimFrame(function(now){
						now || (now = +new Date);
						var dt = (now - self.lastTime) ;
						if (dt >= 3000){
							dt = 250;
						}
						self.callback.call(self.context, dt);
						self.steps.forEach( function ( step, index, array ) {
							step.elapse += dt;
							if( step.elapse >= step.interval ){
								step.elapse = 0;
								step.callback();
								if( !step.repeat ){
									//删除该项
									array.splice( index, 1 );
									self.steps = array;
								}
							}
						});
						self.lastTime = now;
						loop.call(self);
					});
				}
				return {
					start: function(){
						this.keepRunning = true;
						this.lastTime = new Date();
						loop.call(this);
					},
					// onEnd 当loop停止后立即回调执行
					pause: function( onEnd ){
						this.keepRunning = false;
						this.onEnd = onEnd;
					},
					addStep: function( interval, callback, repeat){
						if( repeat === undefined )
							repeat = true;
						this.steps.push({elapse:0, interval:interval, callback:callback, repeat:repeat });
					}
				}
			})();

	exports.Loop = Loop;
})(window);