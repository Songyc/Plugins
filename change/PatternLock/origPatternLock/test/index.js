define([], function() {

	var View = Piece.View.extend({

		el: '#test-index',

		type: 'portal',

		render: function() {
			return this;
		},
		onShow: function() {
			//write your business logic here :)
		}
	});

	return View;

});