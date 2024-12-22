import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const ProjectContext = createContext({});

export const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        return () => {
            delete axios.defaults.headers.common['Authorization'];
        };
    }, []);

    useEffect(() => {
        if (user) {
            fetchProjects();
        } else {
            setProjects([]);
            setLoading(false);
        }
    }, [user]);

    const fetchProjects = async () => {
        try {
            const { data } = await axios.get('http://localhost:9000/api/projects');
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch projects');
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const createProject = async (projectData) => {
        try {
            const { data } = await axios.post('http://localhost:9000/api/projects', projectData);
            setProjects([...projects, data]);
            toast.success('Project created successfully');
            return data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create project');
            throw error;
        }
    };

    const updateProject = async (id, projectData) => {
        try {
            const { data } = await axios.put(`http://localhost:9000/api/projects/${id}`, projectData);
            setProjects(projects.map(p => p._id === id ? data : p));
            toast.success('Project updated successfully');
            return data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update project');
            throw error;
        }
    };

    const deleteProject = async (id) => {
        try {
            await axios.delete(`http://localhost:9000/api/projects/${id}`);
            setProjects(projects.filter(p => p._id !== id));
            toast.success('Project deleted successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete project');
            throw error;
        }
    };

    const addTask = async (projectId, title, description) => {
        try {
            const { data } = await axios.post(`http://localhost:9000/api/projects/${projectId}/tasks`, {
                title,
                description
            });
            await fetchProjects(); // Refresh projects after adding task
            return data;
        } catch (error) {
            console.error('Error adding task:', error);
            throw error;
        }
    };

    const updateTask = async (projectId, taskId, taskData) => {
        try {
            const { data } = await axios.put(`http://localhost:9000/api/projects/${projectId}/tasks/${taskId}`, taskData);
            setProjects(projects.map(p => p._id === projectId ? data : p));
            return data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update task');
            throw error;
        }
    };

    const deleteTask = async (projectId, taskId) => {
        try {
            const { data } = await axios.delete(`http://localhost:9000/api/projects/${projectId}/tasks/${taskId}`);
            setProjects(projects.map(p => p._id === projectId ? data : p));
            return data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete task');
            throw error;
        }
    };

    return (
        <ProjectContext.Provider value={{
            projects,
            loading,
            createProject,
            updateProject,
            deleteProject,
            addTask,
            updateTask,
            deleteTask,
            fetchProjects
        }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProjects must be used within a ProjectProvider');
    }
    return context;
};
