"use client"

import type React from "react"

import { ChevronRight, Shield, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import axiosInstance from "@/lib/AxiosInstance"
import { useQuery } from "@tanstack/react-query"
import { apiRoutes } from "@/lib/routes"
import SendCode from "./SendCode"
import AddClientDialog from "./AddClientDialog"
import type { Client } from "@/types/types"
import { useEffect, useState } from "react"
import ClientActionMenu from "./ClientActionMenu"

export default function ClientDashboard() {
  const { data: clients, refetch } = useQuery({
    queryKey: ["clients"],
    queryFn: () => axiosInstance.get(apiRoutes.clients.all).then((res) => res.data),
  })

  const { data: signupCodesSent } = useQuery({
    queryKey: ["signupCodesSent"],
    queryFn: () => axiosInstance.get(apiRoutes.clients.all).then((res) => res.data),
  })

  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("All Clients")
  const [filteredClients, setFilteredClients] = useState<Client[]>([])

  useEffect(() => {
    if (clients && clients.length > 0) {
      setActiveTab("All Clients")
      setFilteredClients(clients?.filter((client: Client) => {
        const matchesSearch = client.name.toLowerCase().includes(search.toLowerCase())
        if (activeTab === "All Clients") {
          return matchesSearch
        } else if (activeTab === "Signup Codes Sent") {
          // Add logic here to filter clients with signup codes sent
          // For now, showing all clients in this tab
          return matchesSearch
        }
        return false
      }))
    } 
  }, [clients])

  return (
    <div className="">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Users className="h-6 w-6 text-indigo-600" />} value="200+" label="Clients" />
        <StatCard icon={<Shield className="h-6 w-6 text-indigo-600" />} value="30" label="Requested Pentests" />
        <StatCard icon={<Shield className="h-6 w-6 text-indigo-600" />} value="90+" label="Ongoing Pentests" />
        <StatCard icon={<Shield className="h-6 w-6 text-indigo-600" />} value="12+" label="Scheduled Pentests" />
      </div>

      {/* Client List Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Client List</h2>

        {/* Tabs */}
        <div className="border-b mb-4">
          <div className="flex">
            <TabButton 
              active={activeTab === "All Clients"} 
              label="All Clients" 
              count={clients && clients.length && clients?.length.toString() || "0"}
              onClick={() => setActiveTab("All Clients")}
            />
            <TabButton 
              active={activeTab === "Signup Codes Sent"} 
              label="Signup Codes Sent" 
              count={signupCodesSent?.length.toString() || "0"}
              onClick={() => setActiveTab("Signup Codes Sent")}
            />
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="w-full md:w-1/2">
            <Input
              placeholder="Search for Client"
              className="w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <SendCode />
            <AddClientDialog refetch={refetch} />
          </div>
        </div>

        {/* Table */}
        {filteredClients && filteredClients?.length > 0 ? (
          <div className="overflow-x-auto">
            {/* Grid Header */}
            <div className="grid grid-cols-6 gap-4 text-sm text-gray-500 border-b py-3 px-4 font-normal">
              <div>Client</div>
              <div>Point of Contact</div>
              <div>Client Users</div>
              <div>Active Pentests</div>
              <div>Requested Pentests</div>
              <div></div>
            </div>

            {/* Grid Body */}
            <div className="divide-y">
              {filteredClients.map((client: Client) => (
                <ClientRow key={client._id} client={client} refetch={refetch} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">No clients found</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
        <div>
          <div className="text-xl font-bold">{value}</div>
          <div className="text-gray-500">{label}</div>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </div>
  )
}

function TabButton({ 
  label, 
  count, 
  active = false, 
  onClick 
}: { 
  label: string; 
  count: string; 
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 relative ${active ? "text-indigo-600 font-medium" : "text-gray-500"}`}
    >
      {label}
      <span className="ml-2 bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded-md">{count}</span>
      {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
    </button>
  )
}

function ClientRow({ client, refetch }: { client: Client; refetch: () => void }) {
  return (
    <div className="grid grid-cols-6 gap-4 py-4 px-4 hover:bg-gray-50">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
            <img src={client.logoUrl || "/placeholder.svg"} alt={client.name} className="w-full h-full object-cover" />
          </div>
          <span className="font-medium">{client.name}</span>
        </div>
      </div>
      <div className="text-gray-600">{client.poc_email}</div>
      <div>
        <span className="text-blue-600">{client.users.length}</span>
      </div>
      <div>
        <span className="text-blue-600">{client.pentests.length}</span>
      </div>
      <div>
        <span className="text-blue-600">{client.pentests.length}</span>
      </div>
      <div className="text-right">
        <ClientActionMenu client={client} refetch={refetch} />
      </div>
    </div>
  )
}
