import express from 'express'
const app = express()
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import keys from './config/keys'
import routes from './routes'
import cors from './services/cors'
import passport from 'passport'
import requireJWT from './middlewares/requireJWT'
import methodOverride from 'method-override'


/**
* Conexion a MongoDB con mongoose
**/
mongoose.Promise = global.Promise
mongoose.connect(keys.MONGO_URI)


/** Cross-Origin Resource Sharing (CORS) **/
cors(app)

/** **/
app.use(morgan('dev'))

/** **/
app.use(bodyParser.json({ type: '*/*' }))
/** **/
app.use(passport.initialize());

/** Method Override **/
app.use(methodOverride('X-HTTP-Method-Override', ['POST','DELETE','PATCH']))

/** Rutas de la App **/
routes(app)

if(process.env.NODE_ENV === 'production'){
	app.set('trust proxy', true)//Express detras de un proxy
	app.set('x-powered-by', false)//desactivamos x-powered-by
	app.use(express.static('../client/build')) //Servimos los assets desde el /client

	const path = require('path')
	//Cualquier ruta que pongamos en el server siempre nos devuelve el index.html
	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, '../','client', 'build', 'index.html'));
	})
}

/**
* Lanzamos la App
**/
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Escuchando a NodeJS en el puerto: ${PORT}`))