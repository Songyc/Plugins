define(['text!test/pattern.html'],
	function(viewTemplate) {
		return Piece.View.extend({
			id: 'test_pattern',
			events: {
				'click #patternContainer': 'save',
				// 'click .login': 'login'
			},
			render: function() {
				$(this.el).html(viewTemplate);

				Piece.View.prototype.render.call(this);
				return this;
			},
			save: function (pattern){
				alert("您的手势密码是：" + pattern);
			},
			login: function (password){
				var pattern = Piece.Session.loadObject("pattern");
				if(pattern === password) {
					alert("密码一致！");
					this.navigation();
				}else{
					alert("密码错误!");
				}
			},
			navigation: function (){
				this.navigate('login', {
					trigger: true
				});
			},
			initPattern: function (){
				var _this = this;
				var lock = new PatternLock("#patternContainer", {
					matrix: [3, 3],
					// margin: 40,
					// radius: 40,
					// patternVisible: true,
					// lineOnMove: true,
					onDraw: function (pattern){
						console.log(pattern);
						Piece.Session.saveObject("pattern", pattern);
						_this.save(pattern);
					}
					// mapper: {1:3,2:1,3:4,4:2,5:9,6:7,7:8,8:5,9:6}
				});
				var lock2 = new PatternLock(".patternContainer", {
					matrix: [3, 3],
					// margin: 40,
					// radius: 40,
					// patternVisible: true,
					// lineOnMove: true,
					onDraw: function (pattern){
						console.log(pattern);
						_this.login(pattern);
						//..
					}
					// mapper: {1:3,2:1,3:4,4:2,5:9,6:7,7:8,8:5,9:6}
				});

			},
			password: function (){
				Piece.Session.saveObject('user', '123');
				Piece.Session.saveObject('password', '321');
			},
			onShow: function() {
				this.password();
				this.initPattern();
				//write your business logic here :)
			}
		}); //view define

	});