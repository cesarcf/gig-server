const path = require('path')


module.exports = {

	//Estas opciones cambian el modo en como se resuelven los Modulos
	resolve: {
		//Nos permite definir que tipos de Extensiones se resuelven de manera automatica
		//si no se expecifica la extension del archivo al importar el modulo
		extensions: ['.js', '.jsx'],

		//Definimos los alias que podemos usar al importar un modulo, esto nos permite
		//evitar escribir mucho codigo al importar los modulos de los diferentes directorios
		alias: {
			// Client: path.resolve(__dirname, 'src/client/'),
			// Server: path.resolve(__dirname, 'src/server/')
		}
	},

	module: {
		rules:[


		]//fin de Rules
	}

}