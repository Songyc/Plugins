(function (window, u) {
	'use strict';

	//isMobile
	var	doc = window.document,
		global = {},
		isTouchStart = 'ontouchstart' in window,
	    touchStart = isTouchStart ? 'touchstart' : 'mousedown',
	    touchMove = isTouchStart ? 'touchmove' : 'mousemove',
	    touchEnd = isTouchStart ? 'touchend' : 'mouseup',
	    fn = {};

	var oToString = Object.prototype.toString,
		oHasOwn = Object.prototype.hasOwnProperty,
		aSlice = Array.prototype.slice;

	// 默认设置参数
	var defaultOptions = {
		blockNumber: 8,
		origin: "50% 50%",
		blockNumberIndex: true,
		transition: "",
		onDraw: null,
		click: true,
		clickTarget: null,
		isReverse: false,
		isLock: false,
		autoPlay: false,
		isDefault: 'isDefault'
	};

	//private function 
	function extend(defaults, opt) { 					// 方法extend将参数defaults和参数opt合并，并且支持多个参数合并。如果最后一个参数为布尔true，支持深度拷贝。参数defaults为默认对象, 参数opt是被合并对象。
		var args = aSlice.call(arguments), k,
			argsL = args.length,
			deep = args[argsL - 1], 					// 获取最后一个参数, 赋值给deep
			isObject = oToString.call(deep) === '[object Object]',  		// 判断deep是不是布尔型
			deep, opts, optsL;
		if(!opt)  return defaults;						// 如果参数opt不存在, 返回参数defaults 				
		optsL = isObject ? argsL - 1 : argsL - 2;		// 如果deep为布尔, 则参数opts的个数为argsL - 2; 否则为argsL - 1。
		if(optsL > 1) { 								// 2个或者2个以上
			for(var i = 1; i <= optsL; i++) { 			// 不算参数defaults，从第二个参数开始计算起。
				extend(defaults, args[i], isObject ? undefined : deep);		// 调用extend(defaults, opt, deep)方法;
			}
		}else {
			for(k in opt) { 							// 遍历参数opt
				if(oHasOwn.call(opt, k)) {				// 如果是自定义属性
					if(deep && oToString.call(opt[k]) === '[object Object]') 	{ 				// 如果是支持深度拷贝，并且参数opt的键值指向的是对象
						extend(defaults, opt[k], true); 		// 再次调用extend(defaults, opt, deep)方法;
					}else {
						defaults[k] = opt[k];			// 深拷贝属性
					}	
				}
			}
		}
		return defaults; 				
	}
	fn.extend = extend;
	extend(fn, {
		each: function each(obj, fn) {
			if(oToString.call(obj) === '[object Array]') {
				var i = 0, l = obj.length;
				for( ;i < l; i++) {
					if(fn.call(obj[i], i, obj) === false){
						break;
					}
				}
			}else if(oToString.call(obj) === '[object Object]'){
				var i;
				for(i in obj) {
					if(obj.hasOwnProperty && obj.hasOwnProperty(i)) {
						if(fn.call(obj[i], i, obj) === false) {
							break;
						}
					}
				}
			}
		}
	})

	// 种子
	var Type = {},
		aTypeString = 'Boolean Number String Function Array Date RegExp Object'.split(" ");
	extend(Type, {
		hasOwnProperty: function (obj, i) {
 			return obj.hasOwnProperty && obj.hasOwnProperty(i);
 		},
		toString: function (obj) {
			return oToString.call(obj);
		},
		isArray: function (obj) {
			if(Array.isArray) {
				return Array.isArray(obj);
			}
			if(oToString.call(obj) === ['object Array']) {
				return true;
			}
			return false;
		},
		isObject: function (obj) {
	 		if(oToString.call(obj) === ['object Object']) {
	 			return true;
	 		}
	 		return false;
	 	}
	});

	fn.each(aTypeString, function (name, i){
		Type["is" + name] = function (obj) {
			if(oToString.call(obj) === '[object ' + name + ']') {
				return true;
			}
			return false;
		}
	});

	fn.extend(fn, {Type: Type}, Type);

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

	startHandler = function (e) {
		var ev = e || window.event;
		e.preventDefault();
		// 获取圆心
		var	center = getCenter(this),
			// 鼠标按下时的坐标
			startPos = {
				x: isTouchStart ? ev.touches[0].clientX : ev.clientX,
				y: isTouchStart ? ev.touches[0].clientY : ev.clientY
			},
			// 
			startAngle = getAngleAndLen(startPos,center);

		global.center = center;
		global.startPos = startPos;	
		
		global.isMove = false;

		global.moveHandler = function (ev) {
			moveHandler.call(this, ev, ev.target);
		}

		global.endHandler = function (ev){
			endHandler.call(this, ev, ev.target);
		}

		this.addEventListener(touchMove, global.moveHandler, false);
		this.addEventListener(touchEnd, global.endHandler, false);
	},

	moveHandler = function (e, obj) {
		var ev = e || window.event;
		ev.preventDefault();
		var	center = global.center,	
			startPos = global.startPos,	
			moAngle = global.moAngle, 			// 实际上滑动的角度
			angle = global.angle,
			transition = global.options.transition,
			// 当前鼠标位置
			curPos = {
				x: isTouchStart ? ev.touches[0].clientX : ev.clientX,
				y: isTouchStart ? ev.touches[0].clientY : ev.clientY
			},
			// 开始鼠标与中心的角度
			startAngle = getAngleAndLen(startPos, center).angle,
			// 当前鼠标与中心的角度
			curAngle = getAngleAndLen(curPos, center).angle,
			// 相对滑动角度， 比如手指滑动了23度，超过了45的一半，就按45算。
			reAngle = getRealAngle(curAngle, startAngle);
			// 加上之前的相对滑动角度
			moAngle = angle + curAngle - startAngle;
			// 转盘跟着转 
			tableRotate.call(this, moAngle); 			
			// 效果跟着转
			tableTransition.call(this, transition);
		// 记录数据 
		global.reAngle = reAngle;
		global.moAngle = moAngle;
		global.endClient = curPos;
		// 记录用手滑动，并非点击
		global.isMove = true;
		// 阻止冒泡
		if(ev.stopProgation) {
			ev.stopProgation()
		}else{
			ev.cancelBubble = true
		}

		this.addEventListener(touchEnd, global.endHandler, false);
	},

	endHandler = function (e, obj) {
		var ev = e || window.event;
		ev.preventDefault();
		var options = global.options,
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
		this.removeEventListener(touchMove, global.moveHandler, false);
		this.removeEventListener(touchEnd, global.endHandler, false);

		// 加上之前的滑动的角度，求总角度。
		angle += global.reAngle;

		// 如果是点击的话, 按元素的位置计算出滑动的角度
		if(!global.isMove){
			angle = clickTargetEvent(obj, eachRotateAngle);
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
		tableTransition.call(this, transition);
		tableRotate.call(this, angle); 		
		// 记录数据
		global.angle = angle;
		global.curIndex = index;
		if(options.onDraw) {
			options.onDraw.call(global);
		}
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
					clickTargetAngle = getAngleAndLen(global.startPos, global.center).angle; 		// 点击的坐标到圆心的长度和角度
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
	},	

	getRect = function (obj) {
		var left = doc.documentElement.clientLeft;
		var	top = doc.documentElement.clientTop;
		var	rect = obj.getBoundingClientRect();
		return {
			left: rect.left - left,
			top: rect.top - top,
			right: rect.right - left,
			bottom: rect.bottom - top,
			width: rect.right - rect.left,
			height: rect.bottom - rect.top
		}
	},

	getReCenter = function (obj) {
		return {
			width: getRect(obj).width / 2,
			height: getRect(obj).height / 2
		}
	},

	getCenter = function (obj) {
		return {
			x: getRect(obj).right - getReCenter(obj).width,
			y: getRect(obj).bottom - getReCenter(obj).height
		}
	};

	// function isArray(obj) {
	// 	if(Array.isArray) {
	// 		return Array.isArray(obj);
	// 	}
	// 	if(oToString.call(obj) === ['object Array']) {
	// 		return true;
	// 	}
	// 	return false;
	// }
 	
 // 	function isObject(obj) {
 // 		if(oToString.call(obj) === ['object Object']) {
 // 			return true;
 // 		}
 // 		return false;
 // 	}

 	function hasOwn(obj, i) {
 		return obj.hasOwnProperty && obj.hasOwnProperty(i);
 	}

	function makeArray(obj) {
		var ret = [];
		if(fn.isArray(obj)) { 	 						// 数组就直接返回数组	
			return obj;
		}else if(!fn.isArray(obj) && obj.length){ 		// 不是数组并且有长度，就是类数组对象
			var i;
			for(i in obj) {
				ret.push(obj[i]);
			}
		}else { 									// 只有一个非数组对象
			ret[0] = obj;
		}
		return ret;
	}

	var prefix = {
		wekbit: '-wekbit-',
		ms: '-ms-',
		moz: '-moz-',
		o: '-o-'
	}

	function each(obj, fn) {
		if(isArray(obj)) {
			var i = 0, l = obj.length;
			for( ;i < l; i++ ) {
				fn.call(arr[i], i, arr);
			}
		}else if(isObject(obj)){
			var i;
			for(i in obj) {
				if(obj.hasOwnProperty && obj.hasOwnProperty(i)) {

				}
			}
		}
	}

	function setStyle(arr, objStyle, webkit) {
		if(arr.length) {
			var i = 0, el;
			if(webkit) {
				var sWekbitPrefix = prefix.webkit;

			}
			while(el = arr[i++]) {
				for(var key in objStyle) {
					el.style.cssText += key + ":" + objStyle[key] + ";";
				}
			}
		}else {
			arr = makeArray(arr);
			setStyle(arr, objStyle, webkit);
		}
	}
	

	// 计算元素的位置
	function setEachElePos () {
		var eles = global.clickTarget,
			i, l = eles.length,
			radius = global.radius,			//半径
			x, y,
			eachRotateAngle = global.eachRotateAngle,
			totalAngle = 0, eChild;

		for(i = 0; i < l; i++) {
			totalAngle = eachRotateAngle * i;
			x =  radius * ( Math.sin(totalAngle * Math.PI / 180 ));
			y =  -radius * (Math.cos(totalAngle * Math.PI / 180 ));

			if(x) {
                if( (x+"").indexOf("e-") > 1) {
                    x = 0;
                }else{
                    x = +x;
                }
            }
            if(y) {
                if( (y+"").indexOf("e-") > 1) {
                    y = 0;
                }else{
                    y = +y;
                }
            }

			eles[i].style.transform = 'translate(' + x + 'px, ' + y + 'px)';
			eles[i].style.webkitTransform = 'translate(' + x + 'px, ' + y + 'px)';
		}
	}
	
	// 获取元素的属性
	function getComputed(obj, prop) {
		return window.getComputedStyle(obj, null)[prop] || 0;
	}

	// 字符串转成整数
	function stringToNumber(str) {
		var rstrtonum = /(\d+)/g;
		return +rstrtonum.exec(str)[1];
	}

	function setEleInitPos(obj) {
		obj.style.position = 'absolute';
		obj.style.left = '50%';
		obj.style.top = '50%';
		obj.style.marginLeft = '-' + ( obj.wProp / 2 ) + "px";
		obj.style.marginTop = '-' + ( obj.hProp / 2) + "px";
	}

	// 计算元素的初始化中心位置
	function setBlockInitPos() {
		var eles = global.clickTarget,
			i, l = eles.length,
			width, wProp, height, hProp;

		for(i = 0; i < l; i++) {
			wProp = getComputed(eles[i], 'width');
			width = stringToNumber(wProp);
			hProp = getComputed(eles[i], 'height');
			height = stringToNumber(wProp);
			eles[i].wProp = width;
			eles[i].hProp = height;
			setEleInitPos(eles[i]);
		}
	}

	// Dial 构造函数，接受两个参数。其中selector是选择器，opt是初始化参数对象。
	var	Dial = function (selector, opt) {

		var dialElement = document.querySelector(selector),
			moAngle = 0, 				// 手指真实的滑动角度
			reAngle = 0,				// 该次转盘要转的角度
			angle = 0, 					// 转盘积计转的角度
			options = extend(defaultOptions, opt);		
		// 只允许一个转盘
		if(dialElement.length) {
			return;
		}

		dialElement.cache = global = {
			self: this, 					// 实例化的dial
			dialElement: dialElement,		// 转盘元素
			options: options,				// 扩展属性
			moAngle: moAngle, 				// 
			reAngle: reAngle,				// 相对度数
			angle: angle,					// 一共跑的度数
			clickTarget: options.clickTarget,
			isReverse: options.isReverse,
			isLock: options.isLock, 
			autoPlay: options.autoPlay,
			eachRotateAngle: 360 / options.blockNumber,
			radius: options.radius
		}
		// 设置转盘origin
		setStyle(dialElement, {"transform-origin": global.options.origin}, true);
		// 设置元素中心初始化位置
		setBlockInitPos();
		// 设置元素位置
		setEachElePos();
		// 给每个点击的东西编号
		if(options.click && options.clickTarget) {
			for(var i = 0, l = options.clickTarget.length; i < l; i++) {
				options.clickTarget[i].index = i;
			}
		}
		// 监听touchStart
		tar.addEventListener(touchStart, startHandler, false);
	};
	
	Dial.prototype = {
		constructor: Dial,
		getCurIndex: function () {
			return global.curIndex;
		}
	};

	window.Dial = Dial;

})(window);