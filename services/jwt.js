import jwt from 'jsonwebtoken'
import moment from 'moment'
import keys from '../config/keys'

function createJWToken(user){

	let payload = {
		sub: user.id, //(subject)
		iat: moment().unix()//new Date().getTime() //(issued at time) Cuando fue creado el Token. (el momento actual en formato UNIX)
	}

	let options = {
		algorithm: 'HS256', //(default: HS256)
	}

	let token = jwt.sign(payload, keys.JWT_SECRET, options)

	return token
}


export default createJWToken