window.onload = function () {
	var oBtn = document.getElementById('start');
	oBtn.onclick = function (){
		var calendar = new myCalendar('myCalendar',{
			width: 'auto',
			height: 'auto',
			btn: true,
			header: true,
			seconds: true,
			background: 'rgba(48, 83, 173, 0.44)',
			color: '#000',
			todayColor: '#fff'
		});
	}
}