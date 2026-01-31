import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import { PlusCircle, Clock, TrendingUp } from 'lucide-react'

const Dashboard = ({ setIsAuthenticated }) => {
  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-neutral-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Welcome Back!</h1>
              <p className="text-gray-600 mt-1">Continue your learning journey</p>
            </div>
            <button className="btn btn-primary flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              Log New Session
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-8">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-primary-300 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold text-gray-800">42.5</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-primary-300 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Skills</p>
                  <p className="text-2xl font-bold text-gray-800">5</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-primary-300 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Consistency</p>
                  <p className="text-2xl font-bold text-gray-800">87%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Sessions</h2>
            <p className="text-gray-600">Your learning sessions will appear here. Click "Log New Session" to get started!</p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
