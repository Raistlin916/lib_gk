/*
	var fr = new FileReceiver(div);
	// e.data, e.type, e.name
    fr.onload = function( e ){

    }
*/

(function(window){
	function FileReceiver( elem, className, enterClassName ){
		var self = this,
			submitElement = this.submitElement,
			showerElement = this.showerElement,
			loading;
		className || (className = 'file-receiver');
		enterClassName || (enterClassName = 'dragenter');

		elem.classList.add(className);
		if( elem.tagName.toLowerCase() == 'input' && 
			elem.type.toLowerCase() == 'file'){
			elem.addEventListener('change', changeHandler);
		} else {
			elem.addEventListener('dragleave', dragleaveHandler);
			elem.addEventListener('dragenter', dragenterHandler);
			elem.addEventListener('drop', dropHandler);
		}
		function changeHandler(e){
			loader(e).start();
		}

		function dragleaveHandler(e){
			this.classList.remove(enterClassName);
		}

		function dragenterHandler(e){
			this.classList.add(enterClassName);
		}

		function dropHandler(e){
			e.stopPropagation();  
		    e.preventDefault();  
		   	loading = loader(e);
		   	loading.start();
		    this.classList.remove(enterClassName);
		}


		function loader(e){
			var files = (e.dataTransfer && e.dataTransfer.files) || (e.target && e.target.files),
		    	fr = new FileReader(),
		    	n = 0, file, data, body = [], 
		    	onloadall = self.onloadall;
		    loader.start = function t(){
		    	file = files[n];
		    	type = file.type;

				if( type.indexOf('image') >= 0){
					fr.readAsDataURL(file);
				} else {
					fr.readAsText(file);
				}

				fr.onload = function(e){
					data = e.target.result;
					self.onload && self.onload.call(elem, {
													data:data, 
													name:file.name, 
													type:file.type,
													size:file.size
												});
						if( ++n < files.length ){
							t();
						} 
					}
		    };
		    return loader;
		}
	}
	var p = FileReceiver.prototype;
	p.becomeSubmit = function( elem ){
		this.submitElement = elem;
	}
	p.becomeShower = function( elem ){
		this.showerElement = elem;
	}

	window.FileReceiver = FileReceiver;
})(window);