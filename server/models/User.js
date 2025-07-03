const mongoose = require ('mongoose');
const bcrypt = require ('bcryptjs');

const UserSchema = new mongoose.Schema({
    username:{
        type: String,
        required: [true, 'Please add a username'],
        unique: [true, 'Username already exists'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: [true, 'Email already exists'],
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'pleae enter a valid email']
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

//match password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//explicit index 
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });

module.exports = mongoose.model('User', UserSchema); 