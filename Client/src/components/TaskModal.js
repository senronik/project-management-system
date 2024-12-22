import React, { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import BtnPrimary from './BtnPrimary'
import BtnSecondary from './BtnSecondary'
import axios from 'axios'
import toast from 'react-hot-toast'

const TaskModal = ({ isOpen, onClose, taskId }) => {
    const [task, setTask] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isOpen && taskId) {
            fetchTask()
        }
    }, [isOpen, taskId])

    const fetchTask = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`http://localhost:9000/api/projects/tasks/${taskId}`)
            setTask(response.data)
        } catch (error) {
            console.error('Error fetching task:', error)
            toast.error('Failed to load task details')
            onClose()
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog 
                as="div" 
                className="fixed inset-0 z-50 overflow-y-auto"
                onClose={onClose}
            >
                <div className="min-h-screen px-4 text-center">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
                    </Transition.Child>

                    {/* This element is to trick the browser into centering the modal contents. */}
                    <span
                        className="inline-block h-screen align-middle"
                        aria-hidden="true"
                    >
                        &#8203;
                    </span>

                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                            <Dialog.Title
                                as="h3"
                                className="text-lg sm:text-xl font-medium leading-6 text-gray-900 mb-4"
                            >
                                {loading ? 'Loading...' : task?.title || 'Task Details'}
                            </Dialog.Title>
                            
                            <div className="mt-2">
                                {loading ? (
                                    <div className="animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ) : task ? (
                                    <>
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                                            <p className="text-gray-600 text-sm">{task.description}</p>
                                        </div>
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-1">Status</h4>
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                                task.stage === 'Done' ? 'bg-green-100 text-green-800' :
                                                task.stage === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                task.stage === 'To do' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {task.stage}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-red-500 text-sm">Failed to load task details</p>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                <BtnSecondary onClick={onClose} className="w-full sm:w-auto">
                                    Close
                                </BtnSecondary>
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    )
}

export default TaskModal