import express from 'express';
const router = express.Router();

// Import task controller functions here
// const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');

// Define routes
router.get('/', (req, res) => {
    res.json({ message: 'Task routes working' });
});

export default router;
