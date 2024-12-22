import React, { Fragment, memo, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import BtnPrimary from './BtnPrimary'
import BtnSecondary from './BtnSecondary'
import axios from "axios"
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useProjects } from '../context/ProjectContext'

const AddProjectModal = ({ isModalOpen, closeModal, edit = false, id = null }) => {
    const [title, setTitle] = useState('')
    const [desc, setDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { createProject, updateProject } = useProjects();

    useEffect(() => {
        if (edit && isModalOpen && id) {
            setLoading(true);
            axios.get(`http://localhost:9000/api/projects/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then((res) => {
                    setTitle(res.data.title);
                    setDesc(res.data.description);
                })
                .catch((error) => {
                    toast.error(error.response?.data?.message || 'Failed to fetch project');
                })
                .finally(() => setLoading(false));
        }
    }, [isModalOpen, id, edit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            if (!edit) {
                await createProject({ title, description: desc });
                toast.success('Project created successfully');
            } else {
                await updateProject(id, { title, description: desc });
                toast.success('Project updated successfully');
            }
            closeModal();
            setTitle('');
            setDesc('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition appear show={isModalOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={closeModal}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900"
                                >
                                    {edit ? 'Edit Project' : 'Create New Project'}
                                </Dialog.Title>
                                <form onSubmit={handleSubmit}>
                                    <div className="mt-2">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                value={desc}
                                                onChange={(e) => setDesc(e.target.value)}
                                                rows={3}
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end space-x-4">
                                        <BtnSecondary onClick={closeModal} disabled={loading}>
                                            Cancel
                                        </BtnSecondary>
                                        <BtnPrimary type="submit" disabled={loading}>
                                            {loading ? 'Loading...' : edit ? 'Update' : 'Create'}
                                        </BtnPrimary>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default memo(AddProjectModal);