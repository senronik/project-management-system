import Project from '../models/projectModel.js';

// Get all projects for the logged-in user
export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({ user: req.user._id });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single project
export const getProject = async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new project
export const createProject = async (req, res) => {
    try {
        const { title, description } = req.body;

        const project = await Project.create({
            title,
            description,
            user: req.user._id
        });

        res.status(201).json(project);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Project title must be unique for each user' });
        }
        res.status(500).json({ message: error.message });
    }
};

// Update a project
export const updateProject = async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const { title, description } = req.body;
        
        project.title = title || project.title;
        project.description = description || project.description;

        await project.save();
        res.json(project);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Project title must be unique for each user' });
        }
        res.status(500).json({ message: error.message });
    }
};

// Delete a project
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add task to project
export const addTask = async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const { title, description } = req.body;
        
        // Initialize tasks array if it doesn't exist
        if (!project.tasks) {
            project.tasks = [];
        }
        
        project.tasks.push({
            title,
            description,
            stage: 'Requested',
            order: project.tasks.length
        });

        const updatedProject = await project.save();
        res.json(updatedProject);
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update task in project
export const updateTask = async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.projectId,
            user: req.user._id
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const task = project.tasks.id(req.params.taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Update task fields
        if (req.body.title) task.title = req.body.title;
        if (req.body.description) task.description = req.body.description;
        if (req.body.stage) task.stage = req.body.stage;
        if (typeof req.body.order === 'number') task.order = req.body.order;

        // Save the updated project
        await project.save();
        res.json(project);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete task from project
export const deleteTask = async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.projectId,
            user: req.user._id
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        project.tasks = project.tasks.filter(t => t.id !== req.params.taskId);
        
        await project.save();
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
