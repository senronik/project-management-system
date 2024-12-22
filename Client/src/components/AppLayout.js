import React from 'react'
import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'

const AppLayout = () => {
    return (
        <div className="flex h-screen">
            <div className="w-64 border-r">
                <Sidebar />
            </div>
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>
    )
}

export default AppLayout