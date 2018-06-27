import passport from 'passport'
import passportService from '../services/passport'

/**
* Middleware para authenticar rutas con JWT
**/
const requireJWT = passport.authenticate('jwt', { session: false })

export default requireJWT