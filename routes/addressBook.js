import express from 'express'
const app = express.Router()
import requireJWT from '../middlewares/requireJWT'

import User from '../models/User'

app.get('/', requireJWT,(req, res) => {
	User.findOne({ _id: req.user._id }).then(user => {
		res.send({'addressBooks': user.addressBook })
	})
})

app.post('/', requireJWT, (req, res) => {
	User.addContact(req.user, req.body).then(user => {
		res.send({ 'contact': user.addressBook.pop() })
	})
})

app.put('/:id', requireJWT, (req, res) => {
	User.editContact(req.user, req.params.id, req.body).then(user => {
		res.send({ 'contact': user.addressBook.find(contact => contact._id == req.params.id) })
	})
})

app.delete('/:id', requireJWT, (req, res) => {
	User.deleteContact(req.user, req.params.id).then(user => {
		res.send({ '_id': req.params.id })
	})
})



export default app