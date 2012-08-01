(function(global, MultiDrag){
	'use strict';
	var DisplayHelper, util;

	DisplayHelper = function(){
		this.init();
	};
	DisplayHelper.prototype.init = function(){
		var that = this;
		this.isListen = false;
		this.elListeners = [];//{element:HTMLElement, listetners:[function(){},....]}
		this.domListener = util.throttle(function(){
			that.check();
		}, 100);
	};
	DisplayHelper.prototype.check = function(){
		console.log("check");
		var calls = [];
		this.elListeners.forEach(function(item){
			var wasDisplay = item.isDisplay, i, isDisplay = util.isDisplayed(item.element);
			item.isDisplay = isDisplay;
			if(!wasDisplay && isDisplay){
				calls = calls.concat(item.listetners);
			}
		});
		setTimeout(function(){
			calls.forEach(function(call){
				call();
			});
		}, 0);
	};
	DisplayHelper.prototype.addListener = function(){
		document.addEventListener("DOMSubtreeModified", this.domListener);
		this.isListen = true;
	};
	DisplayHelper.prototype.removeListener = function(){
		document.removeEventListener("DOMSubtreeModified", this.domListener);
		this.isListen = false;
	}
	DisplayHelper.prototype.add = function(element, callback){
		var isDisplay = util.isDisplayed(element), item = this.elListeners.filter(function(listItem){
			return listItem.element === element;
		})[0];
		if(item){
			item.listetners.push(callback);
		}else{
			item = {element: element, listetners: [callback], isDisplay: isDisplay };
			this.elListeners.push(item);
			if(!this.isListen){
				this.addListener();
			}
		}
		;
		if(isDisplay){
			callback();
		}
	};
	DisplayHelper.prototype.remove = function(element, callback){
		var index, item = this.elListeners.filter(function(item){
			return item.element === element;
		})[0];
		if(item){
			util.remove(item.listetners, callback);
			if(!item.listetners.length){
				util.remove(this.elListeners, item);
				if(!this.elListeners.length){
					this.removeListener();
				}
			}
		}
	};

	util = {
		addClass: function(element, className){
			if(!this.hasClass(element, className)){
				element.className = (element.className + ' ' + className).replace(/\s+/g, ' ').replace(/(^ | $)/g, ' ');
			}
		},
		removeClass: function(element, className){
			var classExist = new RegExp('(^|\\s)' + className + '(\\s|$)', 'g');
			element.className = element.className.replace(classExist, '$1').replace(/\s+/g, ' ').replace(/(^ | $)/g, '');
		},
		hasClass: function(element, className){
			var classExist = new RegExp('(^|\\s)' + className + '(\\s|$)', 'g');
			return classExist.test(element.className);
		},
		getDafaultParent: function(element){
			var parent = element.parentNode;
			while(parent.parentNode && window.getComputedStyle(parent)["position"] === "static"){
				parent = parent.parentNode;
			}
			return parent;
		},
		bind: function(func, context){
			return function(){
				return func.apply(context, [].splice.call(arguments, 0));
			};
		},
		getTouchByID: function(element, touchId){
			var i;
			for(i = 0; i < element.changedTouches.length; i++){
				if(element.changedTouches[i].identifier === touchId){
					return element.changedTouches[i];
				}
			}
			return false;
		},
		getSumValueOfStyleRule: function(element, rules){
			return rules.reduce(function(sum, rule){
				return sum + parseInt(window.getComputedStyle(element)[rule]);
			}, 0);
		},
		extend: function(sub, sup){
			var F = function(){
			};
			F.prototype = sup.prototype;
			sub.prototype = new F();
			sub.prototype.constructor = sub;
			sub.superclass = sup.prototype;
			if(sup.prototype.constructor === Object.prototype.constructor){
				sup.prototype.constructor = sup;
			}
		},
		augment: function(receiving, giving){
			var i, methodName;
			if(arguments[2]){
				for(i = 2; i < arguments.length; i++){
					receiving.prototype[arguments[i]] = giving.prototype[arguments[i]];
				}
			}else{
				for(methodName in giving.prototype){
					receiving.prototype[methodName] = giving.prototype[methodName];
				}
			}
		},
		appendFirstChild: function(element, node){
			element.firstChild ? element.insertBefore(node, element.firstChild) : element.appendChild(node);
		},
		range: function(start, stop, step){
			var result = [];
			if(typeof stop === 'undefined'){
				stop = start;
				start = 0;
			}
			if(typeof step === 'undefined'){
				step = 1;
			}
			if((step > 0 && start >= stop) || (step < 0 && start <= stop)){
				return [];
			}
			for(var i = start; step > 0 ? i < stop : i > stop; i += step){
				result.push(i);
			}
			return result;
		},
		remove: function(array, obj){
			var index = array.indexOf(obj);
			if(index != -1){
				array.splice(index, 1);
			}
		},
		waitCall: function(func, context, time){
			return function(){
				var that = context || this, arg = [].splice.call(arguments, 0);
				setTimeout(function(){
					func.apply(that, arg);
				}, time || 0);
			}
		},
		dictionFactory: function(){
			var dictionary = [], getRowIndex = function(key){
				var i, row;
				for(i = 0; i < dictionary.length; i++){
					row = dictionary[i];
					if(row[0] === key){
						return i;
					}
				}
				return -1;
			}
			return {
				setValue: function(key, value){
					var index = getRowIndex(key);
					if(index != -1){
						dictionary[index][1] = value;
					}else{
						dictionary.push([key, value]);
					}
					return value;
				},
				getValue: function(key){
					var index = getRowIndex(key);
					return index != -1 ? dictionary[index][1] : null;
				},
				remove: function(key){
					var index = getRowIndex(key);
					if(index != -1){
						return dictionary.splice(index, 1)[1];
					}
					return null;
				},
				isExist: function(key){
					var index = getRowIndex(key);
					return index != -1;
				}
			};
		},
		setStyle: function(element, style, isOnlyAdd){
			style = style || {};
			var cssText = "", key;
			for(key in style){
				if(style.hasOwnProperty(key)){
					cssText += key + " : " + style[key] + "; ";
				}
			}
			if(isOnlyAdd){
				element.style.cssText += cssText;
			}else{
				element.style.cssText = cssText;
			}
		},
		triggerFactory: function(opts){
			var funcs = [], i, options = {
				isReverse: false,
				isStopOnTrue: false,
				context: window
			};
			for(i in opts){
				if(opts.hasOwnProperty(i)){
					options[i] = opts[i];
				}
			}
			;
			return {
				fire: function(){
					var args = [].slice.call(arguments), i, retValue, fs = options.isReverse ? funcs.slice().reverse() : funcs;
					try{
						for(i = 0; i < fs.length; i++){
							retValue = fs[i].apply(options.context, args);
							if(options.isStopOnTrue && retValue){
								return true;
							}
						}
						return !options.isStopOnTrue;
					}
					catch(t){
						alert(t.message);
					}
				},
				add: function(f){
					funcs.push(f);
				},
				remove: function(f){
					var index = funcs.indexOf(f);
					if(index !== -1){
						funcs.splice(index, 1)
					}
				}
			}
		},
		throttle: function(callback, time){
			var timerId;
			return function(){
				var arg = [].slice.call(arguments);
				timerId && clearTimeout(timerId);
				timerId = setTimeout(function(){
					callback(arg);
				}, time);
			}
		},
		isDisplayed: function(element){
			return !!element.offsetParent;
		}
	};

	util.displayHelper = new DisplayHelper();

	MultiDrag = MultiDrag || {};
	MultiDrag.util = util;
	global.MultiDrag = MultiDrag;
})(window, window.MultiDrag);