/**
 * Parametros: [Array de Roles], Objeto Request
 * Devuelve una Promises
 *
 * Le pasamos un Array de Roles y por cada uno comprobamos si el usuario lo tiene.
 * Si el usuario tiene TODOS (every) los ROLES entonces esta Authorizado
 **/
let userHasRoles = (rolesToCheck, req) => {
	const { user } = req
	return new Promise((resolve, reject) => {
		if (!user) { return reject('Usuario no Autorizado!') }

		let isValidUser = rolesToCheck.every(roleToCheck => {
			return user.roles.some(roleUser => roleUser === roleToCheck)
		})

		return isValidUser ? resolve(user) : reject('No tiene Autorización para esta operación!')
	})
}

export default userHasRoles