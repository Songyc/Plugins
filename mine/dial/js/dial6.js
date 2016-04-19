(function (window, u) {
	'use strict';

	//isMobile
	var	doc = window.document,
		global = {},
		isTouchStart = 'ontouchstart' in window,
	    touchStart = isTouchStart ? 'touchstart' : 'mousedown',
	    touchMove = isTouchStart ? 'touchmove' : 'mousemove',
	    touchEnd = isTouchStart ? 'touchend' : 'mouseup',
	    emtpyFunc = function () {},
	    fn = {}, extendFn = true,
	    docEle = doc.documentElement;

	var oToString = Object.prototype.toString,
		oHasOwn = Object.prototype.hasOwnProperty,
		aSlice = Array.prototype.slice;

	// 默认设置参数
	var defaultOptions = {
		blockNumber: 8, 							// 点击的块元素个数
		origin: "50% 50%", 							// 旋转中心
		blockNumberIndex: true, 					// 是否设置块元素的下标
		transition: "",								// 旋转的过渡动画
		onDraw: null, 								// 回调函数，默认值为null
		click: true, 								// 是否点击块元素
		clickTarget: null, 							// 指定的块元素集合
		isReverse: false, 							// 是否按逆时针开始计算
		isLock: false, 								// 是否锁屏
		autoPlay: false, 							// 是否自动播放
		clickClass: null,							// 点击块元素的类名
		isDefault: 'isDefault' 	 					// 默认参数的标记。
	};

	//private function 
	fn.extend = function extend(defaults, opt, extra) { 	// 方法extend将参数defaults和参数opt合并，并且支持多个参数合并。如果最后一个参数为布尔true，支持深度拷贝。参数defaults为默认对象, 参数opt是被合并对象。
		var args = aSlice.call(arguments), k,
			argsL = args.length,
			deep = args[argsL - 1], 					// 获取最后一个参数, 赋值给deep
			isObject = oToString.call(deep) === '[object Object]',  		// 判断deep是不是布尔型
			opts, optsL;
		if(!opt)  return defaults;						// 如果参数opt不存在, 返回参数defaults 				
		optsL = isObject ? argsL - 1 : argsL - 2;		// 如果deep为布尔, 则参数opts的个数为argsL - 2; 否则为argsL - 1。
		if(optsL > 1) { 								// 2个或者2个以上
			for(var i = 1; i <= optsL; i++) { 			// 不算参数defaults，从第二个参数开始计算起。
				extend(defaults, args[i], isObject ? undefined : deep);		// 调用extend(defaults, opt, deep)方法;
			}
		}else {
			for(k in opt) { 							// 遍历参数opt
				if(oHasOwn.call(opt, k)) {				// 如果是自定义属性
					if(deep === true && oToString.call(opt[k]) === '[object Object]') { 				// 如果是支持深度拷贝，并且参数opt的键值指向的是对象
						extend(defaults, opt[k], true); 		// 再次调用extend(defaults, opt, deep)方法;
					}else {
						defaults[k] = opt[k];			// 深拷贝属性
					}	
				}
			}
		}
		return defaults; 				
	}

	fn.extend(fn, {
		isTouchStart: isTouchStart,
		each: function (obj, fn, context) {
			if(oToString.call(obj) === '[object Array]' || obj.item) {
				var i = 0, l = obj.length;
				for( ;i < l; i++) {
					if(fn.call(context || obj, obj[i], i, obj) === false){
						break;
					}
				}
			}else if(oToString.call(obj) === '[object Object]'){
				var i;
				for(i in obj) {
					if(obj.hasOwnProperty && obj.hasOwnProperty(i)) {
						if(fn.call(context || obj, obj[i], i, obj) === false) {
							break;
						}
					}
				}
			}
		},
		makeArray: function (obj) {
			var ret = [];
			if(Type.isArray(obj)) { 	 						// 数组就直接返回数组	
				return obj;
			}else if(!Type.isArray(obj) && obj.length || obj.item || Type.isObject(obj)){ 		// 不是数组并且有长度，或者NodeList和HTMLCollection实例，也是类数组对象。
				fn.each(obj, function (value, key, obj) {
					ret.push(value);
				});
			}else { 										// 只有一个非数组对象
				ret[0] = obj;
			}
			return ret;
		},
		hasOwn: function (obj, key) {
			return obj && oHasOwn.call(obj, key);
		},
		stringToNumber: function (str) {
			var rstrtonum = /(\d+)/g;
			return +rstrtonum.exec(str)[1];
		},
		getComputedStyle: function (obj, prop) {
			return window.getComputedStyle(obj, null)[prop] || 0;
		},
		emptyObject: function (obj) {
			if(!Type.isObject(obj)) {
				return false;
			}
			fn.each(obj, function (value, key, obj) {
				if(value) {
					return false;
				}
			});
			return true;
		},
		contains: function (parent, child) {
			return parent.contains && parent.contains(child);
		}
	});

	// 类型判断
	var Type = {},
		aTypeString = 'Boolean Number String Function Array Date RegExp Object'.split(' ');

	fn.each(aTypeString, function (name, i){
		Type["is" + name] = function (obj) {
			if(oToString.call(obj) === '[object ' + name + ']') {
				return true;
			}
			return false;
		}
	});

	fn.extend(fn, {Type: Type});

	var getAngleAndLen = function (obj, center) {
		var diffX = obj.x - center.x,
			diffY = obj.y - center.y;
		return {
			angle: Math.round(Math.atan2(diffY, diffX) * 180 / Math.PI),
			length: Math.ceil(Math.sqrt(diffX * diffX + diffY * diffY))
		}
	},	

	tableRotate = function (angle) {
		this.style.transform = "rotate("+angle+"deg)";
		this.style.webkitTransform = "rotate("+angle+"deg)";
	},

	tableTransition = function (transition) {
		if(transition.trim()) {
			this.style.transition = transition;
			this.style.webkitTransition = transition;
			this.style.msTransition = transition;
			this.style.mozTransition = transition;
			this.style.oTransition = transition;
		}
	},

	getRealAngle = function (curAngle, startAngle) {
		var reAngle = curAngle - startAngle,
			eachRotateAngle = global.eachRotateAngle,
			realReAngle = reAngle,
			blockNumber = global.options.blockNumber,
			blockNumberIndex = global.options.blockNumberIndex,
			roNum = Math.round(realReAngle / eachRotateAngle);

		eachRotateAngle = (eachRotateAngle !== (360 / blockNumber)) && blockNumberIndex ? 360 / blockNumber : eachRotateAngle;
		return roNum * eachRotateAngle;
	},

	getParent = function (obj) {
		return obj.parentNode ? obj.parentNode : obj.parentElement;
	},

	clickTargetEvent = function (obj, eachRotateAngle) {
		var clickTargetAngle,
			firstElementAngle = -90, 					// 第一个元素是-90
			objPar, angle, clickAngle,
			dialElement = global.dialElement;
			// 要点中才能转
			if(obj !== dialElement) {
				// 过滤其它元素，选中的元素是有index的
				if(obj.index !== undefined && typeof obj.index === 'number'){	
					// 
					clickTargetAngle = getAngleAndLen(global.startClientPos, global.centerPos).angle; 		// 点击的坐标到圆心的长度和角度
					if(clickTargetAngle >= 90) 
						clickTargetAngle -=  360; 														//如果点击位置在左下半圆, 设置为负数  
					clickAngle = - (Math.round((clickTargetAngle - firstElementAngle) / eachRotateAngle) * eachRotateAngle); 	// 要转的角度
					angle = global.angle + clickAngle;
					return angle;
				}else{
					objPar = getParent(obj);
					angle = clickTargetEvent(objPar, eachRotateAngle);
				}
			}
		return angle || global.angle;
	};

	var Handler = {};

	fn.extend(Handler, {
		startHandler: function (e) {
			var data = Cache.dialData,
				centerPos = getCss.getCenterPos(this), 						// 获取转盘中心坐标
				startClientPos = getCss.getClientPos(e);					// 鼠标按下时的坐标
			e.preventDefault(); 

			// Event.on(this, touchMove, Handler.moveHandler, false);
			this.addEventListener(touchMove, Handler.moveHandler, false);
			this.addEventListener(touchEnd, Handler.endHandler, false);

			fn.extend(data, {
				centerPos: centerPos,
				startClientPos: startClientPos,
				isMove: false
			});
		},
		moveHandler: function (e) {
			e.preventDefault();
			var	data = Cache.dialData,
				self = data.dial,
				centerPos = global.centerPos,	
				startClientPos = global.startClientPos,	
				moAngle = global.moAngle, 			// 实际上滑动的角度
				angle = global.angle,
				transition = global.options.transition,
				// 当前鼠标位置
				curPos = {
					x: isTouchStart ? e.touches[0].clientX : e.clientX,
					y: isTouchStart ? e.touches[0].clientY : e.clientY
				},
				// 开始鼠标与中心的角度
				startAngle = getAngleAndLen(startClientPos, centerPos).angle,
				// 当前鼠标与中心的角度
				curAngle = getAngleAndLen(curPos, centerPos).angle,
				// 相对滑动角度， 比如手指滑动了23度，超过了45的一半，就按45算。
				reAngle = getRealAngle(curAngle, startAngle);
				// 加上之前的相对滑动角度
				moAngle = angle + curAngle - startAngle;
				// 转盘跟着转 
				tableRotate.call(self, moAngle); 			
				// 效果跟着转
				tableTransition.call(self, transition);
			// 记录数据 
			global.reAngle = reAngle;
			global.moAngle = moAngle;
			global.endClient = curPos;
			// 记录用手滑动，并非点击
			data.isMove = true;
			// 阻止冒泡
			if(e.stopProgation) {
				e.stopProgation()
			}else{
				e.cancelBubble = true;
			}

			self.addEventListener(touchEnd, Handler.endHandler, false);
		},
		endHandler: function (e, obj) {
			var ev = e || window.event;
			ev.preventDefault();
			var data = Cache.dialData,
				self = data.dial,
				target = e.target,
				options = global.options,
				angle = global.angle,
				transition = global.options.transition,
				blockNumber = options.blockNumber,
				blockNumberIndex = options.blockNumberIndex,
				wAngle, 
				index,
				angle1,
				blockAngle,
				clickAngle,
				clickTargetAngle,
				eachRotateAngle = global.eachRotateAngle;
			// 解除绑定
			// Event.off(self, touchMove);
			self.removeEventListener(touchMove, Handler.moveHandler, false);
			self.removeEventListener(touchEnd, Handler.endHandler, false);

			// 加上之前的滑动的角度，求总角度。
			angle += global.reAngle;

			// 如果是点击的话, 按元素的位置计算出滑动的角度
			if(!data.isMove){
				angle = clickTargetEvent(target, eachRotateAngle);
			}
			// 复制一份，用于后面计算
			angle1 = angle;	
			// 顺时针还是逆时针转
			if(!global.isReverse) {
				angle1 = - angle1;		
			}
			
			wAngle = angle1 % 360; 	
			// 余角必须为正数
			if(wAngle < 0) wAngle += 360;
			// 转动元素的个数
			index = Math.ceil(wAngle / eachRotateAngle);	
			// 动画
			tableTransition.call(self, transition);
			tableRotate.call(self, angle); 		
			// 记录数据
			global.angle = angle;
			global.curIndex = index;
			if(options.onDraw) {
				options.onDraw.call(global);
			}
		}
	});

	fn.extend(fn, {Handler: Handler});

	var Prefix = {},
		aPrefixString = 'webkit ms moz o'.split(" "),
		ablePrefixPro = "transform transform-origin".split(" ");
	fn.each(aPrefixString, function (name, i) {
		Prefix[name] = "-" + name + "-";
	});

	var setCss = {};

	fn.extend(setCss, {
		setPrefix: function (objStyle, prefix) {
			if(!prefix || !fn[prefix]) {   						// 如果参数prefix不存在，或者查找到fn.prefix这个值，直接返回参数objStyle
				return objStyle;
			}
			fn.each(objStyle, function (value, key, objStyle) {
				if(~ablePrefixPro.indexOf(key)) { 				// 如果含有可以增加前缀的属性，则增加。
					objStyle[fn[prefix] + key] = value;
				}
			});
			return objStyle;
		},
		setStyle: function (elems, objStyle, prefix) {
			fn.each(fn.makeArray(elems), function (name, i, elems) {
				fn.each(prefix ? setCss.setPrefix(objStyle, prefix) : objStyle, function (value, key, objStyle) {
					if(fn.hasOwn(objStyle, key)) {
						name.style.cssText += key + ":" + objStyle[key] + ";";
					}
				});
			});
		},
		setClickBlockPos: function (dialElement, prefix) {
			var data = Cache.data(Cache, 'dialData'),
				elems = data.clickBlock,
				radius = data.radius;
			
			fn.each(elems, function (el, index, elems) {
				var width = fn.stringToNumber(fn.getComputedStyle(el, 'width')),
					height = fn.stringToNumber(fn.getComputedStyle(el, 'height'));

				// 设置所有块元素到转盘中心
				setCss.setStyle(el, {
					"position":"absolute",
					"left": "50%",
					"top": "50%",
					"margin-left": "-" + (width / 2) + "px",
					"margin-top": "-" + (height / 2) + "px"
				}, prefix);

				// 设置所有块元素到圆边上
				var x, y, 
					eachRotateAngle = data.eachRotateAngle,
					totalAngle = 0, eChild;
				totalAngle = eachRotateAngle * index; 				// 计算块元素旋转角度
				x = radius * ( Math.sin(totalAngle * Math.PI / 180 ));
				y =  -radius * (Math.cos(totalAngle * Math.PI / 180 ));
				if(x) { 								
	                if( (x+"").indexOf("e-") > 1) { 				// 可能会出现接近0的数,则设置为0
	                    x = 0;
	                }else{
	                    x = +x; 									// 否则直接转成整数
	                }
	            }
	            if(y) {
	                if( (y+"").indexOf("e-") > 1) {
	                    y = 0;
	                }else{
	                    y = +y;
	                }
	            }
	            setCss.setStyle(el, {
	            	"transform": 'translate(' + x + 'px, ' + y + 'px)' 		
	            }, 'webkit');
			});
		}
	});

	var getCss = {};

	fn.extend(getCss, {
		getClientPos: isTouchStart ? function (e) {
			return {
				x: e.touches[0].clientX,
				y: e.touches[0].clientY
			}
		} : function (e) {
			return {
				x: e.clientX,
				y: e.clientY
			}
		},
		getCenterPos: function (el) { 									// getCss.getCenterPos(el)返回元素的中心坐标
			var elPropObj = getCss.getBoundingClientRect(el);
			return {
				x: elPropObj.right - elPropObj.width / 2,
				y: elPropObj.bottom - elPropObj.height / 2
			}
		},
		getBoundingClientRect: function (el) { 						// getCss.getBoundingClientRect(el)返回一个对象，该对象包含元素左边距,上边距,右边到左视窗, 下边到上视窗, 宽度, 高度。
			var left = docEle.clientLeft,
				top = docEle.clientTop,
				rect = el.getBoundingClientRect();
			return {
				left: rect.left - left,
				top: rect.top - top,
				right: rect.right - left,
				bottom: rect.bottom - top,
				width: rect.right - rect.left,
				height: rect.bottom - rect.top
			}
		},
		getAngleAndLen: function (obj, center) {
			var diffX = obj.x - center.x,
				diffY = obj.y - center.y;
			return {
				angle: Math.round(Math.atan2(diffY, diffX) * 180 / Math.PI),
				length: Math.ceil(Math.sqrt(diffX * diffX + diffY * diffY))
			}
		},	
	})

	fn.extend(fn, {Prefix: Prefix, setCss: setCss, getCss: getCss});

	// 缓存
	var Cache = {};

	fn.extend(Cache, {
		uuid: 0,
		cache: {},
		dialData: {},
		data: function (elem, name, data) {
			if(!elem) {
				return;
			}
			if(!name) {
				return elem;
			}
			var id, propCache, cache,
				isNode = elem.nodeType, 
				thisCache;
			if(isNode) { 										// 如果是元素，用Cache.cache作为缓存体。

				cache = Cache.cache;		
				id = elem.uuid; 								// 获取元素的唯一id标识
				if(!id) {										
					elem.uuid = id = ++Cache.uuid; 		
				}
				thisCache = cache[id];
				if(!thisCache) { 								// 如果元素缓存对象不存在, 说明没初始化或者被删掉过
					cache[id] = thisCache = {};
				}							
				propCache = thisCache[name]; 					// 获取元素缓存对象的属性缓存对象
				if(!propCache) {								// 如果属性缓存对象不存在, 说明没初始化或者被删掉
					thisCache[name] = propCache = {};			// 初始化
				}
				if(data !== undefined) {
					propCache = data;
				}

			}else { 										// 如果是普通对象，直接用普通对象当成缓存体。
				propCache = elem[name];
			}		
			return propCache;
		},		
		removeData: function (elem, name) {
			if(!elem) {
				return;
			}
			if(!name) {
				return elem;
			}
			var id, cache,
				isNode = elem.nodeType,
				thisCache;
			if(isNode) { 									

				cache = Cache.cache;
				id = elem.uuid; 							// 查找不到唯一标识id，说明没有缓存或者已被删除
				if(!id) {									
					return;
				}
				thisCache = cache[id]; 						// thisCache保存元素缓存对象，降低对象的调用层级
				
				if(name in thisCache) { 					// 删除参数name指定的属性
					delete thisCache[name];
				}
			}else {
				if(name in elem) {
					delete elem[name];
				}
			}
		}
	});

	fn.extend(fn, {Cache: Cache});

	// 事件
	var Event = {};

	fn.extend(Event, {

		now: function () {
			return Date.now();
		},
		dispatch: function (event) {
			var target = event.target,
				type = event.type,
				eventCache = Cache.data(this, 'events'),
				handlerList = eventCache[type],
				selector;

			fn.each(handlerList, function (handlerObj, handlerObjIndex, handlerList) {
				selector = handlerObj.selector;
				if(selector) {
					var eventTargets = this.querySelectorAll(selector);
					fn.each(eventTargets, function (eventTarget, index, eventTargets) {
						if(fn.contains(eventTarget, target) || eventTarget === target) { 	// 如果是其中一个选择器元素包含目标元素，或者等于目标元素
							handlerObj.handler.call(eventTarget, event); 						
						}
					});
				}else{
					handlerObj.handler.call(this, event);
				}
			}, this);
		},
		on: function (elems, type, selector, func, one) { 								// 参数selector支持事件代理, 参数useCapture是否支持捕获, 参数one是否绑定一次事件
			if(!elems) {																// 如果没有元素，则返回
				return;
			}

			if(!Type.isString(selector)) { 												// 如果是fn.on(elems, type, fn)的情况
				one = func;
				func = selector;
				selector = null;
			}

			fn.each(fn.makeArray(elems), function (el, index, elems) { 					// 遍历elems集合, 由于each只能遍历数组和对象,无法遍历非数组非纯对象的集合。所以要先转化成数组，再遍历。
				var eventCache, mainHandler,
					handlerList,  
					handlerObj = {};
				
				eventCache = Cache.data(el, 'events'); 									// 获取元素的事件缓存对象

				mainHandler = eventCache.mainHandler;									// 主回调函数
				if(!mainHandler) {
					eventCache.mainHandler = mainHandler = function (event) {
						Event.dispatch.apply(this, arguments);
					}
				}

				handlerList = eventCache[type]; 										// 尝试从缓存中获取事件列表对象，如果不存在则初始化列表数组
				if(!handlerList) { 													
					handlerList = eventCache[type] = [];
					handlerList.delegateCount = 0;										// 初始化代理事件个数
				}

				fn.extend(handlerObj, { 												// 事件描述对象
					selector: selector,
					type: type,
					handler: func
				});

				if(selector) {
					handlerList.splice(handlerList.delegateCount++, 0, handlerObj); 	// 如果有代理事件,放在普通事件前，代理事件后，标记代理个数加1
				}else{
					handlerList.push(handlerObj); 										// 如果只有普通事件，则加入结尾
				}

				el.addEventListener(type, mainHandler, false); 							// 绑定主回调函数
			});
		},
		off: function (elems, type, selector, func) {
			if(!elems) {
				return;
			}
			fn.each(fn.makeArray(elems), function (el, index, elems) {
				var eventCache, mainHandler,
					context = this,
					handlerList;
		
				eventCache = Cache.data(el, 'events'); 
				handlerList = eventCache[type];
				mainHandler = eventCache.mainHandler;
				if(!handlerList) { 														// 如果没有找到唯一标记id，说明事件缓存对象不存在;事件缓存对象中对应类型的事件队列不存在，说明还没绑定过事件。直接返回。
					return;
				}

				if(Type.isFunction(selector)) { 										// 如果是fn.off(elems, type, func)的情况
					func = selector;
					selector = null;
				}

				fn.each(handlerList, function (handlerObj, i, handlerList) {
					if(!selector && !handlerObj.selector) { 							// 如果参数selector不存在并且事件描述对象的selector属性为undefined，说明是普通事件
						handlerList[i] = false; 										// 把事件描述对象设置为false
					}
					if(handlerObj.selector && handlerObj.selector === selector) {		// 如果参数selector是字符串并且等于事件描述对象的selector属性
						handlerList[i] = false;											// 把事件描述对象设置为false
						handlerList.delegateCount--;									// 标记事件代理个数自减1	
					}
				});

				eventCache[type] = handlerList.filter(function (handlerObj) { 			// 过滤所有为false的事件描述对象
					return handlerObj !== false;
				});

				if(!eventCache[type].length) { 											// 如果事件队列对象为空，说明已经删除所有事件描述对象。
					el.removeEventListener(type, mainHandler, false);					// 解绑主回调函数 
					delete Cache.cache[el.uuid];										// 删除该元素的事件缓存对象
				}

			});
		}
	})
	
	fn.extend(fn, {Event: Event});

	// Dial 构造函数，接受两个参数。其中selector是选择器，opt是初始化参数对象。
	var Dial = function (selector, opt) {

		var dialElement = document.querySelector(selector),
			dial = dialElement,
			options = fn.extend(defaultOptions, opt),
			clickBlock, clickClass = options.clickClass,
			origin = options.origin;		
		
		// 通过clickClass获取点击的块元素
		if(clickClass) {
			clickBlock = document.querySelectorAll(clickClass);
		}

		Cache.dialData = global = {};

		fn.extend(Cache.dialData, options, {
			self: this, 					// 实例化的dial
			dial: dial,		// 转盘元素
			options: options, 				// 扩展属性
			clickBlock: clickBlock,
			click: true,
			moAngle: 0,
			reAngle: 0,
			angle: 0,
			eachRotateAngle: 360 / options.blockNumber,
		});

		// 设置转盘旋转中心
		setCss.setStyle(dial, {"transform-origin": origin}, 'webkit');
		// 设置块元素位置
		setCss.setClickBlockPos(dial, 'webkit');
		// 给每个点击的东西编号
		if(options.click && options.clickTarget) {
			for(var i = 0, l = options.clickTarget.length; i < l; i++) {
				options.clickTarget[i].index = i;
			}
		}
		// 监听touchStart
		Event.on(dial, touchStart, Handler.startHandler, clickClass);
	};
	
	Dial.prototype = {
		constructor: Dial,
		getCurIndex: function () {
			return global.curIndex;
		}
	};
	Dial.fn = fn;
	window.Dial = Dial;

})(window);