if(process.env.NODE_ENV === 'production'){
	console.log('ESTAMOS EN PRODUCCION')
	module.exports = require('./prod')

} else {
	console.log('ESTAMOS EN DEVELOPMENT')
	module.exports = require('./dev')

}