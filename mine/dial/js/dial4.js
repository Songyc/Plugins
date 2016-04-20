(function (window, u) {
	'use strict';

	//isMobile
	var	doc = document,
		global = {},
		isTouchStart = 'ontouchstart' in window,
	    touchStart = isTouchStart ? 'touchstart' : 'mousedown',
	    touchMove = isTouchStart ? 'touchmove' : 'mousemove',
	    touchEnd = isTouchStart ? 'touchend' : 'mouseup',
		$$ = function (str){
	        var ex = /([a-zA-Z0-9])*([#\.]+)(\w+)[^\s]*/g,
	            eles = [];
	        this.eles = eles;
	        while(ex.test(str)) {
	            var a = RegExp.$1,
		            b = RegExp.$2,
		            c = RegExp.$3;
	           	switch (a) {
		            case "#":
		            eles.push(doc.getElementById(c));
		            break;
		            case ".":
		            for(var i = 0,l = getClass(c).length; i < l; i++) {
		              eles.push(getClass(c)[i]);
		            }
		            break;
		            case "":
		            var tags = doc.getElementsByTagName('*');
		            for(var i = 0, l = tags.length; i < l; i++) {
		              	if(b === "." && tags[i].className === c){
		                	eles.push(tags[i]);
		              	}else if(b === "#" && tags[i].id === c){
		                	eles.push(tags[i]);
		              	}
		            }
		            break;
	          	}
	        }
	        if(str.nodeType === 1 || str.nodeType === 9){
	          eles.push(str);
	        }
	    };
    $$.prototype = {
	    constructor:$$,
	    each: function (fn) {
	      	for(var i = 0, l = this.eles.length; i < l;i++){
	        	fn.call(this, this.eles[i]);
	      	}
	    },
	    on: function (type, fn, useCapture){
	      	this.each(function(el){
	        	window.addEventListener ? (el || document).addEventListener(type, fn, !!useCapture) : (el || document).attachEvent('on' + type, fn); 
	      	});
	    },
	    off:function (type, fn, useCapture){
	      	this.each(function(el){
	       	 	window.removeEventListener? (el || document).removeEventListener(type, fn, !!useCapture) : (el || document).detachEvent('on' + type, fn);
	      	});
	    }
	};
	var $ = function (str){
      	if(arguments.length) return new $$(str);
      	return new $();
    };
	//private function 
	var extend = function (defaults, opt) {
		if(!opt) return defaults;
		for(var k in opt) {
			if(opt.hasOwnProperty(k)) {
				defaults[k] = opt[k];
			}
		}
		return defaults;
	},
	getAngleandLen = function (obj, center) {
		var diffX = obj.clientX - center.clientX,
			diffY = obj.clientY - center.clientY;
		return {
			angle: Math.round(Math.atan2(diffY, diffX) * 180 / Math.PI),
			length: Math.ceil(Math.sqrt(diffX * diffX + diffY * diffY))
		}
	},	
	tableRotate = function (angle) {
		this.style.transform = "rotate("+angle+"deg)";
		this.style.webkitTransform = "rotate("+angle+"deg)";
		this.style.msTransform = "rotate("+angle+"deg)";
		this.style.mozTransform = "rotate("+angle+"deg)";
		this.style.oTransform = "rotate("+angle+"deg)";
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
			eachRotateAngle = global.options.eachRotateAngle,
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

		var	center = getCenter(this),
			startClient = {
				clientX: isTouchStart ? ev.touches[0].clientX : ev.clientX,
				clientY: isTouchStart ? ev.touches[0].clientY : ev.clientY
			},
			startAngle = getAngleandLen(startClient,center);

		global.center = center;
		global.startClient = startClient;	
		
		global.isMove = false;

		global.moveHandler = function (ev) {
			moveHandler.call(this, ev, ev.target);
		}

		global.endHandler = function (ev){
			endHandler.call(this, ev, ev.target);
		}
		if(global.isLock) {

		}else{
			$(this).on(touchMove, global.moveHandler, false);
			$(this).on(touchEnd, global.endHandler, false);	
		}

	},
	moveHandler = function (e, obj) {
		var ev = e || window.event;
		ev.preventDefault();

		if(ev.stopProgation) {
			ev.stopProgation()
		}else{
			ev.cancelBubble = true
		}
		
		var	center = global.center,	
			startClient = global.startClient,
			moAngle = global.moAngle,
			angle = global.angle,
			transition = global.options.transition,
			cenClientX = center.clientX,
			cenClientY = center.clientY,
			curClinet = {
				clientX: isTouchStart ? ev.touches[0].clientX : ev.clientX,
				clientY: isTouchStart ? ev.touches[0].clientY : ev.clientY
			},
			curAngle = getAngleandLen(curClinet, center).angle,
			startAngle = getAngleandLen(startClient, center).angle,
			reAngle = getRealAngle(curAngle, startAngle);
			moAngle = angle + curAngle - startAngle;
			tableRotate.call(this, moAngle);
			tableTransition.call(this, transition);

		global.reAngle = reAngle;
		global.moAngle = moAngle;
		global.endClient = curClinet;

		global.isMove = true;

		$(this).on(touchEnd, global.endHandler, false);
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
			eachRotateAngle = options.eachRotateAngle;
		$(this).off(touchMove, global.moveHandler, false);
		$(this).off(touchEnd, global.endHandler, false);
		
		angle += global.reAngle;

		if(!global.isMove){
			angle = clickTargetEvent(obj, eachRotateAngle);
		}

		angle1 = angle - options.initAngle;	

		if(!global.isReverse) {
			angle1 = - angle1;		
		}

		wAngle = angle1 % 360; 	
		if(wAngle < 0) wAngle += 360;
		index = Math.ceil(wAngle / eachRotateAngle);	

		tableTransition.call(global.tar, transition);
		tableRotate.call(this, angle);
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
			firstElementAngle = global.options.initAngle - 90,
			objPar,
			angle,
			clickAngle;
			if(obj !== global.tar) {
				if(obj.index !== undefined && typeof obj.index === 'number'){	
					clickTargetAngle = getAngleandLen(global.startClient, global.center).angle;
					if(clickTargetAngle >= 90) clickTargetAngle -=  360;
					clickAngle = - (Math.round((clickTargetAngle - firstElementAngle) / eachRotateAngle) * eachRotateAngle);
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
		var left = doc.documentElement.clientLeft,
			top = doc.documentElement.clientTop,
			rect = obj.getBoundingClientRect();
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
			width: getRect(obj).width/2,
			height: getRect(obj).height/2
		}
	},
	getCenter = function (obj) {
		return {
			clientX: getRect(obj).right - getReCenter(obj).width,
			clientY: getRect(obj).bottom - getReCenter(obj).height
		}
	},
	setStyle = function () {
		var initAngle = global.options.initAngle,
			origin = global.options.origin;
		this.style.transform = "rotate("+initAngle+"deg)";
		this.style.webkitTransform = "rotate("+initAngle+"deg)";
		this.style.msTransform = "rotate("+initAngle+"deg)";
		this.style.mozTransform = "rotate("+initAngle+"deg)";
		this.style.oTransform = "rotate("+initAngle+"deg)";

		this.style.transformOrigin = origin;
		this.style.webkitTransformOrigin = origin;
		this.style.msTransformOrigin = origin;
		this.style.mozTransformOrigin = origin;
		this.style.oTransformOrigin = origin;
	},
	// Dial Class
	Dial = function (selector, opt) {
		var defaults = {
			initAngle: 0,
			blockNumber: 8,
			origin: "50% 50%",
			blockNumberIndex: true,
			eachRotateAngle: 45,
			transition: "",
			onDraw: null,
			click: false,
			clickTarget: null,
			isReverse: false,
			isLock: false,
			autoPlay: false
		},
		tar = $(selector),
		options = extend(defaults, opt),
		moAngle = 0,
		reAngle = 0,
		angle = 0;
		
		global = {
			self: this,
			tar: tar.eles[0],
			options: options,
			moAngle: moAngle + options.initAngle,
			reAngle: reAngle + options.initAngle,
			angle: angle + options.initAngle,
			clickTarget: options.clickTarget,
			isReverse: options.isReverse,
			isLock: options.isLock, 
			autoPlay: options.autoPlay
		}
		setStyle.call(tar.eles[0]);

		if(options.click && options.clickTarget) {
			for(var i = 0, l = options.clickTarget.length; i < l; i++) {
				options.clickTarget[i].index = i;
			}
		}
		tar.on(touchStart, startHandler, false);
	};
	Dial.prototype = {
		constructor: Dial,
		getCurIndex: function () {
			return global.curIndex;
		}
	};

	window.Dial = Dial;

})(window);