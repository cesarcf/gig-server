import mongoose, { Schema } from 'mongoose'


const AddressBookSchema = new Schema({
	firstName: { type: String },
	lastName: { type: String },
	email: { type: String },
	country: { type: String }
})


export default AddressBookSchema