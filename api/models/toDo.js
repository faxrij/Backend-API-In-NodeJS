const mongoose = require('mongoose');

const toDoSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    description: {type: String, required: true},
    priority: { type: String, required: true},
    done : {type: Boolean, default:false}

});

module.exports = mongoose.model('ToDo',toDoSchema);