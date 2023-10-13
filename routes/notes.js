const express = require('express')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note.js')
const Bin = require('../models/Bin.js')
const fetchuser = require('../middleware/fetchuser')


// ROUTE 1: Add the new Notes using: POST "/api/notes/addnote". Login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid Title').isLength({ min: 3 }),
    body('description', "Enter a valid Description").isLength({ min: 10 })
], async (req, res) => {
    let success = false;

    const { title, description, tag, pinned } = req.body;
    // If the there is errors in input 'title' or 'description', return Bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    // Creating a new Mongoose Note object and saving it in DB 
    try {
        const note = new Note({
            title, description, tag, pinned, user: req.user.id
        })
        const savedNote = await note.save();
        success = true;
        res.json({ success, savedNote })

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success, message: "Internal Server Error" })
    }


})

// ROUTE 2: Get all the Notes using: GET "/api/notes/fetchallnotes". Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id })
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }

})

// ROUTE 3: Update an existing Note using: PUT "/api/notes/updatenote". Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    let success = false;
    try {
        const { title, description, tag, pinned } = req.body;
        const newNote = { title, description, tag, pinned };

        // Find the note to be updated and check the user is correct
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).json({ success, message: "Not Found" }) }
        if (note.user.toJSON() !== req.user.id) {
            return res.status(401).json({ success, message: "Not Allowed" });
        }
        // Find the note to be updated and update it
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote });
        success = true;
        res.json({ success, note });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success, message: "Internal Server Error" })
    }

})

// ROUTE 4: Delete an existing Note and move to Bin DB using: DELETE "/api/notes/deletenote". Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    let success = false;
    try {
        // Find the note to be deleted and check the user is authorised to delete
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).json({ success, message: "Not Found" }) }
        if (note.user.toJSON() !== req.user.id) {
            return res.status(401).json({ success, message: "Not Allowed" });
        }
        // Find the note to be deleted and delete it and Store it in Bin database
        note = await Note.findByIdAndDelete(req.params.id);
        const deletedNote = new Bin({ user: note.user, title: note.title, description: note.description, tag: note.tag, pinned: note.pinned, date: note.date });
        note = await deletedNote.save();
        success = true;
        res.json({ success, note: deletedNote })

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success, message: "Internal Server Error" })
    }
})

// ROUTE5: Permanent delete a Note using: DELETE "/api/notes/permanentdeletenote". Login required
router.delete('/permanentdeletenote/:id', fetchuser, async (req, res) => {
    let success = false;
    try {
        // Find the note to be permanently deleted and check the user is authorised to delete
        let note = await Bin.findById(req.params.id);
        if (!note) { return res.status(404).json({ success, message: "Not Found" }) }
        if (note.user.toJSON() !== req.user.id) {
            return res.status(401).json({ success, message: "Not Allowed" });
        }
        // Find the note to be deleted and delete it
        note = await Bin.findByIdAndDelete(req.params.id);
        success = true;
        res.json({ success, note })

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success, message: "Internal Server Error" })
    }

})

// ROUTE5: Restore deleted a Note using: DELETE "/api/notes/restorenote". Login required
router.post('/restorenote/:id',fetchuser, async(req,res) => {
    let success = false;
    try{
    // Find the note to be permanently deleted and check the user is authorised to delete
    let note = await Bin.findById(req.params.id);
    if (!note) { return res.status(404).json({ success, message: "Not Found" }) }
    if (note.user.toJSON() !== req.user.id) {
        return res.status(401).json({ success, message: "Not Allowed" });
    }
    // Find the note to be deleted and delete it and Store it in Note database
    note = await Bin.findByIdAndDelete(req.params.id);
    const deletedNote = new Note({ user: note.user, title: note.title, description: note.description, tag: note.tag, pinned: note.pinned, date: note.date });
    note = await deletedNote.save();
        success = true;
        res.json({ success, note: deletedNote })

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success, message: "Internal Server Error" })
    }
})






module.exports = router;