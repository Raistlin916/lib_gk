(function( exports, undefined ){


	function SpriteHandler( color ){
			this.bkColor = color;
			this.margin = 0;
		}
	SpriteHandler.prototype = {
			cut: function( imageHandler, x, y ){
						var margin = this.margin;
						if( margin === undefined )
							margin = 0;
						margin = parseInt(margin);
						
						var lu, rl, flag = false;
						lu = {x:x, y:y};
						rl = {x:x, y:y};


						var start = imageHandler.get(x, y);

						if( start === undefined )
							return; 
							
						if( !start.isValid() )
							return;
						// shit!
						for( var i = margin + 1; i--; ){
							if( i != margin ){
								lu.x--;
								lu.y--;
								rl.x++;
								rl.y++;
							}
							
							do{
								flag = false;
								imageHandler.setRect(lu, rl, function(pixel, x, y, line){
									if( pixel.isValid() ){
										flag = true;
										switch(line) {
											case 'left': lu.x--; break;
											case 'top': lu.y--; break;
											case 'right': rl.x++; break;
											case 'bottom': rl.y++; break;
										}
										return 'next';
									}
								});		
								flag && (i = margin + 1);					
							} while( flag );
						}

						if( lu.x < 0 )
							lu.x = 0;
						if( lu.y < 0)
							lu.y = 0;
						if( rl.x >= imageHandler.w)
							rl.x = imageHandler.w - 1;
						if( rl.y >= imageHandler.h)
							rl.y = imageHandler.h - 1;
					return new Rect({ left: lu.x, top: lu.y, right: rl.x, bottom: rl.y });
				},
			traverse: function( imageHandler ){
				var grid = new Grid( imageHandler.w, imageHandler.h, 20, 20),
					i, j, sprite, flag,
					w = imageHandler.getWidth(),
					h = imageHandler.getHeight();

				for( i = w; i--; ){
					for( j = h; j--; ){
						flag = !grid.isIn( i, j );
						//如果不在存在的矩形中
						//进行像素操作
						if( flag ){
							sprite = this.cut( imageHandler, i, j);
							!!sprite && grid.addRect( sprite );
						}
					}
				}
				return grid.getAll();
			}
	};

	exports.SpriteHandler = SpriteHandler;
})(window)