import express from 'express'
const app = express.Router()
import User from '../models/User'
import requireJWT from '../middlewares/requireJWT'

/**
* Async Validation Redux-Form
**/
app.post('/email', (req, res) => {
	//Comprobamos con cada cambio en el form si existe ese email en la database
	User.findOne({ email: req.body.email })
		.then(user => {
			user ? res.send({ email: true }) : res.send({ email: false })
		})
})


/**
* Campos para identificar al User con Authorization
**/
app.get('/profile', requireJWT, (req, res) => {
	//Devolver los campos que el "user" utiliza para identificarse
	User
		.findOne({ _id: req.user._id })
		.select({_id:0, roles:1, firstName:1, lastName:1, email:1, lastLogin:1 })
		.then(user => res.send({ 'user': user }) )
		.catch(err => res.status(404).send({ 'message':'Usuario no encontrado!' }) )
})















export default app