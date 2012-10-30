(function ( exports, undefined ) {
	var extend = exports.utils.extend;

	// 配置是共享的
	var AM_Config = {
		spacing: 5,  			//间距
		padding_top: 20,  		//上内距
		padding_bottom: 20,
		baseline: 'natural',	//对齐线
		align: 'middle'
	} 

	function ActionManager ( sourceImage, displayPanel ) {
			if( !sourceImage instanceof HTMLImageElement)
				console.error('sourceImage should be HTMLImageElement');
			if( !displayPanel instanceof HTMLCanvasElement)
				console.error('displayPanel should be HTMLCanvasElement');
			this.panel = new CanvasHandler( displayPanel );
			this.actions = [];
			this.sourceImage = sourceImage;
		}
		ActionManager.prototype = {
			addAction: function ( srect ) {
				var dPos = this.getDrectPostion( srect ),
				drect = srect.shadowTo( dPos.x, dPos.y ),
				shadowPos = this.getShadowRectPostion( srect ),
				shadowRect = srect.shadowTo( shadowPos.x, shadowPos.y );

				this.actions.push({ srect: srect, 
					drect: drect,
					shadowRect: shadowRect});
				this.showOne( this.actions.length - 1 );
			},
			refresh: function ( config ) {
				if( config.baseline !== undefined )
					AM_Config.baseline = config.baseline;
				if( config.align !== undefined )
					AM_Config.align = config.align;

				var key, value;
				for( key in config ){
					value = parseInt(config[key]);
					// 如果不是NaN
					if( value === value )
						config[key] = value;
					else
						delete config[key];
				}

				extend( AM_Config, config );
				this.panel.refresh();

				// 拷贝一个副本，清空原数组
				var temp = extend( [], this.actions );
				this.actions = [];

				// 将原数组重新加入，完成刷新
				var self = this;
				temp.forEach( function ( action ) {
					self.addAction( action.srect );
				});

				this.showBaseLine();
			},
			showOne: function ( index ) {
				var action = this.actions[index];
				this.panel.drawImage( this.sourceImage, action.srect, action.shadowRect );
			},
			showAll: function () {
				var self = this;
				this.actions.forEach(function ( action, index ) {
					self.showOne( index );
				});
			},
			getShadowRectPostion: function ( srect ) {
				var baseline = AM_Config.baseline,
					last = this.actions[ this.actions.length - 1 ],
					first = this.actions[0],
					position, 
					bottom = this.panel.canvas.height;

				if( last === undefined )
					position = { x: AM_Config.spacing };
				else 
					position  = { x: last.shadowRect.xmax + AM_Config.spacing }

				switch(baseline) {
					case 'head':
						position.y = AM_Config.padding_top;	
					break;
					case 'heart':
						position.y = this.panel.getCenter().y - parseInt(srect.getHeight()/2);
					break;
					case 'foot':
						position.y = this.panel.getHeight() - AM_Config.padding_bottom - srect.getHeight();
					break;
					case 'natural':
						if( !first ){
							position.y = this.panel.getCenter().y - parseInt(srect.getHeight()/2);
						} else {
							position.y =  first.shadowRect.ymin + ( srect.ymin - first.srect.ymin );
						}
					break;
					default:
						position.y = parseInt( - srect.getHeight()/2 );
					break;
				}
				return position;
			},
			getDrectPostion: function ( srect ) {
				var baseline = AM_Config.baseline,
					align = AM_Config.align,
					last = this.actions[ this.actions.length - 1 ],
					first = this.actions[0],
					position = {}, 
					bottom = this.panel.canvas.height;

				switch(align){
					case 'left':
						position.x = 0;
					break;
					case 'middle':
						position.x = parseInt( -srect.getWidth()/2 );
					break;
					case 'right':
						position.x = -srect.getWidth();
					break;
				}
				

				switch(baseline) {
					case 'head':
						if( !last ){
							position.y = parseInt( - srect.getHeight()/2 );
						} else {
							position.y = last.drect.ymin;
						}			
					break;
					case 'heart':
						position.y = parseInt( - srect.getHeight()/2 );
					break;
					case 'foot':
						if( !last ){
							position.y = parseInt( - srect.getHeight()/2 );
						} else {
							position.y = last.drect.ymax - srect.getHeight();
						}
					break;
					case 'natural':
						if( !first ){
							position.y = parseInt( - srect.getHeight()/2 );
						} else {
							position.y =  first.drect.ymin + ( srect.ymin - first.srect.ymin );
						}
					break;
					default:
						position.y = parseInt( - srect.getHeight()/2 );
					break;
				}
				return position;
			},
			read: function ( actions ) {
				this.panel.refresh();
				this.actions = actions;
				this.showAll();
			},
			export: function () {
				var actions = extend([], this.actions),
					result = {
						actions: actions,
						config: {
							baseline: AM_Config.baseline,
							align: AM_Config.align
						}
					}
				return result;
			},
			clear: function () {
				this.panel.refresh();
				this.actions = [];
			},
			showBaseLine: function(){
				var spacing = AM_Config.spacing,
					w = this.panel.getWidth(),
					h = this.panel.getHeight(),
					padding_top = AM_Config.padding_top,
					padding_bottom = AM_Config.padding_bottom;

				switch ( AM_Config.baseline ) {
					case 'head':
						this.panel.drawLine({ x: spacing, y: padding_top },
											{ x: w - spacing, y: padding_top });
					break;
					case 'heart':
					break;
					case 'foot':
						this.panel.drawLine({ x: spacing, y: h - padding_bottom },
											{ x: w - spacing, y: h - padding_bottom});
					break;
					case 'natural':
					break;
				}
			}
		}
	exports.ActionManager = ActionManager;
})(window);

