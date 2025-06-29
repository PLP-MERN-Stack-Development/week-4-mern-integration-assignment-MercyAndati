const mongoose = require ('mongoose');
const bcrypt = require ('bcryptjs');

const UserSchema = new mongoose.Schema({
    Username:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match:[/,+\!.\..+/, 'pleae enter a valid email']
    },
    password:{
        type: String,
        required: true, 
        minlength: 6,
        select: false
    },
    role:{
        type: String,
        enum:['user', 'admin'],
        default: 'user'
    }
}, {timestamps: true});

// hash pasword before saving
UserSchema.pre('save', async function(next){
    if (!this.isModified('password')) return next();
    this.password= await bcrypt.hash(this.password, 8);
    next();
});

module.exports = mongoose.model('User', UserSchema); 