(function (){
		var isTouchStart = 'ontouchstart' in window,
			touchStart = isTouchStart ? 'touchstart' : 'mousedown',
			touchMove = isTouchStart ? 'touchmove' : 'mousemove',
			touchEnd = isTouchStart ? 'touchend' : 'mouseup';
		var nullFunc = function () {};
		var objectHolder = {};

		function addClass (){
			if(this.className.indexOf(arguments[0]) >=0) {
				return ;
			}else{
				this.className += " "+arguments[0];
			}
		}
		function on (type, fn, useCapture){
			window.addEventListener ? this.addEventListener(type, fn, useCapture || false) : this.attachEvent('on' + type, fn);
			if(type === touchMove) {this.fnMove = fn};
			if(type === touchEnd){this.fnEnd = fn;}
		}
		function find(child, parent) {
			var arr = [];
			var childs = parent.getElementsByClassName(child);
			for(var i = 0, len = childs.length; i < len; i++) {
				arr.push(childs[i]);
			}
			return arr;
		}
		function readyDom(iObj){
			var holder = iObj.holder;
			var option = iObj.option;
			var matrix = option.matrix;
			var margin = option.margin;
			var radius = option.radius;

			var html = ['<ul class = "patt-wrap" style = "padding:'+margin+'px">'];
			for(var i = 0, len = matrix[0] * matrix[1]; i < len; i++) {
				html.push('<li class ="patt-circ" style = "margin: '+margin+'px; width:'+(radius*2)+'px; height: '+radius*2+'px; border-radius: '+radius+'px; -webkit-border-radius: '+radius+'px; -moz-border-radius: '+radius+'px;"><div class = "patt-dots"></div>');
			}
			html.push('<ul>');
			holder.innerHTML = html.join("");
			holder.style.width = matrix[0]*(radius*2+margin*2)+margin*2+"px";
			holder.style.height = matrix[1]*(radius*2+margin*2)+margin*2+"px";

			//select circle
			iObj.pattCircle = find('patt-circ', holder);
		}
		function offset(iObj){
			if (iObj.length==0) return null
		    var obj = iObj[0].getBoundingClientRect();
		    return {
		    	//pageXOffset是滚动条的距离
		        left: obj.left + window.pageXOffset,
		        top: obj.top + window.pageYOffset,
		        //round四舍五入
		        width: Math.round(obj.width),
		        height: Math.round(obj.height)
		    }
		}
		function startHandler(e, patternObj) {
			e.preventDefault();
			var iObj = objectHolder[patternObj.token];
			//check if pattern is visible or not
			if(!iObj.option.patternVisible){
				iObj.holder.addClass('patt-hidden');
			};
			//assign events
			this.on(touchMove, function (e){
				moveHandler.call(this, e, patternObj);
			});
			this.on(touchEnd, function (e){
				endHandler.call(this, e, patternObj);
				this.off(touchEnd, this.fnEnd, false);
			}, false);
			//set pattern offset
			var wrap = find('patt-wrap', iObj.holder);
			var wrapOffset = offset(wrap);
			iObj.wrapTop = wrapOffset.top;
			iObj.wrapLeft = wrapOffset.left;

			patternObj.reset();
		}
		function moveHandler(e, patternObj) {
			e.preventDefault();
			console.log("123===Move====123");
			//pageX不随滚动条的移动而变化
			var x = e.pageX || e.targetTouches[0].pageX;
			var y = e.pageY || e.targetTouches[0].pageY; 
			var iObj = objectHolder[patternObj.token];
			var li = iObj.pattCircle;
			var patternAry = iObj.patternAry;
			var lineOnMove = iObj.option.lineOnMove;
			var posObj = iObj.getIdxFromPoint(x, y);
			var idx = posObj.idx;
			var pattId = iObj.mapperFunc(idx) || idx;

			if(patternAry.length > 0){
				var laMove = getLengthAngle(iObj.lineX1, posObj.x, iObj.lineY1, posObj.y);
				if(iObj.line){
					iObj.line.style.width = laMove.length + 10 + 'px';
					iObj.line.style.transform = 'rotate(' + laMove.angle + 'deg)';
					iObj.line.style.webkitTransform = 'rotate(' + laMove.angle + 'deg)';
				}
			}

			if(idx) {
				if(patternAry.indexOf(pattId) == -1){
					var elm = li[idx-1];
					elm.addClass = addClass;
					elm.addClass('hovered');
					//put pattern on array
					patternAry.push(pattId);
					//add start point for line
					var margin = iObj.option.margin;
					var radius = iObj.option.radius;
					//圆心坐标
					var newX = (posObj.i - 1) * (2 * margin + 2 * radius) + 2 * margin + radius;
					var newY = (posObj.j - 1) * (2 * margin + 2 * radius) + 2 * margin + radius;

					if(patternAry.length != 1) {
						var lA = getLengthAngle(iObj.lineX1, newX, iObj.lineY1, newY);
						iObj.line.style.width = (lA.length + 10) +'px';
						iObj.line.style.transform = 'rotate(' + lA.angle + 'deg)';
						iObj.line.style.webkitTransform = 'rotate(' + lA.angle + 'deg)';

						if (!lineOnMove) iObj.line.style.display = 'block';
					}

					var line = document.createElement('div');
					line.className = 'patt-lines';
					line.style.top = (newY - 5)+'px';
					line.style.left = (newX - 5)+'px';
					iObj.holder.appendChild(line);

					iObj.line = line;
					iObj.lineX1 = newX;
					iObj.lineY1 = newY;
					if(!lineOnMove) iObj.line.style.display = 'none';
				}
			}
		}
		function endHandler(e, patternObj) {
			e.preventDefault();
			console.log("End");
			var iObj = objectHolder[patternObj.token];
			var li = iObj.pattCircle;
			var pattern = iObj.patternAry.join('');

			this.off(touchMove, this.fnMove, false).removeClass('patt-hidden');

			if(!pattern) return;
			var line = iObj.line;
			iObj.option.onDraw(pattern);
			
			patternObj.pattern = pattern;

			line.parentNode.removeChild(line);
			
			if (iObj.rightPattern) {
                if (pattern == iObj.rightPattern) {
                    iObj.onSuccess();
                } else {
                    iObj.onError();
                    obj.error();
                }
            }


		}
		function one(type, fn){
			this.on(type, fn, false);
		}
		function off (type, fn, useCapture){
			window.removeEventListener ? this.removeEventListener(type, fn, useCapture || false) : this.detachEvent('on' + type, fn);
			return this;
		}
		
		function removeClass(str){
			for(var i = 0, len = this.length; i < len; i++){
				for(var j = 0, lenClassList = this[i].classList.length; j < lenClassList; j++){
					if(this[i].classList[j] == str){
						this[i].classList.remove(str);
					}
				}
			}
		}
		function getLengthAngle(x1, x2, y1, y2) {
			var xDiff = x2 - x1;
			var yDiff = y2 - y1;
			return {
				length: Math.ceil(Math.sqrt(xDiff*xDiff+yDiff*yDiff)),
				angle: Math.round((Math.atan2(yDiff, xDiff)*180)/Math.PI)
			}
		}
		function InternalMethods() {};
		InternalMethods.prototype = {
			constructor: InternalMethods,
			removeClass: removeClass,
			addClass: addClass,
			on: on,
			off: off,
			getIdxFromPoint: function (x, y){
				var option = this.option;
				var matrix = option.matrix;
				var xi = x - this.wrapLeft;
				var yi = y - this.wrapTop;
				var idx = null;
				var margin = option.margin;
				var plotLn = option.radius*2 + margin*2;
				//ceil向上舍入
				var qsntX = Math.ceil(xi/plotLn);
				var qsntY = Math.ceil(yi/plotLn);
				var remX = xi % plotLn;
				var remY = yi % plotLn;
				//出界
				if(qsntX <= matrix[1] && qsntY <= matrix[0] && remX > margin*2 && remY > margin*2) {
					idx = (qsntY - 1) * matrix[1] + qsntX;
				}	
				return {
	                idx: idx,
	                i: qsntX,
	                j: qsntY,
	                x: xi,
	                y: yi
	            };
 			},
		}
		var Holder = function (){}
		function patternLock(selector, option) {

			var _this = this;
			var token = _this.token = Math.random();
			var iObj = objectHolder[token] = new InternalMethods();	
			var holder = iObj.holder = document.getElementById(selector);
			holder.addClass = addClass;
			holder.on = on;
			holder.one = one;
			holder.off = off;
			holder.removeClass = removeClass;
			if(holder.length == 0) { return;}
			iObj.object = _this;
			option = iObj.option = _this.extend(patternLock.defaults, option);
			readyDom(iObj);
			//addClass
			holder.addClass('patt-holder');
			//
			holder.on(touchStart, function (e) {
				console.log("touchStart");
				startHandler.call(this, e, _this);
	        });
	        
	        iObj.option.onDraw = option.onDraw || nullFunc;

	        var mapper = option.mapper;
	        if(typeof mapper === "object") {
	        	iObj.mapperFunc = function (idx){
	        		return mapper[idx];
	        	}
	        }else if(typeof mapper == "function") {
	        	iObj.mapperFunc = mapper;
	        }else{
	        	iObj.mapperFunc = nullFunc;
	        }

	        iObj.option.mapper = null;
		}

		patternLock.prototype = {
			extend: function (defaults, option){
				for(var i in option) {
					if(option.hasOwnProperty(i)) {
						defaults[i] = option[i];
					}
				}
				return defaults;
			},
			reset: function (){
				var iObj = objectHolder[this.token];
				//remove lines
				iObj.pattCircle.removeClass = removeClass;
				iObj.pattCircle.removeClass('hovered');
				var pattLines = find('patt-lines', iObj.holder)
				if(pattLines.length){
					pattLines.forEach(function (ele, index, arr){
						ele.parentNode.removeChild(ele);	
					});
				}
				iObj.patternAry = [];
			},
			error: function () {
	            objectHolder[this.token].holder.addClass('patt-error');
	        },
	        checkForPattern: function (pattern, success, error) {
	            var iObj = objectHolder[this.token];
	            iObj.rightPattern = pattern;
	            iObj.onSuccess = success || nullFunc;
	            iObj.onError = error || nullFunc;
	        },
	        getPattern: function () {
	            return objectHolder[this.token].patternAry.join('');
	        },
	        option: function (key, val) {
	            var iObj = objectHolder[this.token],
	                option = iObj.option;
	            //for set methods
	            if (!val) {
	                return option[key];
	            }
	            //for setter
	            else {
	                option[key] = val;
	                if (key == "margin" || key == "matrix" || key == "radius") {
	                    readyDom(iObj);
	                }
	            }
	        },
		}
		patternLock.defaults = {
	        matrix: [3, 3],
	        margin: 20,
	        radius: 25,
	        patternVisible: true,
	        lineOnMove: true
	    };
		window.patternLock = patternLock;	
	})();

	var pattern = new patternLock('patternLock', {
		onDraw: function (pattern){
			console.log(pattern);
		}
	});
	pattern.checkForPattern(
	pattern.pattern, 
	function(){
		console.log("成功");
	},function (){
		console.log("失败");
	})