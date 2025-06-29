const mongoose = require ('mongoose');

const CategorySchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'please provide a category name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Category name cannot be more than 50 characters']
    },
    slug:{
        type: String,
        maxlength: [200, 'Description cannot be more than 200 characters']
    }
}, {timestamps: true});//Automatically adds :createdAt, updatedAt

//creating slug from name before saving
CategorySchema.pre('save', function(next){
    this.slug = this.name.toLowerCase().replace(/[^\w]+/g, '-').replace(/-+/g, '-');
    next();
});

module.exports = mongoose.model('Category', CategorySchema);