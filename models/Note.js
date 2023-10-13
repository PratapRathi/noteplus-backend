const mongoose = require('mongoose')
const {Schema} = mongoose;

const NoteSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    tag:{
        type: String,
        default: "General"
    },
    pinned:{
        type: Boolean,
        default: false
    },
    date:{
        type: Date,
        default: Date.now
    },
})


const Notes = mongoose.model('notes', NoteSchema);
module.exports = Notes;