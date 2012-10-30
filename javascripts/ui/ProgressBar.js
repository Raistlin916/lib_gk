function ProgressBar( color, width, height ){
			var outer = document.createElement('div'),
				inner = document.createElement('div'),
				w = width || 200,
				h = height || 20;
			this.color = color = color || 'lightblue';

			this.w = w;

			inner.style.width = 0;
			inner.style.height = h + 'px';
			inner.style.backgroundColor = color;

			outer.style.marginTop = '1px';
			outer.style.border = '1px solid rgba(0,0,0,0.5)';
			outer.style.width = w + 'px';
			outer.style.height = h + 'px';
			outer.appendChild( inner );
			this.inner = inner;
			this.outer = outer;
		} 
		ProgressBar.prototype = {
			getElement: function(){
				return this.outer;
			},
			setPercent: function( per ){
				if( per <= 100 ){
					this.inner.style.width = this.w * per /100 + 'px';
				} else {
					this.cb && ( this.cb.call( this.outer ), delete this.cb );
				}
			},
			onDone: function( cb ){
				this.cb = cb;
			}
		}