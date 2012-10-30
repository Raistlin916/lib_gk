(function(exports, undefined){
		function $ ( id ) {
			return document.getElementById( id );
		}
		var Event = exports.utils.Event,
			Timing = exports.utils.Timing;

		var table = $('operating_table'),
			startBtn = $('start_traverse'),
			marginInput = $('margin_input'),
			actionCanvas = $('action_canvas'),
			actionInputSpacing = $('action_input_spacing'),
			actionInputPaddingTop = $('action_input_padding_top'),
			actionBtnApply = $('action_apply'),
			actionInputBaseline = $('action_input_baseline'),
			actionInputAlign = $('action_input_align'),
			newBtn = $('new_button'),
			exportBtn = $('export_button'),
			showHandler = new CanvasHandler($('show_canvas')),
		    spriteHandler = new SpriteHandler(),
			tableContext = table.getContext('2d'),
			targetImage = new Image(),
			actionManager = new ActionManager( targetImage, actionCanvas );

		var baselineCheckbox = new CheckBox( 'action_input_baseline' ),
			alignCheckbox = new CheckBox('action_input_align');

		targetImage.src = '/getImage';

		targetImage.onload = function(){
			var w = targetImage.naturalWidth,
				h = targetImage.naturalHeight;

			table.width = w;
			table.height = h;
			actionCanvas.width = w;

			tableContext.drawImage(targetImage, 0, 0);

			var contentLayer = new ImageHandler( tableContext.getImageData(0, 0, w, h) ),
				upperLayer = new ImageHandler( tableContext.getImageData(0, 0, w, h) ); 

			Event.on( 'selectOne', function ( x, y ) {
				var sprite = spriteHandler.cut( contentLayer, x, y );
				if( sprite ){
					upperLayer.setRect( sprite, 
						function ( pixel ) {
							pixel.b = 100;
							pixel.a = 100;
							return pixel;
						});
					upperLayer.putOn( tableContext );

					actionManager.addAction( sprite );
					_createAnimate( actionManager.export().actions );

				} 
			});

			Event.on( 'clear:table', function(){
				contentLayer.putOn( tableContext );
				upperLayer = new ImageHandler( tableContext.getImageData(0, 0, w, h) ); 
			});

			Event.on( 'load', function ( animates ) {
				animates.forEach( function ( animate ) {
					contentLayer.putOn( tableContext );
					upperLayer.setRect( animate.srect, 
						function( pixel ){
							pixel.b = 100;
							pixel.a = 100;
							return pixel;
						});
					upperLayer.putOn( tableContext );
				} );
			});

			Event.on( 'change:margin', function (margin) {
				spriteHandler.margin = margin;
			});

			Event.on( 'ActionManager:refresh', function () {
				var config = { 
								spacing: actionInputSpacing.value,
								padding_top: actionInputPaddingTop.value,
								baseline: actionInputBaseline.value,
								align: actionInputAlign.value
							};
				actionManager.refresh( config );

				_createAnimate(actionManager.export().actions);
			});

			Event.on('refreshAll', function () {
				Loop.delete( 'action', function(){
					showHandler.clear();
					actionManager.clear();
					Event.emit('clear:table');
					alignCheckbox.set('middle');
					baselineCheckbox.set('natural');
				});
			});

			Event.on('startTraverse', function () {

				Timing.start('traverse');
				var sprites = spriteHandler.traverse( contentLayer );
				Timing.out();

				Timing.start('draw');
				sprites.forEach(function(sprite){
					upperLayer.setRect( sprite, 
							function ( pixel, x, y ) {
								pixel.b = 100;
								pixel.a = 255;
								return pixel;
							});
				});
				upperLayer.putOn( tableContext );
				Timing.out();

			});
		};

		table.onmousedown = function(event){
			Event.emit('selectOne', event.offsetX, event.offsetY);
		}

		startBtn.onclick = function(){
			Event.emit('startTraverse');
		}

		actionBtnApply.onclick = function(){
			Event.emit('ActionManager:refresh');
		}

		exportBtn.onclick = function(){
			var form = document.createElement('form'),
				input = document.createElement('input'),
				value = JSON.stringify(store.export());
			form.action = '/readAnimates';
			form.method = 'post';
			input.value = value;
			input.name = 'animates';
			form.appendChild( input );
			form.submit();
		}

		marginInput.addEventListener('change', function(){
			Event.emit('change:margin', marginInput.value);
		});

		newBtn.onclick = function(){
			Event.emit('refreshAll');
		}

		function Store(){
			this.memory = {};
		}
		Store.prototype = {
			add: function ( key, value ) {
				if( !this.checkCollision(key) ){
					this.memory[key] = value;
					return true;
				} else {
					return false;
				}
			},
			load: function ( key ) {
				return this.memory[key];
			},
			export: function () {
				return this.memory;
			},
			checkCollision: function ( key ) {
				return this.memory[key] !== undefined;
			}
		}

		var list = new List('animate_list'),
			store = new Store();
		list.bind('add_list_input', 'add_list_button');

		list.onAdd( function ( name ) {
			Event.emit('refreshAll');
			return store.add(name, actionManager.export());
		} );

		list.onClick( function ( name ) {
			var animates = store.load(name),
				actions = animates.actions;
			_createAnimate( actions );
			actionManager.read( actions );
			Event.emit('clear:table');
			Event.emit('load', actions );

			alignCheckbox.set( animates.config.align );
			baselineCheckbox.set( animates.config.baseline );

		} );

		// 仅仅是一个内部函数
		function _createAnimate( animates ){
			var count = 0;
			Loop.delete('action');
			var loop = new Loop(function(dt){
				showHandler.refresh();
				showHandler.drawImage(targetImage, animates[count].srect,
										animates[count].drect.shadowOffset(100, 100));
			}, 'action');
			loop.addStep( 200, function(){
				count++;
				if( count >= animates.length )
					count = 0;
			});
			loop.start();
		}

	})(window);


