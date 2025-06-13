import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HostDashboardProps {
  className?: string
}

const HostDashboard: React.FC<HostDashboardProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'availability' | 'requests'>('overview')

  const stats = {
    availableSlots: 12,
    pendingRequests: 2,
    baseRate: 50,
    totalSlots: 20
  }

  const timeSlots = [
    { id: 1, day: 'Monday', time: '09:00 - 10:00', available: true },
    { id: 2, day: 'Monday', time: '14:00 - 15:00', available: true },
    { id: 3, day: 'Wednesday', time: '10:00 - 11:00', available: false },
    { id: 4, day: 'Friday', time: '15:00 - 16:00', available: true },
  ]

  const requests = [
    {
      id: 1,
      requester: 'alice.base.eth',
      requestedSlot: 'Monday 09:00 - 10:00',
      message: 'Hi! I would like to schedule a consultation about DeFi strategies.',
      timestamp: '6/11/2024 at 10:30:00 AM',
      status: 'pending'
    },
    {
      id: 2,
      requester: 'bob.base.eth',
      requestedSlot: 'Monday 14:00 - 15:00',
      message: 'Looking for advice on smart contract development.',
      timestamp: '6/11/2024 at 11:15:00 AM',
      status: 'pending'
    }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 text-green-600">📅</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Slots</p>
              <p className="text-2xl font-bold text-gray-900">{stats.availableSlots}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="w-6 h-6 text-yellow-600">⏳</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 text-blue-600">💰</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Base Rate</p>
              <p className="text-2xl font-bold text-gray-900">${stats.baseRate}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="w-6 h-6 text-purple-600">📊</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Slots</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSlots}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">New request from alice.base.eth</span>
            <span className="text-xs text-gray-400">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Meeting completed with charlie.base.eth</span>
            <span className="text-xs text-gray-400">1 day ago</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Payment received: 75 USDC</span>
            <span className="text-xs text-gray-400">2 days ago</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPricing = () => (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Pricing Configuration</h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">30-minute session</label>
            <div className="flex">
              <input
                type="number"
                defaultValue="50"
                className="flex-1 rounded-l-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Price"
              />
              <select className="rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option>USDC</option>
                <option>ETH</option>
                <option>USDT</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">60-minute session</label>
            <div className="flex">
              <input
                type="number"
                defaultValue="90"
                className="flex-1 rounded-l-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Price"
              />
              <select className="rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option>USDC</option>
                <option>ETH</option>
                <option>USDT</option>
              </select>
            </div>
          </div>
        </div>
        <Button className="w-full md:w-auto">Save Pricing</Button>
      </div>
    </div>
  )

  const renderAvailability = () => (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Time Slots</h3>
        <Button size="sm">Add New Slot</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {timeSlots.map((slot) => (
          <div
            key={slot.id}
            className={cn(
              "rounded-lg border-2 p-4 transition-colors",
              slot.available
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{slot.day}</span>
              <span
                className={cn(
                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                  slot.available
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                )}
              >
                {slot.available ? 'Available' : 'Booked'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{slot.time}</p>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="flex-1">
                {slot.available ? 'Disable' : 'Enable'}
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderRequests = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Meeting Requests</h3>
      {requests.map((request) => (
        <div key={request.id} className="bg-white rounded-lg border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-medium text-gray-900">{request.requester}</h4>
              <p className="text-sm text-gray-500">{request.timestamp}</p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 uppercase">
              {request.status}
            </span>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">Requested Slot:</p>
            <p className="text-sm text-gray-900">{request.requestedSlot}</p>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">Message:</p>
            <p className="text-sm text-gray-600">{request.message}</p>
          </div>
          <div className="flex space-x-3">
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              Approve
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  )

  const tabs = [
    { id: 'overview', label: 'Overview', badge: null },
    { id: 'pricing', label: 'Pricing', badge: null },
    { id: 'availability', label: 'Availability', badge: null },
    { id: 'requests', label: 'Requests', badge: stats.pendingRequests },
  ] as const

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Host Dashboard</h2>
        <p className="text-gray-600 mt-2">Manage your availability, pricing, and meeting requests</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
              {tab.badge && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'pricing' && renderPricing()}
        {activeTab === 'availability' && renderAvailability()}
        {activeTab === 'requests' && renderRequests()}
      </div>
    </div>
  )
}

export default HostDashboard

