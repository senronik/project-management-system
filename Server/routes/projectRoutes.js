import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask
} from '../controllers/projectController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Project routes
router.route('/')
    .get(getProjects)
    .post(createProject);

router.route('/:id')
    .get(getProject)
    .put(updateProject)
    .delete(deleteProject);

// Task routes
router.post('/:id/tasks', addTask);
router.route('/:projectId/tasks/:taskId')
    .put(updateTask)
    .delete(deleteTask);

export default router;
