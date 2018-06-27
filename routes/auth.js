import express from 'express'
const app = express.Router()
import User from '../models/User'
import jwt from '../services/jwt'
import requireJWT from '../middlewares/requireJWT'
import requireLogin from '../middlewares/requireLogin'

import passport from 'passport'
import passportService from '../services/passport'

/**
* Formulario de Registro
**/
app.post('/signup', (req, res) => {
	const firstName = req.body.firstName
	const email = req.body.email
	const password = req.body.password

	if(!firstName || !email || !password){
		return res.status(422).json({ error: 'Complete el formulario de registro!' })
	}

	User.findOne({ email: email.toLowerCase() })
		.then(userExist => {
			if(userExist){ res.status(422).json({ error: 'Este Email ya esta en uso.' }) }

			//Creamos el Usuario y lo guardamos:
			const user = new User({ email, password, firstName })
			return user.save()
		})
		.then(user => {
			//Usuario creado correctamente, le enviamos el JWToken
			res.send({ token: jwt(user) })
		})
		.catch((err) => res.status(422).json({ error: 'Error Interno!' }) )
})


/**
*
**/
app.post('/signin', requireLogin, (req, res) => {
	//Aqui ya esta Authenticado, devolvemos el Token
	res.send({ token: jwt(req.user) })
})



/*
 * Iniciamos la Auth enviando al usuario a google para su identificacion
 * //Le dice a google que informacion queremos del usuario
 */
app.get('/google', passport.authenticate('google', { scope: ['profile', 'email']}));

/*
 * Google Callback
 * Cuando vuelve de Google, le pasamos el control a PassportJS y luego,,.
 */
app.get('/google/callback', passport.authenticate('google'), (req , res) => {
	//Aqui ya esta authenticado
	const token = jwt(req.user)
	//Guardo el token en Database para comprobarlo en un request de seguridad:
	User.update({ _id: req.user._id },
		{ $set: { googleId:req.user.googleId, firstName:req.user.firstName, authToken:token }, $addToSet: { authMethod: 'google' } }).then(() => {
		res.redirect(`/signin?token=${token}`)
	})
})


/*
 * Iniciamos la Auth enviando al usuario a facebook para su identificacion
 * //Le dice a facebook que informacion queremos del usuario
 */
app.get('/facebook', passport.authenticate('facebook', { scope: ['email']}));

/*
 * facebook Callback
 */
app.get('/facebook/callback', passport.authenticate('facebook'), (req , res) => {
	//Aqui ya esta authenticado
	const token = jwt(req.user)
	//Guardo el token en Database para comprobarlo en un request de seguridad:
	User.update({ _id: req.user._id },
		{ $set: { facebookId:req.user.facebookId, firstName:req.user.firstName, authToken:token }, $addToSet: { authMethod: 'facebook' } })
		.then(() => {
		res.redirect(`/signin?token=${token}`)
	})
})



/*
 * Check Token OAuth
 * El token que nos envia el callback del AuthSocial, lo enviamos al cliente y este
 * hace un request para comprobar que no esta manipulado.
 */
app.get('/', requireJWT, (req, res) => {
	User.update({ _id: req.user._id }, { $unset: { authToken:'' } }).then(() => {
		res.send({ token: req.user.authToken })
	})

})



export default app

