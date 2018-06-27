import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import addressBookSchema from './addressBookSchema'

const userSchema = new Schema({
	firstName: { type: String },
	lastName: { type: String },
	email: { type: String, unique: true, lowercase: true },
	password: { type: String },
	googleId: { type: String },
	facebookId: { type: String },
	authMethod: {
		type: [String],
		enum: {
			values: [
				'local',
				'google',
				'facebook'
			]
		},
		default: 'local'
	},

	authToken: { type: String },
	/* AUTHORIZATION */
	roles: {
		type: [String],
		enum: {
			values: [
				'PROSPECT',
				'CUSTOMER',
				'MEMBER',
				'ADMIN'
			],
			message: 'Este ROLE no esta permitido!'
		},
		default: ['PROSPECT']
	},
	addressBook: [addressBookSchema],

	lastLogin: { type: Date, default: Date.now },
	created: { type: Date, default: Date.now },
	updated: { type: Date } /* UPDATED IN PRE MIDDLEWARE */
})


/**
* Pre-Middleware
**/
userSchema.pre('update', function(next){
	let User = this
	//Actualizamos el campo 'updated' despues de hacer cualquier update en el usuario
	User.update({},{ $set: { updated: Date.now() } })

	next()
})



/**
 *
 * HASEAMOS EL PASSWORD ANTES DE GUARDAR EL USER
 **/
userSchema.pre('save', function(next){
	//Optenemos acceso al user model
	var user = this

	// only hash the password if it has been modified (or is new)
	if(!user.isModified('password')) return next()

	//Generamos el 'Salt' para codificar la password
	bcrypt.genSalt(10, function(err, salt){
		if(err) return next(err)

		// Creamos el 'hast' de la password con la 'salt' anterior:
		bcrypt.hash(user.password, salt, function(err, hash){
			if(err) return next(err)

			// Sobreescribimos la 'password' con el hast creado antes de guardarla:
			user.password = hash
			//Pasamos al siguiente middleware
			next()
		})
	})

})



// ################# Instance Methods ######################### //
/**
 * Method de Instance para comparar que coincida la password con el
 * 'hash' guardado en la base de datos.
 *
 * user.comparePassword()
 */
userSchema.method('comparePassword', function(candidatePassword, cb) {
	var user = this
	// 'user.password' es el hash del user almacenado en database
	bcrypt.compare(candidatePassword, user.password, function(err, isMatch) {
		if (err) return cb(err)
		//devuelve 'true'
		cb(null, isMatch) //El err del calback es 'null' sino no llegaria hasta aqui
	})
})



// ################# Statics Methods ######################### //
/**
*
* ADD_ADDRESSBOOK_TO_USER
*/
userSchema.static('addContact', function(user, { firstName, lastName, email, country }){
	let User = this
	return User.findByIdAndUpdate(user._id, { $push: { addressBook: { firstName, lastName, email, country } } }, {new: true}).then(user => user)
})

/**
*
* EDIT_ADDRESSBOOK_TO_USER
*/
userSchema.static('editContact', function(user, addressBookId, { firstName, lastName, email, country }){
	let User = this
	return User.findOneAndUpdate(
		{ _id:user._id, 'addressBook._id': addressBookId },
		{ $set: {
			'addressBook.$.firstName':firstName,
			'addressBook.$.lastName':lastName,
			'addressBook.$.email':email,
			'addressBook.$.country':country
			}
		}, {new: true}
	).then(user => user)
})

/**
*
* REMOVE_ADDRESSBOOK_TO_USER
*/
userSchema.static('deleteContact', function(user, addressBookId){
	let User = this
	return User.findOneAndUpdate({ _id:user._id }, { $pull: { 'addressBook': { _id: addressBookId } } }, {new: false}).then(user => user)
})





const User = mongoose.model('User', userSchema, 'users')

export default User