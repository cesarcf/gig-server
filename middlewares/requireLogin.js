import passport from 'passport'
import passportService from '../services/passport'

/**
* Middleware para authenticar rutas previamente Authenticados los Users
**/
const requireLogin = passport.authenticate('local', { session: false })

export default requireLogin