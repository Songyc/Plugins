(function (window, u) {
	'use strict';

	var	doc = window.document,
		docEle = doc.documentElement,
		isTouchStart = 'ontouchstart' in window,
	    touchStart = isTouchStart ? 'touchstart' : 'mousedown',
	    touchMove = isTouchStart ? 'touchmove' : 'mousemove',
	    touchEnd = isTouchStart ? 'touchend' : 'mouseup',
	    emptyFn = function () {}, dial,
	    fn = {}, extendFn = true;

	var oToString = Object.prototype.toString,
		oHasOwn = Object.prototype.hasOwnProperty,
		aSlice = Array.prototype.slice;

	// 默认设置参数
	var defaultOptions = {
		blockNumber: 8, 							// 点击的块元素个数
		origin: "50% 50%", 							// 旋转中心
		transition: "",								// 旋转的过渡动画
		onChange: emptyFn, 							// 回调函数，默认值为空
		isLock: false, 								// 是否锁屏
		autoPlay: false, 							// 是否自动播放
		clickClass: null,							// 点击块元素的类名
		oneStep: false, 							// 每次滑动一步
		curBlockChange: false, 						// 转盘滑动后的块元素的角度是否朝上
		radius: 100,								// 设置块元素中心到转盘中心的距离
		consistentAngle: false,						// 设置块元素是否与初始化的角度同向, 此参数为true时，curBlockChange为false
		position: "center center"					// 设置转盘位置
	};

	//private function 
	fn.extend = function extend(defaults, opt, extra) { 	// 方法extend将参数defaults和参数opt合并，并且支持多个参数合并。如果最后一个参数为布尔true，支持深度拷贝。参数defaults为默认对象, 参数opt是被合并对象。
		var args = aSlice.call(arguments), k,
			argsL = args.length,
			deep = args[argsL - 1], 						// 获取最后一个参数, 赋值给deep
			isObject = oToString.call(deep) === '[object Object]',  		// 判断deep是不是布尔型
			opts, optsL;
		if(!opt)  return defaults;							// 如果参数opt不存在, 返回参数defaults 				
		optsL = isObject ? argsL - 1 : argsL - 2;			// 如果deep为布尔, 则参数opts的个数为argsL - 2; 否则为argsL - 1。
		if(optsL > 1) { 									// 2个或者2个以上
			for(var i = 1; i <= optsL; i++) { 				// 不算参数defaults，从第二个参数开始计算起。
				extend(defaults, args[i], isObject ? undefined : deep);		// 调用extend(defaults, opt, deep)方法;
			}
		}else {
			for(k in opt) { 									// 遍历参数opt
				if(oHasOwn.call(opt, k)) {			
					if(deep === true && oToString.call(opt[k]) === '[object Object]') { 				// 如果是支持深度拷贝，并且参数opt的键值指向的是对象
						extend(defaults, opt[k], true); 		// 再次调用extend(defaults, opt, deep)方法;
					}else {
						defaults[k] = opt[k];					// 深拷贝属性
					}	
				}
			}
		}
		return defaults; 				
	}

	fn.extend(fn, {
		isTouchStart: isTouchStart,
		each: function (obj, fn, context) {
			if(oToString.call(obj) === '[object Array]') {
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
				for(var i = 0, l = obj.length; i < l; i++) {
					ret.push(obj[i]);
				}
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
		isEmptyObject: function (obj) {
			if(!Type.isObject(obj)) {
				return false;
			}
			var i;
			for(i in obj) {
				return false;
			}
			return true;
		},
		contains: function (parent, child) {
			return parent.contains && parent.contains(child);
		},
		repeat: function (str, repeat) {
			for(var i = 1; i < repeat; i++) {
				str += str;
			}
			return str;
		},
		parent: function (el) {
			if(el.parentNode.nodeType === 1 && el.parentNode.nodeType !== 11) {
				return el.parentNode;
			}
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

	var Prefix = {},
		aPrefixString = 'webkit o moz ms'.split(" "),
		ablePrefixPro = "transform transform-origin".split(" ");
	fn.each(aPrefixString, function (name, i) {
		Prefix[name] = "-" + name + "-";
	});

	var setCss = {},
		mapPosition = {
			"left top": {"left": "0%", "top": "0%"},
			"top left": {"left": "0%", "top": "0%"},
			"left center": {"left": "0%", "top": "50%"},
			"center left": {"left": "0%", "top": "50%"},
			"left bottom": {"left": "0%", "top": "100%"},
			"bottom left": {"left": "0%", "top": "100%"},
			"center top": {"left": "50%", "top": "0%"},
			"top center": {"left": "50%", "top": "0%"},
			"center center": {"left": "50%", "top": "50%"},
			"center bottom": {"left": "50%", "top": "100%"},
			"bottom center": {"left": "50%", "top": "100%"},
			"right top": {"left": "100%", "top": "0%"},
			"top right": {"left": "100%", "top": "0%"},
			"right center": {"left": "100%", "top": "50%"},
			"center right": {"left": "100%", "top": "50%"},
			"right bottom": {"left": "100%", "top": "100%"},
			"bottom right": {"left": "100%", "top": "100%"}
		};
	fn.extend(setCss, {
		setPrefix: function (objStyle, prefix) {
			if(fn.isArray(prefix) && prefix.length) {
				fn.each(prefix, function (item, i, prefix) {
					setCss.setPrefix(objStyle, item);
				});
			}
			if(!prefix || fn.isString(prefix) && !fn[prefix]) {   						// 如果参数prefix不存在，或者数组的长度为0，或者查找到fn.prefix这个值，直接返回参数objStyle
				return;
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
		debugRadius: function (num) {								// 可能会出现接近0的数,则设置为0
			if(num) { 								
                if( (num + "").indexOf("e-") > 1) { 				
                    num = 0;
                }else{
                    num = +num; 									// 否则直接转成整数
                }
            }
            return num;
		},
		setClickBlockPos: function (prefix) {
			var data = Cache.data(dial, 'dataObj'),
				elems = data.clickBlock,
				radius = data.radius;
			
			fn.each(fn.makeArray(elems), function (el, index, elems) {
				// 设置所有块元素到转盘中心
				var width, height;
					width = fn.stringToNumber(getCss.getComputedStyle(el, 'width'));
					height = fn.stringToNumber(getCss.getComputedStyle(el, 'height'));
				if(index === 0) {
					el.className += " cur";
				}

				setCss.setStyle(el, {
					"position":"absolute",
					"left": "50%",
					"top": "50%",
					"margin-left": "-" + (width / 2) + "px",
					"margin-top": "-" + (height / 2) + "px"
				}, prefix);

				// 设置所有块元素到圆边上
				var x, y, totalAngle = 0,
					eachRotateAngle = data.eachRotateAngle,
					consistentAngle = data.consistentAngle;

				totalAngle = eachRotateAngle * index; 				// 计算块元素旋转角度
				x = radius * ( Math.sin( Matrix.angleToRadian(totalAngle) ));
				y =  -radius * (Math.cos( Matrix.angleToRadian(totalAngle) ));
				
	            x = setCss.debugRadius(x);
	            y = setCss.debugRadius(y);
	            
	            setCss.setStyle(el, { 								
	            	"transform": 'translate(' + x + 'px, ' + y + 'px)' 		
	            }, aPrefixString);

	            if(consistentAngle) {
	 				setCss.setStyle(el, 
						Matrix.getMatrix(el, totalAngle), 
					aPrefixString);
	            }
			});
		},
		setPosition: function (el, pos) {
			var parentNode = fn.parent(el),
				parPos = getCss.getComputedStyle(parentNode, "position");
			if(parPos === "static") {								// 设置父元素为position属性为relative
				setCss.setStyle(parentNode, {"position": "relative"});
			}

			var width, height, 
				posObj = {};
			width = fn.stringToNumber(getCss.getComputedStyle(el, 'width'));
			height = fn.stringToNumber(getCss.getComputedStyle(el, 'height'));
			posObj = mapPosition[pos] || mapPosition["center center"];

			setCss.setStyle(el, fn.extend(posObj, {
				"margin-left": "-" + width/2 + "px",
				"margin-top": "-" + height/2 + "px"
			}));

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
			var disX = obj.x - center.x,
				disY = obj.y - center.y;
			return {
				angle: Math.round(Math.atan2(disY, disX) * 180 / Math.PI),
				length: Math.ceil(Math.sqrt(disX * disX + disY * disY))
			}
		},	
		getComputedStyle: function (obj, prop) {
			return window.getComputedStyle(obj, null)[prop] || 0;
		},
		getRelativeAngle: function (curAngle, startAngle) {
			var data = Cache.data(dial, 'dataObj'),
				relativeAngle = curAngle - startAngle,
				eachRotateAngle = data.eachRotateAngle,
				relativeNumber = Math.round(relativeAngle / eachRotateAngle); 			// 四舍五入计算转动的块数
			return relativeNumber * eachRotateAngle; 									// 返回转动的相对角度
		},
		getBlockIndex: function (angle) {
			var copy = angle, 
				data = Cache.data(dial, 'dataObj'),
				blockNumber = data.blockNumber,					
				wAngle, eachRotateAngle = data.eachRotateAngle;				 		
			wAngle = copy % 360;  														// 求余角
			if(wAngle == 0) {															// 余角为0, 说明转动了整圈数
				return 0;
			}
			if(wAngle < 0) {
				wAngle += 360; 															// 余角必须为正数 	
			}
			return blockNumber - Math.ceil(wAngle / eachRotateAngle);					// 当前元素的下标
		}
	})

	fn.extend(fn, {Prefix: Prefix, setCss: setCss, getCss: getCss});

	// 缓存
	var Cache = {};

	fn.extend(Cache, {
		uuid: 0,
		cache: {},
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
				self = this,
				eventCache = Cache.data(this, 'events'),
				handlerList = eventCache[type],
				selector, handlerObj, i = 0;
			if(!handlerList) { 									// 如果事件全部被解绑后, 会被删除该类型的事件列表, 此时handlerList为undefined。
				return;
			}
			while(handlerObj = handlerList[i++]) { 				// 遍历事件队列
				selector = handlerObj.selector;
				if(selector) {
					var eventTargets = self.querySelectorAll(selector);
					fn.each( fn.makeArray(eventTargets), function (eventTarget, index, eventTargets) {
						if(fn.contains(eventTarget, target) || eventTarget === target) { 	// 如果是其中一个选择器元素包含目标元素，或者等于目标元素
							handlerObj.handler.call(eventTarget, event); 		 			// 执行代理事件				
						}
					});
				}else {
					handlerObj.handler.call(self, event); 									// 执行普通事件
				}
			}
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
					handlerList, thisCache,
					handlerObj = {};

				eventCache = Cache.data(el, 'events'); 										// 获取元素的事件缓存对象
				thisCache = Cache.cache[el.uuid];

				mainHandler = thisCache.mainHandler;									// 主回调函数
				if(!mainHandler) {
					thisCache.mainHandler = mainHandler = function (event) {
						Event.dispatch.apply(this, arguments);
					}

					mainHandler.el = el;
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
					context = this, thisCache,
					handlerList;

				eventCache = Cache.data(el, 'events'); 										// 获取元素的事件缓存对象
				
				if(!eventCache) {
					return;
				}
				thisCache = Cache.cache[el.uuid];

				handlerList = eventCache[type];
				mainHandler = thisCache.mainHandler;
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
					delete eventCache[type];
				}

				if(fn.isEmptyObject(eventCache)) {

					delete thisCache['events'];											// 删除该元素的事件缓存对象
					delete thisCache['mainHandler'];

					if(fn.isEmptyObject(thisCache)) {
						delete Cache.cache[el.uuid];
					}
				}
			});
		}
	});
	
	fn.extend(fn, {Event: Event});
 	
	var Guadrant = {},
		reverseObj = {
			slide: {
				isReverse: fn.repeat("1 2 3 4 ", 10), 								// 逆时针转的路径, 为什么复制十份, 估计没人会绕十圈转。
				noReverse: fn.repeat("1 4 3 2 ", 10)								// 顺时针转的路径
			},
			isClick: {
				noReverse: "2 3", 													
				isReverse: "1 4"													// 模似点击时在一四象限为逆时转, 在二三象限为顺时针转
			}
		};
	fn.extend(Guadrant, {
		getPosGuadrant: function (angle) { 											// 分象限
			if(angle > 180 || angle < -180){
				return;
			}									
			if(angle >= 0) {
				if(angle > 90) {
					return "3";
				}else{
					return "4";
				}
			}else{
				if(angle < -90) {
					return "2";
				}else{
					return "1";
				}
			}
		},
		isReverse: function (listStr, startAngle, endAngle, isClick) {
			var reverse, guadrant,
				isReverseStr = reverseObj.slide.isReverse,
				reverseStr = reverseObj.slide.noReverse;

			listStr = listStr.trim();
			if(!listStr) { 	 					
				return;
			}
			if(listStr.length === 1) {  						// 滑动范围是同一象限。角度越小是逆时针, 越大是顺时针
				if(startAngle - endAngle > 0) {					// 逆时针
					return true;
				}else if(startAngle - endAngle < 0){ 			// 顺时针
					return false
				}else if(startAngle === endAngle && isClick){ 		// 可能是沿着同一角度的方向滑动或者类似点击不滑动的情况
					guadrant = Guadrant.getPosGuadrant(endAngle);
					if(~reverseObj.isClick.isReverse.indexOf(guadrant)) {
						return true;
					}else if(~reverseObj.isClick.noReverse.indexOf(guadrant)){
						return false;
					}
				}
			}
			if(~isReverseStr.indexOf(listStr)) { 		// 逆时针轨迹匹配到参数listStr，则认为是逆时针转动
				return true;
			}else if(~reverseStr.indexOf(listStr)){		
				return false;
			}
		},
		makerGuadrantList: function (curAngle) { 					// 构造路径象限队列
			var guadrant, data = Cache.data(dial, 'dataObj'),
				guadrantList = data.guadrantList || [],
				filterGuadrantListString = "";

			guadrant = Guadrant.getPosGuadrant(curAngle); 			// 获取当前鼠标坐标的象限
			guadrantList.push(guadrant);

			fn.each(guadrantList, function (item, i, guadrantList) { 		// 去重
				if(filterGuadrantListString.indexOf(item) === -1) {
					filterGuadrantListString += " " + item;
				}
			});

			data.guadrantList = guadrantList;
			return filterGuadrantListString;
		},
		debugAngle: function (curAngle, startAngle, isClick) { 							// 解决鼠标从第二象限滑动到第三象限或者从第三象限滑动到第二象限的角度问题

			var	filterGuadrantListString = "", 
				isReverse, filterGuadrantListString,
				data = Cache.data(dial, 'dataObj');

			filterGuadrantListString = Guadrant.makerGuadrantList(curAngle);

			isReverse = Guadrant.isReverse(filterGuadrantListString, startAngle, curAngle, isClick);
			if(!isClick) {
				if(isReverse) {  														// 如果是逆时针
					if(~filterGuadrantListString.indexOf("2 3")) { 						// 鼠标滑动的出现先到第二象限再到第三象限
						curAngle -= 360; 							// 结束的角度减小360
					}						
				}else if(!isReverse) {
					if(~filterGuadrantListString.indexOf("3 2")) {
						curAngle += 360;							// 结束的角度增加360
					}
				}
			}else{
				if(!isReverse) {
					if(~filterGuadrantListString.indexOf("3")) {
						curAngle -= 360;
					}
				}
			}
			return curAngle;
		}
	})

	var Handler = {};

	fn.extend(Handler, {
		startHandler: function (e) {
			var data = Cache.data(dial, 'dataObj'),
				clickClass = data.clickClass,
				centerPos, startClientPos, startAngle,
				centerPos = data.centerPos; 							// 获取转盘中心坐标
						
			e.preventDefault();

			startClientPos = getCss.getClientPos(e);								// 鼠标按下时的坐标 
			startAngle = getCss.getAngleAndLen(startClientPos, centerPos).angle;	// 开始鼠标与中心的角度
			// 解除绑定
			Event.on(this, touchMove, Handler.moveHandler); 						// 滑动的情况

			if(clickClass) {
				Event.on(this, touchEnd, Handler.endHandler); 						// 点击的情况
			}
			console.log(startAngle);

			Handler.saveInfo({
				centerPos: centerPos,
				startClientPos: startClientPos,
				startAngle: startAngle,
				relativeAngle: 0, 												// 重置relativeAngle
				guadrantList: [],												// 清空路径象限队列
				endClientPos: startClientPos, 									
				endAngle: startAngle
			});
		},
		moveHandler: function (e) {
			e.preventDefault();	
			Handler.countRealAngle(e);
			Event.on(doc, touchEnd, Handler.endHandler);						
		},
		endHandler: function (e) {
			var data = Cache.data(dial, 'dataObj'),
				self = data.dial, 
				options = data.options,
				isClick;
			
			e.preventDefault();
			// 解除绑定
			Event.off(self, touchMove);
			Event.off(self, touchEnd);
			Event.off(doc, touchEnd);

			isClick = Handler.isClick(e);
			Handler.countAngle(0, isClick);											// 计算转盘滑动角度

			if(options.onChange) {													// 执行回调函数 
				options.onChange.call(data);
			}
		},
		countRealAngle: function (e) { 												// 方法countRealAngle(e)计算转盘随鼠标滑动的角度
			var data = Cache.data(dial, 'dataObj'),
				centerPos = data.centerPos,
				startAngle = data.startAngle,
				angle = data.angle, oneStep = data.oneStep,
				guadrentList = data.guadrentList || [],
				curClientPos, curAngle, relativeAngle, realAngle,
				transition = data.options.transition;

			curClientPos = getCss.getClientPos(e);									// 当前鼠标位置
			curAngle = getCss.getAngleAndLen(curClientPos, centerPos).angle; 		// 当前鼠标与中心的角度。以x的正方向为基准, 顺时针为正数, 逆时针为负数
			curAngle = Guadrant.debugAngle(curAngle, startAngle); 					// 解决从第二象限到第三象限或者从第三象限到第二象限的角度问题						
			relativeAngle = getCss.getRelativeAngle(curAngle, startAngle); 			// 计算该次的相对滑动角度
			realAngle = angle + (curAngle - startAngle); 							// 鼠标滑动的角度加上此前转盘旋转的角度	

			Handler.rotato(realAngle, transition, { 								// 动画
				relativeAngle: relativeAngle,
				realAngle: realAngle,
				endClientPos: curClientPos,
				guadrentList: guadrentList,
				endAngle: curAngle
			}, oneStep);
		},
		countAngle: function (extraAngle, isClick) { 					// 方法countAngle(isClick)计算转盘旋转的角度
			var data = Cache.data(dial, 'dataObj'),
				self = data.dial, oneStep = data.oneStep,
				options = data.options,
				extraAngle = extraAngle || 0,
				angle = data.angle,
				relativeAngle = data.relativeAngle || 0,
				transition = options.transition, 
				index, clickAngle = 0, curBlockChange = data.curBlockChange;

			// 加上相对滑动角度
			if(isClick) {
				clickAngle = Handler.countClickAngle();
			}
			if(oneStep) {
				if(relativeAngle > 45) {
					relativeAngle = 45;
				}
				if(relativeAngle < -45) {
					relativeAngle = -45;
				}
			}

			console.log(relativeAngle, clickAngle, extraAngle);

			angle += relativeAngle - clickAngle + (extraAngle || 0);
			index = getCss.getBlockIndex(angle);
			Handler.rotato(angle, transition, {
				angle: angle,
				curIndex: index								// 清空路径象限队列
			});
			if(curBlockChange) { 							// 执行私有的回调
				Handler.curBlockChange();
			}
			Handler.changeCur();
		},
		isClick: function (e) {
			var data = Cache.data(dial, 'dataObj'),
				target = e.target,
				clickClass = data.clickClass,
				eventTargets = dial.querySelectorAll(clickClass),
				guadrantList = data.guadrantList,
				isClick = false,
				startClientPos = data.startClientPos, endClientPos = data.endClientPos;
			
			fn.each(fn.makeArray(eventTargets), function (item, i, eventTargets) {
				if(fn.contains(item, target) || item === target) {									// 如果点中了块元素其中的一个
					if(startClientPos.x === endClientPos.x && startClientPos.y === endClientPos.y && !guadrantList.length) { 			// 开始,结束的坐标点相等并且鼠标滑动的路径为空数组，说明鼠标是没有滑动的
						isClick = true;	
						return false;
					}
				}
			});
			return isClick;
		},
		countClickAngle: function () {
			var data = Cache.data(dial, 'dataObj'),
				initAngle = data.initAngle,
				endAngle = data.endAngle,
				relativeAngle;

			endAngle = Guadrant.debugAngle(endAngle, endAngle, true);
			relativeAngle = getCss.getRelativeAngle(endAngle, initAngle);
			return relativeAngle;
		},
		rotato: function (angle, transition, extra, oneStep) {
			var data = Cache.data(dial, 'dataObj'), 
				self = data.dial;
			if(!oneStep) {
				setCss.setStyle(self, 
					{
						"transform": "rotate(" + angle + "deg)", 
						"transition": transition 
					}, aPrefixString); 
			}

			Handler.saveInfo(extra);		 										// 保存数据
		},
		saveInfo: function (obj) {
			var data = Cache.data(dial, 'dataObj');
			fn.extend(data, obj); 													
		},
		curBlockChange: function () {
			var data = Cache.data(dial, 'dataObj'),
				index = data.curIndex, 
				length = data.blockNumber,
				clickBlock = data.clickBlock, 
				i = 0, angle = data.angle;
			for(; i < length; i++) {
				if(clickBlock[i]) {
					setCss.setStyle(clickBlock[i], Matrix.getMatrix(clickBlock[i], -angle), aPrefixString);
				}
			}
		},
		changeCur: function () {
			var data = Cache.data(dial, 'dataObj'),
				index = data.curIndex, 
				length = data.blockNumber,
				clickBlock = data.clickBlock, 
				i = 0;
			for(; i < length; i++) {
				clickBlock[i].classList.remove("cur");
			}
			clickBlock[index].classList.add("cur");
		}	
	});
	
	fn.extend(fn, {Handler: Handler});

	// 矩阵
	var Matrix = {},
		rmatrix = /(-?\d\d*(?:\.\d\d*(?:e-)?\d*)?)/g;

	fn.extend(Matrix, {
		matrix: function (translate, rotate, scale, skew) { 						// 
			var matrixProp;
			rotate ? " " + rotate : "";
			return {
				'transform': translate + rotate
			}
		},
		angleToRadian: function (angle) {
			return angle * Math.PI / 180;
		},
		getTranslateString: function (matrix) {
			if(!matrix){
				return;
			}
			var translate = matrix.match(rmatrix);
			return "translate(" + translate[4]+ "px, " + translate[5] + "px)";
		},
		getMatrixString: function (el, transform) {
			if(!transform) {
				return;
			}
			return getCss.getComputedStyle(el, transform);
		},
		getRotateString: function (angle) {
			if(!angle) {
				return;
			}
			return "rotate(" + angle + "deg)";
		},
		getMatrix: function (el, angle) {
			var matrix, 
				getTranslateString, getRotateString;

			matrix = Matrix.getMatrixString(el, 'transform');
			getTranslateString = Matrix.getTranslateString(matrix);
			getRotateString = Matrix.getRotateString(angle);
			return Matrix.matrix(getTranslateString, getRotateString);
		}
	});

	// Dial 构造函数，接受两个参数。其中selector是选择器，opt是初始化参数对象。
	var Dial = function (selector, opt) {

		var dialElement = document.querySelector(selector),
			
			options = fn.extend(defaultOptions, opt),
			blockNumber = options.blockNumber,
			clickBlock = null, clickClass = options.clickClass,
			origin = options.origin, centerPos,
			position = options.position,
			initAngle = options.initAngle - 90 || -90, 				
			width = fn.stringToNumber(getCss.getComputedStyle(dialElement, 'width')),
			height = fn.stringToNumber(getCss.getComputedStyle(dialElement, 'height'));		

		dial = dialElement; 					// dial抛向全局

		// 通过clickClass获取点击的块元素
		if(clickClass) {
			clickBlock = document.querySelectorAll(clickClass);
		}

		var data = Cache.data(dial, 'dataObj'); 			// 初始化缓存对象，用于保存该转盘的信息

		// 设置转盘旋转中心和角度
		setCss.setStyle(dial, {
			"transform-origin": origin
			// "transform": "rotate(" + initAngle + "deg)", 
		}, aPrefixString);

		// 设置转盘的位置 
		setCss.setPosition(dial, position);
		// 获取圆心位置
		centerPos = getCss.getCenterPos(dial);

		fn.extend(data, options, {
			self: this, 					// 实例化的dial
			options: options, 				// 扩展属性
			clickBlock: clickBlock,
			click: true,
			realAngle: 0,
			relativeAngle: 0,
			angle: 0,
			dial: dial,
			eachRotateAngle: 360 / blockNumber,
			centerPos: centerPos,
			initAngle:  initAngle,
			width: width,
			height: height,
			curBlockChange: options.consistentAngle ? false : options.curBlockChange 		// 如果参数consistentAngle为true，则设置curBlockChange为false
		});

		// 设置块元素位置
		if(clickClass) {
			setCss.setClickBlockPos(aPrefixString); 
		}
		// 监听touchStart
		Event.on(dial, touchStart, Handler.startHandler);	
	};
	
	// 公共方法
	Dial.prototype = {
		constructor: Dial,

		getCurIndex: function () {
			return Cache.data(dial, 'dataObj').curIndex;
		},
		next: function () {
			var data = Cache.data(dial, 'dataObj'),
				eachRotateAngle = data.eachRotateAngle,
				onChange = data.options.onChange;
			Handler.countAngle(-eachRotateAngle, false); 							
			onChange.call(data);
		},	
		prev: function () {
			var data = Cache.data(dial, 'dataObj'),
				eachRotateAngle = data.eachRotateAngle,
				onChange = data.options.onChange;
			Handler.countAngle(eachRotateAngle, false);
			onChange.call(data);
		},
		destory: function () {
			var eventsCache = Cache.data(dial, 'events');
			if(!eventsCache || fn.isEmptyObject(eventsCache)) {
				return;
			}
			fn.each(eventsCache, function (handlerList, type, eventsCache) {
				if(handlerList.length) {
					Event.off(dial, type);											// 清除所有的监听事件
				}
			});
		}
	};

	if(extendFn) {
		fn.extend(fn, {
			Type: Type,
			Prefix: Prefix,
			setCss: setCss,
			getCss: getCss,
			Cache: Cache,
			Event: Event,
			Guadrant: Guadrant,
			Handler: Handler
		}, true);
	}

	Dial.fn = fn;

	window.Dial = Dial;

})(window);