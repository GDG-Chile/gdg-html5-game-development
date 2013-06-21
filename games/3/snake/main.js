function main() {
	
	/**
	 * Un número aleatorio
	 * @param {Object} max
	 */
	var randomUtil = function(max) {
		return parseInt(Math.random() * max);
	}
	var randomColor = function() {
		return 'rgb(' + (55 + randomUtil(200)) + ',' + (55 + randomUtil(200)) + ',' + (55 + randomUtil(200)) + ')';		
	}
	function Rectangle(x, y, width, height) {
		this.x = (x == null) ? 0 : x;
		this.y = (y == null) ? 0 : y;
		this.width = (width == null) ? 0 : width;
		this.height = (height == null) ? this.width : height;

		this.intersects = function(rect) {
			if (rect != null) {
				return (this.x < rect.x + rect.width && this.x + this.width > rect.x && this.y < rect.y + rect.height && this.y + this.height > rect.y);
			}
		}
	}
	
	var canvas = document.querySelector('canvas');
	canvas.width = document.body.offsetWidth;
	canvas.height = document.body.offsetHeight;
	
	window.onresize = function() {
		canvas.width = document.body.offsetWidth;
		canvas.height = document.body.offsetHeight;	
	};

	// Códigos del teclado, usar como constantes
	var LEFT = 37, RIGHT = 39, UP = 38, DOWN = 40, ENTER = 13;

	// Instancia el juego
	var game = new SimpleGame({

		// El elemento canvas donde dibujar
		canvas : canvas,

		// El contexto (2D o 3D), en este caso 2D
		contextType : '2d',
		
		// El objeto con los audios a cargar
		audios : {
			eat : [{
				type : 'audio/mpeg',
				src : 'src/audio/achievement.mp3'
			}, {
				type : 'audio/ogg',
				src : 'src/audio/achievement.ogg'
			}],
			death : [{
				type : 'audio/mpeg',
				src : 'src/audio/death.mp3'
			}, {
				type : 'audio/ogg',
				src : 'src/audio/death.ogg'
			}],
			teleport : [{
				type : 'audio/mpeg',
				src : 'src/audio/teleport.mp3',
			}, {
				type : 'audio/ogg',
				src : 'src/audio/teleport.ogg',
			}]
		}
	});

	// Cada vez que se inicie el juego...
	// Este método se llama al hacer game.play()
	game.on('Play', function() {				
		
		this.centralText = 'PRECIONA ENTER';
		this.isRunning = false;				

		this.audios.eat.play();

		// La puntuación
		this.score = 0;

		this.dir = UP;

		// Crea el cuerpo de la serpiente
		this.snake = [];
		
		this.color = {
			snake : 'rgb(255, 255, 255)',
			food  : 'rgb(255, 255, 255)'
		};

		// Agrega el cuerpo inicial
		this.snake.push(new Rectangle(40, 40, 15, 15));

		// Agrega la primera comida
		this.food = new Rectangle(80, 80, 10, 10);
		this.food.x = randomUtil(this.canvas.width / 15 - 1) * 15;
		this.food.y = randomUtil(this.canvas.height / 15 - 1) * 15;

		this.velocidad = 0.5;

		// Flag que indica si se ha terminado el juego
		this.GAMEOVER = false;

	});

	// Cada vez que se requiera un nuevo ticket de lógica del juego.
	// Se llama internamente una vez tras otra, la idea es que aquí
	// se haga la lógica del juego por estados, estableciendo coordenadas
	// que serán usadas cuando se dibuje el frame
	game.on('NextTicket', function(delta) {

		var isMoving = false;
		
		var x, y;

		// Si se apreta la tecla superior Y no se sale del borde
		if (this.isPressed[UP] && !this.isPressed[DOWN]) {
			this.snake[0].y -= this.velocidad * delta;
			isMoving = true;
			x = 1;
			y = -1;
		}

		// Bajar
		if (this.isPressed[DOWN]) {
			this.snake[0].y += this.velocidad * delta;
			isMoving = true;			
			x = 1;
			y = 1;
		}

		// Izquierda
		if (this.isPressed[LEFT]) {
			this.snake[0].x -= this.velocidad * delta;
			isMoving = true;
			x = -1;
			y = 1;
		}

		// Derecha
		if (this.isPressed[RIGHT]) {
			this.snake[0].x += this.velocidad * delta;
			isMoving = true
			x = 1;
			y = 1;
		}

		// Si me salgo de la pantalla
		if (this.snake[0].x > this.canvas.width - this.snake[0].width)
			this.snake[0].x = 0;
		if (this.snake[0].y > this.canvas.height - this.snake[0].height)
			this.snake[0].y = 0;
		if (this.snake[0].x < 0)
			this.snake[0].x = this.canvas.width - this.snake[0].width;
		if (this.snake[0].y < 0)
			this.snake[0].y = this.canvas.height - this.snake[0].height;

		if (this.snake[0].intersects(this.food)) {
			this.color.snake = this.color.food;
			this.color.food = randomColor();
			this.snake.push(new Rectangle(0, 0, 15, 15));
			this.score++;
			this.food.x = randomUtil(this.canvas.width / 15 - 1) * 15;
			this.food.y = randomUtil(this.canvas.height / 15 - 1) * 15;
			this.audios.eat.play();
		}

		// La serpiente se intersecta con ella misma
		for (var i = 2; i < this.snake.length; i++) {
			if (this.snake[0].intersects(this.snake[i])) {
				this.isGameover = true;
				//this.audios.death.play(); XD <- ERROR DE CALCULO XDD
			}
		}

		// Avanza la serpiente
		if (isMoving) {
			for (var i = this.snake.length - 1; i > 0; i--) {
				this.snake[i].x = this.snake[i - 1].x;
				this.snake[i].y = this.snake[i - 1].y;
			}
		}

	});

	// Cada vez que se requiera dibujar un frame...
	// También se llama internamente una vez tras otra, en cada pasada
	// limpia el canvas y dibuja
	game.on('NextFrame', function(ctx) {
		
		ctx.save();
		
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// Pinta el cuerpo de la serpiente segmento por segmento
		//ctx.drawImage(this.images.body, this.snake[0].x, this.snake[0].y);
		
		ctx.beginPath();		
		ctx.fillStyle = this.color.snake;		
		ctx.shadowColor = this.color.snake;
		ctx.shadowBlur = 20;		
		ctx.arc(this.snake[0].x, this.snake[0].y, 7.5, 0, 2*Math.PI);
		ctx.fill();
		
		ctx.beginPath();
		ctx.strokeStyle = this.color.snake;
		ctx.lineWidth = '15';
		ctx.lineCap = 'round';
		
		ctx.moveTo(this.snake[0].x, this.snake[0].y);		
		for (var i = 1; i < this.snake.length; i++) {
			ctx.arcTo(this.snake[i-1].x, this.snake[i-1].y, this.snake[i].x, this.snake[i].y, 5);
			//ctx.drawImage(this.images.body, this.snake[i].x, this.snake[i].y);			
		}
		ctx.stroke();

		//ctx.drawImage(this.images.food, this.food.x, this.food.y);
		ctx.beginPath();
		ctx.fillStyle = this.color.food;
		ctx.shadowColor = this.color.food;
		ctx.arc(this.food.x, this.food.y, 7.5, 0, 2*Math.PI);
		ctx.fill();
		
		ctx.beginPath();
		ctx.fillStyle = 'rgb(255, 255, 255)';
		ctx.font = '16px Courier New';
		ctx.fillText('Puntuación: ' + this.score, 0, 30);		

		ctx.restore();

	});
	
	game.play();
	

}