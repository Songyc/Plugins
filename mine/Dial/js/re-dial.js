(function (window, undefined) {
	'use strict';

	var doc = document,
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

	window.Dial = function (options) {
	 	this.config = extend({}, Dial.config, options);
	 	this._init();
	}

	Dial.config = {
		initAngle: 0,
		block: null,
		eachAngle: 0,
		radius: 0,
		click: true,
		position: null,
		alwaysUp: true
	}

	Dial.prototype = {
		constructor: Dial,
		uuid: 0,
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

				c.initAngle %= 360;
				this.target = el; 							
				this.dialInitAngle = (c.initAngle - 90) % 360; 			
				this.angle = c.initAngle || 0;
				this._rotate(c.initAngle);
				this._position(el);
				this.center = this._center(el);

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

						this._data(el, {transform: y, webkitTransform: y});
						
					}

					c.eachAngle = eachAngle;
				}

				this._bind(touchstart);
			}
		},

		_position: function (el) {
			var p = this.config.position,
				pi, pos, t;

			pos = {
				left: "0%",
				right: "100%",
				top: '0%',
				bottom: '100%',
				center: '50%'
			};
			// 将位置字符串转成数组
			p = p.trim().split(' ');
			// 如果数组第一个位置为top或者bottom, 则要将两个位置调换。比如['top', 'left']，换成['left', 'top']。
			if(/^(t|b)/.test(p[0])) {
				t = p[0];
				p[0] = p[1];
				p[1] = t;
			}

			el.style.left = pos[p[0]];
			el.style.top = pos[p[1]];
			el.style.marginLeft = -(el.clientWidth / 2) + 'px';
			el.style.marginTop = -(el.clientHeight / 2) + 'px';
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

		_data: function (el, name, data) {
			var cache = this.cache,
				id, ec, key;

			if(!cache) {
				this.cache = cache = {};
			}

			id = el.uuid;

			if(!id) {
				el.uuid = id = this.uuid++;
			}

			ec = cache[id] = {};

			if(name == null) {
				delete cache[id];
			}

			if(data != null) {
				ec[name] = data;
				return ec[name];

			}else if( _toString.call(name) === '[object Object]' ){
				extend(ec, name);
			}
		},

		_matrix: (function () {
	        var s, scs,
	            cf = {
	                translate: function (t, el) {
	                    if(typeof t === 'number') {
	                        t = { x: t, y: t }
	                    }

	                    return ("translate(" + t.x + "px, " + t.y + "px)");
	                },
	                rotate: function (r) {
	                    return ("rotate(" + r + "deg)");
	                },
	                scale: function (sc) {
	                    if(typeof sc === 'number') {
	                        scs = "scale(" + sc + ")";
	                    }else {
	                        scs += "scale(" + sc.x + ", " + sc.y + ")";
	                    }

	                    return scs;
	                },
	                skew: function (sk) {
	                    return ("skew(" + sk + "deg)");
	                }
	            };

	        return function (el, prop) {
	        	var rst = [];

	            for(var key in prop) {

	            	if(prop[key] === true) {
	            		prop[key] = this._data(el, key);
	            	}
	            	
	                s = cf[key].call(this, prop[key], el);
	                rst.push(s);
	            }

	            this._data(el, prop);

	            s = rst.join(" ");
	            
	            el.style.transform = s;
	            el.style.webkitTransform = s;
	            el.style.transition = 'transform .3s ease-in';
	            el.style.webkitTransition = '-webkit-transform .3s ease-in';
	        }
	    })(),

		_start: function (e) {
			var point = hasTouch ? e.touches[0] : e;

 			e.preventDefault();

 			// 记录开始点击的坐标
			this.startX = point.clientX;
			this.startY = point.clientY;

			// 绑定事件
			this._bind(touchmove);
			this._bind(touchend);
		},

		_move: function (e) {
			var point = hasTouch ? e.touches[0] : e,
				sag, cag, lag, 
				alwaysUp = this.config.alwaysUp,
				ag = this.angle;

			e.preventDefault();

			// 开始点与转盘中心连线与x轴正方向的夹角
			sag = this._angle({x: this.startX, y: this.startY}, this.center);

			// 滑动点与转盘中心连线与x轴正方向的夹角
			cag = this._angle({x: point.clientX, y: point.clientY}, this.center);

			lag = this.lAngel || sag;

			// 从第三象限滑动到第二象限。即从180度转到-180度，会出现逆时针旋转一周的bug。修正变量cag
			if(cag > 0 && (cag - lag >= 180)) {				
				cag -= 360;
			}

			// 从第二象限滑动到第三象限。即从-180度转到180度，会出现顺时针旋转一周的bug。修正变量cag
			if(cag < 0 && (cag - lag <= -180)) {			
				cag += 360;
			}

			// 计算滑动的角度，滑动角度 = 当前角度 - 开始角度。之前的滑动角度再加上本次的滑动角度
			ag += cag - lag;

			// 旋转
			this._rotate(ag);

			if(alwaysUp) {
				var b = this.config.block;
				for(var i = 0, l = b.length; i < l; i++) {
					// this._rotate(b[i], 0, -ag);
				}
			}

			// 记录当前角度为上一次角度
			this.lAngel = cag;

			// 记录总滑动角度
			this.angle = ag;

			// 标记滑动状态
			this.move = true;
		},

		_end: function (e) {
			var point = hasTouch ? ( e.touches[0] ? e.touches[0] : e.changedTouches[0] ) : e,
				c = this.config,
				ct = c.block, l, eag,
				ecag = c.eachAngle, slag = 0,

				// 转盘的初始角度相对于x轴的角度, 也是转盘的中心轴。用户设置的初始角度可能过大或过小，要除以360度取余。
				dia = this.dialInitAngle;

			e.preventDefault();

			this.endX = point.clientX;
			this.endY = point.clientY;

			// 如果支持点击块元素旋转，并且用户没有滑动(模拟点击事件)。
			if(c.click && ct && (l = ct.length) && !this.move) { 				
				for(var i = 0; i < l; i++) {

					// 如果点击某个块元素或者块元素的子孙元素
					if((ct[i] === e.target || ct[i].contains(e.target))) {

						// 获取结束点和转盘中心的连线与x轴正方向的角度
						eag = this._angle({x: point.clientX, y: point.clientY}, this.center);

						// 如果结束角度小于中心轴角度。要修正结束角度。
						if(eag < dia) {
							eag += 360;
						}

						// 结束角度减去中心轴角度小于180，说明结束点离中心轴较近。要逆时针方向旋转。
						if((eag - dia ) <= 180) {
							slag -= Math.round((eag - dia) / ecag) * ecag;
						}

						// 结束角度减去中心轴角度大于180，说明结束点离中心轴较远。要顺时针方向旋转。
						if((eag - dia) > 180) {
							slag +=  Math.round((360 - (eag - dia)) / ecag) * ecag;
						}

						// 之前滑动角度加上本次滑动角度。调用this._rotate(angle)方法旋转

						this._rotate( (this.angle += slag) );

						// 跳出本次循环
						break;
					}
				}
			}

			// 清空上一次滑动角度
			this.lAngel = null;

			// 标记this.move为false，指示转盘不是在滑动状态 						
			this.move = false;
		},

		_angle: function (point, center) {
			var dX = point.x - center.x,
				dY = point.y - center.y;
				
			return Math.round(Math.atan2(dY, dX) * 180 / Math.PI);
		},
	}	

	"translate rotate scale skew".split(" ").forEach(function (item, i) {
		Dial.prototype["_" + item] = function (prop, el) {
			var obj = {};

			if(!prop) {
				return;
			}

			el = el || this.target;

			obj[item] = prop;

			this._matrix.call(this, el, obj);
		}
	});

	// test 
	new Dial({
		target: "#Jtab_ctrl",
		initAngle: 0,
		block: '#Jtab_ctrl .block',
		radius: 280,
		position: 'center center'
	});

})(this);