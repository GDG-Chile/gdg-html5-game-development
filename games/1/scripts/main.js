require(['GameApp'], function(GameApp) {
	
	// teclas
	var LEFT = 37, RIGHT = 39, UP = 38, DOWN = 40, ENTER = 13;
	
	var img = new Image();	

	var game = new GameApp({

		velocidad : 5,
		
		x : 0,
		
		y : 0,

		canvas : document.querySelector('canvas'),

		update : function(delta) {
			console.log('update');
			if (this.isPressed[LEFT])
				this.x -= 1//delta * velocidad;

			if (this.isPressed[UP])
				this.y -= 1//delta * velocidad;

			if (this.isPressed[RIGHT])
				this.x += 1//delta * velocidad;

			if (this.isPressed[DOWN])
				this.y += 1//delta * velocidad;
		},

		render : function(ctx) {
			ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			ctx.fillStyle="red";
			ctx.drawImage(img, this.x, this.y);
			ctx.stroke();
		}
	});
	
	img.onload = function() {
		game.run();	
	};
	img.src = 'http://static.jsbin.com/images/favicon.png';
	
}); 