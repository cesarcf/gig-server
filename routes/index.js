import authRouter from './auth'
import userRouter from './user'
import addressBookRouter from './addressBook'


export default (app) => {
	app.use('/auth', authRouter),
	app.use('/user', userRouter),
	app.use('/address-book', addressBookRouter)

}