const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    foto: { type: String}
});
const userSchema1 = new mongoose.Schema({
    
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true}
    
});
const User = mongoose.model('User',userSchema); 
const User1 = mongoose.model('User1',userSchema1); 
module.exports = User,User1;