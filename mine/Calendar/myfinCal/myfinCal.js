(function (){
		var Calendar = {
		 	_Y_year: new Date().getFullYear(),
		 	_M_month: new Date().getMonth() + 1,
		 	_Y_lastYear: 0,
		 	_M_lastMonth: 0,
		 	_Y_nextYear: 0,
		 	_M_nextMonth: 0,
		},
		defalutOptions = {
			width: 'auto',
			height: 'auto',
			btn: true,
			header: true,
			seconds: true,
			background: '#fff',
			color: '#000',
			todayColor: '#fff',
		},
		doc = document,
		iObj = {},
		hasTouch = 'ontouchstart' in window ? true : false,
		touchStart = hasTouch ? 'touchstart' : 'mousedown',
		touchMove = hasTouch ? 'touchmove' : 'mousemove',
		touchEnd = hasTouch ? 'touchend' : 'mouseup',
		touchCancel = hasTouch ? 'touchcancel' : 'mouseup';
		
		//----------private function----------------
		// 判断润年
		function isLeap() {
	 		var _year = Calendar._Y_year;
	 		if(_year % 4 === 0 && _year % 100 > 0) {
	 			return true ;
	 		}
	 		if(_year % 400 === 0 && _year % 3200 > 0) {
	 			return true ;
	 		}
	 		return false ;
	 	}
	 	// 获取月的天数
	 	function dayLen(_month) {
	 		if(_month === 2) {
	 			if(!isLeap()) return 28;
	 			return 29;
	 		}
	 		if(_month < 8 && _month % 2 === 1) {
	 			return 31;
	 		}
	 		if(_month >= 8 && _month % 2 === 0) {
	 			return 31;
	 		}
	 		return 30 ;
	 	}
		function lastYear(e) {
			Calendar._Y_year = Calendar._Y_lastYear;
		}
		function nextYear(e) {
			Calendar._Y_year = Calendar._Y_nextYear;
		}
		function lastMonth(e) {
			if(Calendar._M_month == 1) {
				Calendar._Y_year = Calendar._Y_lastYear;
				Calendar._M_month = 12;
			}else {
				Calendar._M_month = Calendar._M_lastMonth;
			}
		}
		function nextMonth(e) {
			if(Calendar._M_month == 12) {
				Calendar._Y_year = Calendar._Y_nextYear;
				Calendar._M_month = 1;
			}else {
				Calendar._M_month = Calendar._M_nextMonth;
			}
		}
		function getLastYear() {
			Calendar._Y_lastYear = Calendar._Y_year - 1;
		}
		function getNextYear() {
			Calendar._Y_nextYear = Calendar._Y_year + 1;
		}
		function getLastMonth() {
			if(Calendar._M_month == 1) {Calendar._M_lastMonth = 12; Calendar._Y_lastYear = Calendar._Y_year - 1;}
			else {Calendar._M_lastMonth = Calendar._M_month - 1;}
		}
		function getNextMonth() {
			if(Calendar._M_month == 12) {Calendar._M_nextMonth = 1;Calendar._Y_nextYear = Calendar._Y_year + 1;}
			else {Calendar._M_nextMonth = Calendar._M_month + 1;}
		}
	 	function loadCalendarHeader(strArr, strDay) {
	 		strArr.push('<tr class = "myCal-row day-row"><td class = "myCal-row-day">' + strDay.split(',').join('</td><td class = "myCal-row-day">') + '</td></tr>');
	 	}
	 	function extend(defaults, addtionals) {
	 		if(!addtionals) return defaults;
	 		for(var key in addtionals) {
	 			if(addtionals.hasOwnProperty(key)) defaults[key] = addtionals[key];
	 		}
	 		return defaults;
	 	}
		function loadBtn(strArr, btn) {
			var time = ['lastYear','lastMonth','thisYear','thisMonth','nextMonth','nextYear'];
			strArr.push('<table class = "myCal-btn"><tr class = "myCal-row btn-row">'); 
			for(var i = 0, len = time.length; i < len; i++) {
				strArr.push('<td class = "myCal-row-btn myCal-row-' + time[i] + '">' + btn[i] + '</td>');
			}
			strArr.push('</tr></table>');
		}
		function addEvent(type, fn, userCapture) {
			window.addEventListener ? this.addEventListener(type, fn, userCapture || false) : this.attachEvent('on' + type, fn);
		}
		function removeEvent(type, fn, userCapture) {
			window.removeEventListener ? this.removeEventListener(type, fn, userCapture || false) : this.detachEvent('on' + type, fn); 
		}
	 	function getDom() {
	 		iObj.holder = doc.getElementsByClassName('myCalendar')[0];
	 		iObj.lastYear = doc.getElementsByClassName('myCal-row-lastYear')[0];
	 		iObj.lastMonth = doc.getElementsByClassName('myCal-row-lastMonth')[0];
	 		iObj.year = doc.getElementsByClassName('myCal-row-thisYear')[0];
	 		iObj.month = doc.getElementsByClassName('myCal-row-thisMonth')[0];
	 		iObj.nextMonth = doc.getElementsByClassName('myCal-row-nextMonth')[0];
	 		iObj.nextYear = doc.getElementsByClassName('myCal-row-nextYear')[0];
	 	}
	 	function bindEvent() {
	 		getDom();
	 		addEvent.call(iObj.lastYear, touchStart, startHandle);
	 		addEvent.call(iObj.lastYear, touchEnd, endHandle);
	 		addEvent.call(iObj.lastMonth, touchStart, startHandle);
	 		addEvent.call(iObj.lastMonth, touchEnd, endHandle);
	 		addEvent.call(iObj.nextMonth, touchStart, startHandle);
	 		addEvent.call(iObj.nextMonth, touchEnd, endHandle);
	 		addEvent.call(iObj.nextYear, touchStart, startHandle);
	 		addEvent.call(iObj.nextYear, touchEnd, endHandle);
	 	}
		function startHandle() {
			var _this = iObj._this;
			if(/lastYear/.test(this.className)) {lastYear(); updateTime();}
			if(/lastMonth/.test(this.className)) {lastMonth(); updateTime();}
			if(/nextMonth/.test(this.className)) {nextMonth(); updateTime();}
			if(/nextYear/.test(this.className)) {nextYear(); updateTime();}
		}
		function endHandle() {
			var _this = iObj._this;
			removeEvent.call(iObj.lastYear, touchStart, startHandle);
			removeEvent.call(iObj.lastYear, touchEnd, endHandle);
			removeEvent.call(iObj.lastMonth, touchStart, startHandle);
			removeEvent.call(iObj.lastMonth, touchEnd, endHandle);
			removeEvent.call(iObj.nextMonth, touchStart, startHandle);
			removeEvent.call(iObj.nextMonth, touchEnd, endHandle);
			removeEvent.call(iObj.nextYear, touchStart, startHandle);
			removeEvent.call(iObj.nextYear, touchEnd, endHandle);
			iObj.refresh();
		}
		function updateTime(){
			getLastYear();
			getLastMonth();
			getNextMonth();
			getNextYear();
		}
		function getRows(d) {
			var totalDay = d + iObj.thisMonthDay;
			return Math.ceil(totalDay/7);
		}
		function isZero(num) {
			return 0 <= num && num < 10 ? '0' + num : num;
		}
		function loadSeconds() {
			var seconds = [new Date().getHours(),':',new Date().getMinutes(),':',new Date().getSeconds()],
				name = ['myCal-hours','','myCal-minutes','','myCal-seconds'],
				textNode = '<tr><td class = "myCal-row-seconds ' + name[0] + '">' + isZero(seconds[0]) + '</td>';
				for(var i = 1, len = seconds.length; i < len; i++) {
					textNode += '<td class = "myCal-row-seconds ' + name[i] + '">' + isZero(seconds[i]) + '</td>';
				}
				textNode += '</tr>';
				eleNode = doc.createElement('table');
				eleNode.className = 'myCal-time';	
				eleNode.innerHTML = textNode;
				iObj.el.appendChild(eleNode);	
		}
		function run() {
			iObj.hours = doc.getElementsByClassName('myCal-hours')[0];
			iObj.minutes = doc.getElementsByClassName('myCal-minutes')[0];
			iObj.seconds = doc.getElementsByClassName('myCal-seconds')[0];
			iObj.hours.innerHTML = isZero(new Date().getHours());
			iObj.minutes.innerHTML = isZero(new Date().getMinutes());
			iObj.seconds.innerHTML = isZero(new Date().getSeconds());
		}
	 	//---------------public----------------
		var myCalendar = function (el, addOptions){
			var _this = this,
				doc = document,
				i,
				j,
			    rows = 0,
			    strDay = '日,一,二,三,四,五,六';
			el = typeof el == 'object' ? el : doc.getElementById(el);
			options = extend(defalutOptions, addOptions);
			iObj._this = _this;
			iObj.el = el;   
			iObj.options = options;
			// iObj.lastYear = lastYear;
		    function loadCalendar() {
		    	var d = (new Date(Calendar._Y_year,Calendar._M_month-1,1)).getDay(), //星期几
		    		btn = ['<<','<',Calendar._Y_year,Calendar._M_month,'>','>>'],
		    		len = dayLen(Calendar._M_month),
		    		start = 0,
		    		fill = 0,
		    		nextMonthfill = 0,
		    		arr = [],
		    		strArrHtml = '',
		    		thisMonthDay = dayLen(Calendar._M_month),
		    		strArr = [];	
	 			updateTime();
	 			iObj.thisMonthDay = thisMonthDay;
				//加载日历
				for(i = 0; i < getRows(d); i++) {
					arr[i] = [];
					for(j = 0; j < 7; j++) {
						start++;
						fill = start - d;
						if(fill > 0 && fill <= thisMonthDay) {
							arr[i][j] = fill;
						}else if(fill <= 0) {
							arr[i][j] =  dayLen(Calendar._M_lastMonth) + fill;
						}else if(fill > thisMonthDay) {
							arr[i][j] = ++nextMonthfill;
						}
					}
				}
				//添加按钮
				if(options.btn) loadBtn(strArr, btn);
				strArr.push('<table class = "myCalendar" cellspacing = 0 >');
				//添加星期
				if(options.header) loadCalendarHeader(strArr, strDay);
				arr.forEach(function (value, index, arr){
					strArr.push('<tr class = "myCal-row"><td class = "myCal-row-date">' + value.join('</td><td class = "myCal-row-date">') + '</td></tr>');
				});
				strArr.push('</table>');
				iObj.strArr = strArr;
				strArrHtml = iObj.strArr.join('');
				el.innerHTML = strArrHtml;
				if(options.width >= 0) el.style.width = options.width + 'px';
				if(options.height >= 0) el.style.height = options.height + 'px';
				if(options.color) el.style.color = options.color;
				if(options.background) el.style.background = options.background;
				bindEvent.call(this);
				//添加时分秒
				if(options.seconds) {loadSeconds(); setInterval(run, 1000);}
		    }
		    loadCalendar();
		    iObj.refresh = loadCalendar;
		}
		myCalendar.prototype = {
			constructor: myCalendar,
			onDraw: function (){

			}
		}
		window.myCalendar = myCalendar;
	})();