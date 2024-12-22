import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { v4 as uuid } from "uuid";
import AddTaskModal from "./AddTaskModal";
import BtnPrimary from './BtnPrimary'
import DropdownMenu from "./DropdownMenu";
import { useParams, useNavigate } from "react-router";
import ProjectDropdown from "./ProjectDropdown"
import axios from "axios";
import toast from "react-hot-toast";
import TaskModal from "./TaskModal";
import { useProjects } from "../context/ProjectContext";

function Task() {
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [columns, setColumns] = useState({
        [uuid()]: {
            name: "Requested",
            items: []
        },
        [uuid()]: {
            name: "To do",
            items: []
        },
        [uuid()]: {
            name: "In Progress",
            items: []
        },
        [uuid()]: {
            name: "Done",
            items: []
        }
    });
    const [isRenderChange, setRenderChange] = useState(false);
    const [title, setTitle] = useState('');
    const { projectId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        const fetchProject = async () => {
            try {
                const res = await axios.get(`http://localhost:9000/api/projects/${projectId}`);
                if (!res.data) {
                    toast.error('Project not found');
                    navigate('/');
                    return;
                }
                setTitle(res.data.title);
                const tasks = res.data.tasks || [];
                
                // Create new column objects with new UUIDs
                const newColumns = {
                    [uuid()]: {
                        name: "Requested",
                        items: tasks.filter(task => task.stage === "Requested").sort((a, b) => a.order - b.order)
                    },
                    [uuid()]: {
                        name: "To do",
                        items: tasks.filter(task => task.stage === "To do").sort((a, b) => a.order - b.order)
                    },
                    [uuid()]: {
                        name: "In Progress",
                        items: tasks.filter(task => task.stage === "In Progress").sort((a, b) => a.order - b.order)
                    },
                    [uuid()]: {
                        name: "Done",
                        items: tasks.filter(task => task.stage === "Done").sort((a, b) => a.order - b.order)
                    }
                };
                setColumns(newColumns);
                setRenderChange(false);
            } catch (error) {
                console.error('Error fetching project:', error);
                toast.error('Failed to load project');
                if (error.response?.status === 404) {
                    navigate('/');
                }
            }
        };

        if (!isAddTaskModalOpen || isRenderChange) {
            fetchProject();
        }
    }, [projectId, isAddTaskModalOpen, isRenderChange, navigate]);

    const updateTaskStatus = async (taskId, newStage, order) => {
        try {
            await axios.put(`http://localhost:9000/api/projects/${projectId}/tasks/${taskId}`, {
                stage: newStage,
                order
            });
            toast.success('Task status updated');
        } catch (error) {
            console.error('Error updating task status:', error);
            toast.error('Failed to update task status');
        }
    };

    const onDragEnd = (result, columns, setColumns) => {
        if (!result.destination) return;
        const { source, destination } = result;

        if (source.droppableId !== destination.droppableId) {
            const sourceColumn = columns[source.droppableId];
            const destColumn = columns[destination.droppableId];
            const sourceItems = [...sourceColumn.items];
            const destItems = [...destColumn.items];
            const [removed] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, removed);

            // Update task status in backend
            updateTaskStatus(removed._id, destColumn.name, destination.index);

            setColumns({
                ...columns,
                [source.droppableId]: {
                    ...sourceColumn,
                    items: sourceItems
                },
                [destination.droppableId]: {
                    ...destColumn,
                    items: destItems
                }
            });
        } else {
            const column = columns[source.droppableId];
            const copiedItems = [...column.items];
            const [removed] = copiedItems.splice(source.index, 1);
            copiedItems.splice(destination.index, 0, removed);

            // Update task order in same column
            updateTaskStatus(removed._id, column.name, destination.index);

            setColumns({
                ...columns,
                [source.droppableId]: {
                    ...column,
                    items: copiedItems
                }
            });
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-10 flex flex-col h-full">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <h2 className="text-xl sm:text-2xl font-medium tracking-wide">{title}</h2>
                    <ProjectDropdown id={projectId} navigate={navigate} />
                </div>
                <BtnPrimary onClick={() => setIsAddTaskModalOpen(true)}>Add Task</BtnPrimary>
            </div>

            {/* Task Board */}
            <div className="overflow-x-auto pb-4">
                <div className="min-w-[1000px] flex justify-between gap-4">
                    <DragDropContext onDragEnd={result => onDragEnd(result, columns, setColumns)}>
                        {Object.entries(columns).map(([columnId, column]) => (
                            <div
                                key={columnId}
                                className="flex-1 min-w-[250px]"
                            >
                                <h2 className="font-medium mb-4 text-gray-700">{column.name}</h2>
                                <Droppable droppableId={columnId}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={`p-2 rounded-lg min-h-[500px] ${
                                                snapshot.isDraggingOver ? "bg-gray-100" : "bg-gray-50"
                                            }`}
                                        >
                                            {column.items.map((item, index) => (
                                                <Draggable
                                                    key={item._id}
                                                    draggableId={item._id}
                                                    index={index}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer ${
                                                                snapshot.isDragging ? "shadow-lg" : ""
                                                            }`}
                                                            onClick={() => {
                                                                setSelectedTaskId(item._id);
                                                                setIsTaskModalOpen(true);
                                                            }}
                                                        >
                                                            <h3 className="font-medium text-gray-800 mb-2">{item.title}</h3>
                                                            <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </DragDropContext>
                </div>
            </div>

            {/* Modals */}
            <AddTaskModal 
                isOpen={isAddTaskModalOpen} 
                onClose={() => setIsAddTaskModalOpen(false)} 
                onRenderChange={setRenderChange} 
            />
            <TaskModal 
                isOpen={isTaskModalOpen} 
                onClose={() => setIsTaskModalOpen(false)} 
                taskId={selectedTaskId} 
            />
        </div>
    );
}

export default Task;