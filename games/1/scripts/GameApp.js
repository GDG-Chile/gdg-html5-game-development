define([], function() {

	// The constructor
	var GameApp = function(args) {
		var me = this;

		// Copia los parametros
		for (var key in args) {
			me[key] = args[key];
		}
		me.ctx || (me.ctx = me.canvas.getContext('2d'));
		me.frameRate || (me.frameRate = 60 / 1000);
		
		me.isPressed = [];
		
		me.lastTime = Date.now();

		// Guarda en la lista la referencia tecla si es presionada
		document.addEventListener('keydown', function(e) {
			console.log(e.keyCode);
			last = e;
			me.isPressed[e.keyCode] = true;
			if (e.charCode)// charCode es distinto de 0 si es una letra, como 'A'
				me.isPressed[String.fromCharCode(e.charCode).toUpperCase()] = true;
		});

		// Deshace la acción anterior cuando se deja de presionar la tacla
		document.addEventListener('keyup', function(e) {
			me.isPressed[e.keyCode] = false;
			if (e.charCode)
				me.isPressed[String.fromCharCode(e.charCode).toUpperCase()] = false;
		});
	};

	GameApp.prototype = {

		run : function() {			
			var me = this;
			
			// Actualiza la diferencia de tiempo
			var delta = Date.now() - me.lastTime;
			me.lastTime = delta;
			
			setInterval(function() {
				me.update(delta);
				me.render(me.ctx);
			}, me.frameRate);
			
		},

		// Al actualizar
		update : function(delta) {

		},

		// Al renderizar
		render : function(ctx) {

		}
	};

	return GameApp;

});

