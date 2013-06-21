(function(define, window, document) {

	// Añade soporte para programar en el estílo
	// AMD (Definición Asíncrona de Módulos)
	// ignorar
	define([], function() {
		/**
		 * El constructor de Game
		 *
		 * @param {object} props un objeto con las
		 * propiedades del juego, las cuales son:
		 * @param {DomNode} [props.canvas] el objeto canvas, obtenido,
		 *  por ejemplo, con document.querySelector('canvas'), si se omite crea uno
		 * @param {string} [props.context] el contexto 2d o 3d del juego, por omisión es '2d'
		 * @param {function()} [props.onCreate] el evento a llamar
		 *  cuando se crea el juego, es decir cuando se hace un new GameEgine(props)
		 * @param [function()] [props.onStart] el evento a llamar la primera vez que se
		 * ejecuta el juego, o bien cuando se vuelve de un reseteo
		 * @param {function()} [props.onResume] el evento a llamar cada vez que se
		 * vuelve de una pausa, además de luego de onStart
		 * @param {function()} [props.onPause] el evento a llamar cuando se ejecuta una pausa
		 * @param {function()} props.onReset el evento a llamar cuando se ejecuta un reseteo
		 * @param {function(number)} [props.onNextTicket] el evento a llamar por cada ticket que ejecute el
		 * juego, entiendase a ticket como un estado lógico, que es llamado uno tras otro muchas veces
		 * por segundo. Recibe como parámetro la diferencia en milisegundos del ticket anterior.
		 * @param {function(?)} [props.onNextFrame] el evento a llamar por cada frame que se dibuje
		 * en el juego, similar a ticket, pero para actualizar la vista. Recibe como parámetro el contexto
		 * del canvas
		 */
		var SimpleGame = function(props) {

			// se crea self apuntando a this
			// (el ámbito de self es Game)
			var self = this;

			// Mezcla las propiedades
			for (var key in props) {
				this[key] = props[key];
			}

			// El canvas
			this.canvas = this.canvas || document.createElement('canvas');

			// El tipo de contexto, 2d o 3d
			this.contextType = this.contextType || '2d';

			// referencia el contexto del canvas
			this.context = this.canvas.getContext(this.contextType);

			// Referencia a la colección de imagenes
			this.images = this.images || {};

			// Referencia a la colección de audios
			this.audios = this.audios || {};

			// Bandera (flag) que indica si es la primera vez que se ejecuta el juego
			this._isFistTime = true;

			// una lista con las teclas que están
			// siendo presionadas en el ticket actual
			this.isPressed = {};

			// Guarda en la lista la referencia tecla si es presionada
			document.addEventListener('keydown', function(e) {
				self.isPressed[e.keyCode] = true;
				if (e.charCode)// charCode es distinto de 0 si es una letra, como 'A'
					self.isPressed[String.fromCharCode(e.charCode)] = true;
			});

			// Deshace la acción anterior cuando se deja de presionar la tacla
			document.addEventListener('keyup', function(e) {
				self.isPressed[e.keyCode] = false;
				if (e.charCode)
					self.isPressed[String.fromCharCode(e.charCode)] = false;
			});

			// Ejecuta el método onCreate, de existir
			this.emit('Create');

		}
		/**
		 * Ejecuta el juego
		 */
		SimpleGame.prototype.play = function() {			

			var self = this;

			// establece la bandera no detenerse.
			self._isPaused = false;			

			// Es la primera vez que se ejecuta el juego?
			this._isFistTime && (function() {
								
				// Carga las imagenes
				self.loadImages(self.images, function(images) {
														
					// Carga los audios
					self.loadAudios(self.audios, function(audios) {						
						self.images = images;
						self.audios = audios;
						// luego ejecuta onStart
						self.emit('Play');
						self._isFistTime = false;
						// Inicia el ciclo de frame tras frame
						nextFrame.call(window, function() {
							self._frame();
						});
					});
				});
				return true;
			})() || this.emit('Resume');

		}
		/**
		 * Detiene el juego en el siguiente frame
		 */
		SimpleGame.prototype.pause = function() {
			this._isPaused = true;
			this.emit('Pause');
		}
		/**
		 * Reinicia el juego
		 */
		SimpleGame.prototype.stop = function() {
			this._isFirstTime = true;
			this.emit('Stop');
		}
		/**
		 * @param {object} images un objeto de pares clave:valor, donde la clave es
		 *  la referencia que será usada para la imagen y el valor {string} la ruta hasta
		 *  esa imagen.
		 * @param {callback} callback la función a ser llamada cuando se carguen todas
		 *  las imagenes, recibe como parametro un objeto con las imagenes
		 */
		SimpleGame.prototype.loadImages = function(images, callback) {

			var self = this;
			
			// Si no hay imagenes, solo ejecutar el callback
			!images && callback.call(self, {});

			var _images = {};

			// La cantidad de imagenes
			var length = Object.keys(images).length;
			
			!length && callback.call(self, {});

			// Para cada imagen
			for (var key in images) {
				// Es realmente de este objeto?
				if (!images.hasOwnProperty(key))
					continue;
				_images[key] = new Image();
				_images[key].onload = function() {
					if (!--length)
						callback.call(self, _images);
				};
				_images[key].src = images[key];
			}
		}
		/**
		 * @param {object} audios un objeto de pares clave:valor, donde la clave es
		 *  la referencia que será usada para el audio y el valor {object} es un objeto
		 *  con dos atributos: src {string} con la ruta del archivo de audio y type {string}
		 *  con el mimetype del audio
		 * @param {callback} callback la función a ser llamada cuando se carguen todos
		 *  los audios, recibe como parametro un objeto con los audios
		 */
		SimpleGame.prototype.loadAudios = function(audios, callback) {

			var self = this;

			// Si no hay audios, solo ejecutar el callback
			!audios && callback.apply(self, {});

			// La cantidad de audios
			var length = Object.keys(audios).length;

			var _audios = {};

			// Para cada audio
			for (var key in audios) {

				// Es realmente de este objeto?
				if (!audios.hasOwnProperty(key))
					return;
				;
				_audios[key] = new Audio();
				for (var i in audios[key]) {
					if (_audios[key].canPlayType(audios[key][i].type)) {						
						_audios[key].src = audios[key][i].src;
						_audios.type = audios[key][i].type;
						break;
					}
				}
			}
			callback.call(self, _audios);
		}
		/**
		 * Referencia un evento
		 * @param string eventName el nombre del evento, ejemplo 'Create'
		 * @param function() callback que hacer cuando se ejecute el evento
		 */
		SimpleGame.prototype.on = function(eventName, callback) {
			this['on' + eventName] = callback;
		}
		/**
		 * Ordena a emitir el evento dado
		 * En el caso de que el evento no exista no hace nada.
		 * @param eneventName el nombre del evento a ejecutar
		 * @param ... el resto de los argumentos son pasados al método en el mismo orden
		 */
		SimpleGame.prototype.emit = function() {
			var eventName = 'on' + [].shift.call(arguments);
			if (!this[eventName])
				return;
			this[eventName].apply(this, arguments);
		}
		/**
		 * Define un "frame"
		 */
		SimpleGame.prototype._frame = function() {

			var self = this;

			// Tiempo actual (marca de tiempo UNIX)
			var nowTime = Date.now();

			// Tiempo pasado desde el último ticket
			var deltaTime = nowTime - this._prevTime;

			// Actualiza el tiempo previo
			this._prevTime = nowTime;

			// Siguiente ticket
			self.emit('NextTicket', deltaTime);

			// Llama a la función que dibuja en el canvas, si...
			// la idea de separar el ticket del frame es hacerlos en
			// tiempos distintos, pero este motor está hecho para ser
			// simple :)
			this.emit('NextFrame', this.context);

			// si no detener, ejecutar el otro frame
			!this._isPaused && nextFrame.call(window, function() {
				self._frame();
			});

		}
		/**
		 *
		 * @param {function} callback la función a ejecutar por el siguiente frame
		 */
		var nextFrame = (function() {
			return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
			function(callback) {
				window.setTimeout(callback, 1000 / 60);
			};
		})();

		// En AMD, 'define' sirve para definir un módulo, debe tener un return que retorna ese módulo,
		// en este caso el módulo es la clase SimpleGame
		return SimpleGame;

	});

})( typeof define !== 'undefined' ? define : function(deeps, factory) {
	SimpleGame = factory();
}, window, window.document);
