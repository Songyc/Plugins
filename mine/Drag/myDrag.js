(function (){
	var doc = document,
		isTouchStart = 'ontouchstart' in window,
		touchStart = isTouchStart ? 'touchstart' : 'mousedown',
		touchMove = isTouchStart ? 'touchmove' : 'mousemove',
		touchEnd = isTouchStart ? 'touchend' : 'mouseup',
		gloObj = {},
		isIE = /internet explorer/i.test(navigator.appName) ? true : false,
		isIE6 = isIE && /6./i.test(navigator.appVersion),
		isIE7 = isIE && /7./i.test(navigator.appVersion),
		isIE8 = isIE && /8./i.test(navigator.appVersion);
		width = (doc.documentElement || doc.body).clientWidth;
		height = (doc.documentElement || doc.body).clientHeight;
		function getClass(obj, cla){
			var all = "*",
				els = (obj || doc).getElementsByTagName(all),
				arr = [];
			for(var i = 0, l = els.length; i < l;i++){
				if(els[i].className === cla) {
					arr.push(els[i]);
				}	
			}
			return arr;
		}
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
			// alert(Element);
			if(str.nodeType == 1 || str === doc){
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
			})
		},
		width: function (width){
			this.each(function (el){
				if(el instanceof Element) {
					if(!width){
						var rect = el.getBoundingClientRect();
						return rect.width;
					}
					else{
						el.style.width = width + "px";
					}
				}
			})
		},
		height: function (height){
			this.each(function (el){
				if(el instanceof Element) {
					if(!height){
						var rect = el.getBoundingClientRect();
						return rect.height;
					}else{
						el.style.height = height + "px";
					}
				}
			})
		}
	};
	// self function 
	var $ = function (str){
			if(arguments.length) return new $$(str);
			return new $();
		},
		selfFunc = {
			extend:function (target, source){
				if(!source) return target;
				for(var key in source) {
					target[key] = source[key];
				}
				return target;
			}
		};
	for(var key in selfFunc) {
		$[key] = selfFunc[key];
	}	
	
	var	def = {
			target: doc.body.firstElementChild || doc.body,
			top:0,
			left:0,
			bottom:0,
			right:0,
			parentNode:doc,
			parentWidth:'100px',
			parentHeight:'100px'
		}
	function getStyle(oDiv, pro){
		return oDiv.currentStyle ? oDiv.currentStyle[pro] : getComputedStyle(oDiv, false)[pro];
	}
	function changePx(len, pro) {
		var isPx = /(\d+)([px%])/.test(len),
			b = RegExp.$2,
			num;
		switch(b){
			case 'px':
			num = parseInt(len.split('px')[0]);
			break;
			case '%':
			var bai = len.split('%')[0]/100;
			// console.log(bai, pro === 'width');
			if(pro === 'width') {
				console.log("gloObj.toObj.parentNode.offsetWidth:"+gloObj.toObj.parentNode.offsetWidth);
				num = Math.ceil(bai*gloObj.toObj.parentNode.offsetWidth);
				// console.log("parentNode:"+gloObj.toObj.parentNode);
			}else if(pro === 'height') {
				num = Math.ceil(bai*gloObj.toObj.parentNode.offsetHeight);
			}
		}
		return num || +len;
	}	
	function getBounding(oDiv){
		var obj = oDiv.getBoundingClientRect(),
			top = doc.documentElement.clientTop,
			left = doc.documentElement.clientLeft;
			console.log("oDiv:"+oDiv);
			console.log("oDiv.offsetWidth:"+obj.offsetWidth);
		return {
			left:obj.left - left,
			top:obj.top - top,
			right:obj.right - left,
			bottom:obj.bottom - top
			// width:obj.width ? obj.width : obj.offsetWidth,
			// height:obj.height ? obj.height : obj.offsetHeight
		}
	}
	function startHandler(e) {
		var self = gloObj.myDrag,
			drag = gloObj.drag,
		client = {
			x: e.clientX || e.touches[0].pageX,
			y: e.clientY || e.touches[0].pageY
		},
		offset = {
			x: getBounding(drag).left,
			y: getBounding(drag).top
		},
		dis = {
			x: client.x - offset.x,
			y: client.y - offset.y
		};
		gloObj.dis = dis;
		gloObj.client = client;
		drag = gloObj.drag; 
		console.log("点击开始");
		console.log("clientX:"+client.x+", offsetX:"+offset.x+", disX:"+dis.x);
		$(document).on(touchMove, moveHandler, false);
	}
	function moveHandler(e) {
		var self = gloObj.myDrag,
			tar = gloObj.tar,
			drag = gloObj.drag;
		// 阻止冒泡
		// e.stopPropagation ? e.stopPropagation() : e.cancelBubble = false;
		condition(e);
		dis = gloObj.dis; //鼠标到边框的距离
		$(document).on(touchEnd, endHandler, false);
		// 一刀切
		return false;
	}
	function endHandler(e){
		var drag = gloObj.drag,
			self = gloObj.myDrag,
			toObj = gloObj.toObj;
		// console.log("结束");
		$(document).off(touchMove, moveHandler, false);
		if(toObj.onDraw) {
			toObj.onDraw.call(gloObj.client);
		}
	}
	function setCssText(css){
		this.style.position = "absolute";
		(this.parElement || this.parentNode).style.cssText = "position:absolute;width:" + gloObj.toObj.parentWidth + ";height:" + gloObj.toObj.parentHeight;
	}
	
	function condition(e){
		var dis = gloObj.dis,
			drag = gloObj.drag,
			toObj = gloObj.toObj,
			client = {
				x: e.clientX || e.touches[0].pageX,
				y: e.clientY || e.touches[0].pageY
			},
			l = client.x - dis.x - getBounding(toObj.parentNode).left,
			t = client.y - dis.y - getBounding(toObj.parentNode).top;
			console.log("移动中:"),

			r = (toObj.parentNode.offsetWidth || width) - drag.offsetWidth,
			b = (toObj.parentNode.offsetHeight || height) - drag.offsetHeight,
			left = changePx(toObj.left, 'width'),
			right = changePx(toObj.right, 'width');
			var top = changePx(toObj.top, 'height');
			bottom = changePx(toObj.bottom, 'height');
			console.log("clienX:"+client.x+", disX:"+dis.x+", l:"+l+", left:"+left+", toObj.left:"+toObj.left);
		if(l < left) {
			l = left;
		}else if(l > r-right){
			l = r-right;
		}
		if(t < top){
			t = top;
		}else if(t > b-bottom){
			t = b - bottom;
		}
		drag.style.left = l + 'px';
		drag.style.top = t + 'px';
		gloObj.client = client;
	}
	function myDrag(sel, source){
		var toObj = $.extend(def, source),
			tar = $(sel) || toObj.target;
		gloObj = {
			myDrag: this,
			tar: tar,
			toObj: toObj,
			drag: tar.eles[0]
		};
		setCssText.call(gloObj.drag);
		tar.on(touchStart, startHandler, false);
	}
	myDrag.prototype = {
		constructor: myDrag,
		getClient: function (){
			return gloObj.client;
		}
	}
	window.myDrag = myDrag;
})();