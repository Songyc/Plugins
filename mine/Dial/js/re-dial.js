(function (window, undefined) {
	'use strict';

	var doc = document,
		html = doc.documentElement,
		hasTouch = 'ontouchstart' in window,
		touchstart = hasTouch ? 'touchstart' : 'mousedown',
	    touchmove = hasTouch ? 'touchmove' : 'mousemove',
	    touchend = hasTouch ? 'touchend' : 'mouseup',
		emtpy = function (){};

	var _slice = Array.prototype.slice,
		_hasOwn = Object.prototype.hasOwnProperty,
		_toString = Object.prototype.toString;


	function extend(target, src) {
		var args = _slice.call(arguments),
			len = args.length,
			deep, applyParam = [target];

		if(len === 1) {
			return target;
		}

		if(typeof (deep = args[len - 1]) === 'boolean') {
			args.pop();
			applyParam[2] = deep;			
		}	

		args.shift();
		len = args.length;

		if(len > 1) {
			for(var i = 0; i < len; i++) {
				applyParam[1] = args[i];
				extend.apply(null, applyParam);
			}
		}else {
			for(var key in src) {
				if(_hasOwn.call(src, key)) {
					if(deep === true && _toString.call(src[key]) === '[object Object]') {
						extend(target, src[key], true);
					}else {
						target[key] = src[key];
					}
				}
			}
		}
		return target;
	}
	

	var get = {
		center: function (el) { 									// getCss.getCenterPos(el)方法返回参数el的中心坐标
			var gbcr = el.getBoundingClientRect(el);

			return {
				x: gbcr.right - gbcr.width / 2,
				y: gbcr.bottom - gbcr.height / 2
			}
		},
		angle: function (point, center) {
			var dX = point.x - center.x,
				dY = point.y - center.y;
				
			return Math.round(Math.atan2(dY, dX) * 180 / Math.PI);
		},
		len: function (point, center) {
			var dX = point.x - center.x,
				dY = point.y - center.y;

			return Math.ceil(Math.sqrt(dX * dX + dY * dY));
		}
	}

	function isClicked(e) {
		var that = this,
			block = that.block,
			el = e.target, ct;
	
		for(var i = 0, l = block.length; i < l; i++) {
			if( (ct = block[i]) && (ct === el || ct.contains(el)) && !that.isTouchMove) {
				return true;
			}
		}
	
		return false;
	}

	function countAngle() {

	}

	window.Dial = function (options) {
	 	this.config = extend({}, Dial.config, options);
	 	this._init();
	}

	Dial.config = {
		initAngle: 0,
		block: null,
		eachAngle: 0,
		radius: 0,
		click: true
	}

	Dial.prototype = {
		constructor: Dial,
		handleEvent: function (e) {
			switch(e.type) {
				case touchstart: 
					this._start(e); break;
				case touchmove:
					this._move(e); break;
				case touchend: 
					this._end(e); break;
			}
		},
		_init: function () {
			var self = this,
				c = this.config,
				el = c.target,
				cb = c.block, 
				eachAngle;

			if(typeof el === 'string') {
				el = document.querySelector(el);
			}
			
			if(el.nodeType === 1) {

				this.target = el; 							

				this.dialInitAngle = c.initAngle - 90;

				this._rotate(c.initAngle);	

				if(cb) {
					var width, height, 
						radius = c.radius, 
						ele, x, y;

					if(typeof cb === 'string') {
						cb = document.querySelectorAll(cb);
					}
					if(cb.nodeType === 1) {
						cb = [cb];
					}

					c.block = cb; 						
					
					eachAngle = parseFloat(360 / cb.length); 	// 每次旋转一步的角度

					for(var i = 0, l = cb.length; i < l; i++) {
						ele = cb[i];

						width = parseFloat(getComputedStyle(ele, null).width || 0);
						height = parseFloat(getComputedStyle(ele, null).height || 0);

						ele.style.position = 'absolute';
						ele.style.left = '50%';
						ele.style.top = '50%';
						ele.style.marginLeft = '-' + (width / 2) + 'px';
						ele.style.marginTop = '-' + (height / 2) + 'px';

						x = radius * ( Math.sin( eachAngle * i * Math.PI / 180 ));		
						y =  -radius * (Math.cos( eachAngle * i * Math.PI / 180 ));	

						ele.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
						ele.style.webkitTransform = 'translate(' + x + 'px, ' + y + 'px)';
					}

					c.eachAngle = eachAngle;
				}

				this._bind(touchstart);
			}
		},

		_bind: function (type, el, bubble){
			(el || this.target).addEventListener(type, this, !!bubble);
		},

		_center: function(el) {
			var gbcr = el.getBoundingClientRect(el);

			return {
				x: gbcr.right - gbcr.width / 2,
				y: gbcr.bottom - gbcr.height / 2
			}
		},

		_rotate: function (angle, el) {
			if(angle == null) {
				return;
			}

			el = el || this.target;

			el.style.transform = 'rotate(' + angle + 'deg)';
			el.style.webkitTransform = 'rotate(' + angle + 'deg)';
			el.style.transition = 'transform .3s ease-in';
			el.style.webkitTransition = '-webkit-transform .3s ease-in';
		},

		_start: function (e) {
			var point = hasTouch ? e.touches[0] : e,
				x, y, center;				

 			e.preventDefault();

			x = point.clientX;
			y = point.clientY;
			center = this._center(this.target);

			this.startX = x;
			this.startY = y;
			this.center = center;

			this._bind(touchmove);
			this._bind(touchend);
		},

		_move: function (e) {
			var point = hasTouch ? e.touches[0] : e,
				sAngle, cAngle, 
				lAngel = this.lAngel || 0, 
				angle = this.angle || 0,
				slideAngle;  

			e.preventDefault();

			sAngle = this._angle({x: this.startX, y: this.startY}, this.center);
			cAngle = this._angle({x: point.clientX, y: point.clientY}, this.center);

			if(cAngle > 0 && (cAngle - lAngel >= 180)) {			// 从第三象限滑动到第二象限
				cAngle -= 360;
			}

			if(cAngle < 0 && (cAngle - lAngel <= -180)) { 			// 从第二象限滑动到第三象限
				cAngle += 360;
			}

			angle += (slideAngle = cAngle - sAngle);

			this._rotate(angle);

			this.slideAngle = slideAngle;
			this.lAngel = cAngle;
			this.move = true;
		},

		_end: function (e) {
			var point = hasTouch ? ( e.touches[0] ? e.touches[0] : e.changedTouches[0] ) : e,
				c = this.config,
				angle = this.angle || c.initAngle,
				ct = c.block, l, eAngle,
				slideAngle = this.slideAngle || 0,
				eachAngle = c.eachAngle,
				dia = this.dialInitAngle % 360;

			e.preventDefault();

			this.endX = point.clientX;
			this.endY = point.clientY;

			if(c.click && ct && (l = ct.length) && !this.move) { 				// 如果支持点击块元素旋转，并且用户没有滑动(模拟点击事件)
				for(var i = 0; i < l; i++) {
					if((ct[i] === e.target || ct[i].contains(e.target))) { 		// 如果点击某个块元素区域						
						eAngle = this._angle({x: point.clientX, y: point.clientY}, this.center);

						if(dia > 0) {
							if(eAngle < 0) {
								eAngle += 360;
							}

							if(dia < 0) {
								dia += 360;
							}							
						}

						if((eAngle - dia ) < 180) {
							slideAngle -= Math.round((eAngle - dia) / eachAngle) * eachAngle;
						}

						if((eAngle - dia) > 180) {
							slideAngle +=  Math.round((360 - (eAngle - dia)) / eachAngle) * eachAngle; 
						}

						angle += slideAngle;

						this._rotate(angle);
						break;
					}
				}
			}

			this.angle = angle;
			this.slideAngle = 0;
			this.lAngel = 0;
			this.move = false;
		},

		_angle: function (point, center) {
			var dX = point.x - center.x,
				dY = point.y - center.y;
				
			return Math.round(Math.atan2(dY, dX) * 180 / Math.PI);
		},
	}	

	// test 
	new Dial({
		target: "#Jtab_ctrl",
		initAngle: 0,
		block: '#Jtab_ctrl .block',
		radius: 300,
		click: false
	})
})(this);