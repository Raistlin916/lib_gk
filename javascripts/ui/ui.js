(function ( exports, undefined ) {
	function List( id ){
			var list = document.getElementById(id),
				self = this;
			list.addEventListener( 'click', function(e){
				var target = e.target;

				self.clickCallback && self.clickCallback(target.innerHTML);
			});

			this.list = list;
		}
	List.prototype = {
		add: function ( string ) {
			var flag = false;
			this.addCallback && (flag = this.addCallback( string ));
			if( flag ){
				var li = document.createElement('li');
				li.innerHTML = string;
				this.list.appendChild( li );
			}
		},
		getChildren: function () {
			var children = [];
			Array.prototype.forEach.call(this.list.querySelectorAll('li'), function(li){
					children.push(li.innerHTML);
				});
			return children;
		},
		bind: function( inputId, buttonId	){
			var input = document.getElementById( inputId ),
					button = document.getElementById( buttonId ),
					self = this;
			button.addEventListener('click', function(){
				var item = input.value;
				if( item !== '' ){
					self.add(item);
				}
			});
		},
		onAdd: function( fn ){
			this.addCallback = fn;
		},
		onClick: function ( fn ) {
			this.clickCallback = fn;
		}
	};

	function CheckBox ( id ) {
		var div = document.getElementById(id),
				target;
		div.addEventListener('click', function (e) {
				target = e.target;
				if( target.type == 'checkbox' ){
					Array.prototype.forEach.call(div.querySelectorAll('input'), function(item){
							if( item !== target)
								item.checked = false;
						})
					div.value = target.value;
					target.checked = true;
				}
			});
		this.div = div;
	};
	CheckBox.prototype = {
		set: function( value ){
			Array.prototype.forEach.call(this.div.querySelectorAll('input'), function(item){
					if( item.value === value)
						item.checked = true;
					else
						item.checked = false;
				})
		}
	}

	exports.List = List;
	exports.CheckBox = CheckBox;
})(window);