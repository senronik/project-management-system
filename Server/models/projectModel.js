import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    stage: {
        type: String,
        enum: ['Requested', 'To do', 'In Progress', 'Done'],
        default: 'Requested'
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tasks: [taskSchema]
}, { 
    timestamps: true 
});

// Index for faster queries
projectSchema.index({ user: 1, title: 1 }, { unique: true });

export default mongoose.model('Project', projectSchema);
