"use client"

import type React from "react"

import { ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import axiosInstance from "@/lib/AxiosInstance"
import { useQuery } from "@tanstack/react-query"
import { apiRoutes } from "@/lib/routes"
import SendCode from "./SendCode"
import AddClientDialog from "./AddClientDialog"
import type { Client, SignupCode } from "@/types/types"
import { useEffect, useState } from "react"
import ClientActionMenu from "./ClientActionMenu"

function SignupCodesList() {
  const [search, setSearch] = useState("")
  
  const { data: signupCodes, isLoading, error, refetch } = useQuery({
    queryKey: ["signupCodes"],
    queryFn: async () => {
      const response = await axiosInstance.get(apiRoutes.signupCodes)
      return response.data as SignupCode[]
    }
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600 dark:text-red-400">
        Error loading signup codes
      </div>
    )
  }

  const filteredCodes = signupCodes?.filter((code: any) => 
    code.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      {/* Search */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div className="w-full md:w-1/2">
          <Input
            placeholder="Search by email..."
            className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <SendCode refetch={refetch} />
        </div>
      </div>

      {/* Table */}
      {filteredCodes && filteredCodes.length > 0 ? (
        <div className="overflow-x-auto">
          {/* Grid Header */}
          <div className="grid grid-cols-4 gap-4 text-sm text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 py-3 px-4 font-normal">
            <div>Email</div>
            <div>Created At</div>
            <div className="pl-4">Status</div>
            <div></div>
          </div>

          {/* Grid Body */}
          <div className="divide-y dark:divide-gray-700">
            {filteredCodes.map((code: any) => (
              <div key={code._id} className="grid grid-cols-4 gap-4 py-4 px-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="font-medium dark:text-gray-100">{code.email}</div>
                <div className="text-gray-600 dark:text-gray-300">
                  {new Date(code.createdAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    code.used ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {code.used ? 'Used' : 'Not Used'}
                  </span>
                </div>
                <div className="text-right">
                  {/* Add actions menu if needed */}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-500 dark:text-gray-400">No signup codes found</p>
        </div>
      )}
    </>
  )
}

export default function ClientDashboard() {
  const { data: clients, refetch } = useQuery({
    queryKey: ["clients"],
    queryFn: () => axiosInstance.get(apiRoutes.clients.all).then((res) => res.data),
  })

  const { data: signupCodesSent } = useQuery({
    queryKey: ["signupCodes"],
    queryFn: () => axiosInstance.get(apiRoutes.signupCodes).then((res) => res.data),
  })

  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("All Clients")
  const [filteredClients, setFilteredClients] = useState<Client[]>([])

  useEffect(() => {
    if (clients && clients.length > 0 && activeTab === "All Clients") {
      setFilteredClients(clients?.filter((client: Client) => {
        return client.name.toLowerCase().includes(search.toLowerCase())
      }))
    }
  }, [clients, search, activeTab])

  return (
    <div className="">

      {/* Client List Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Client List</h2>

        {/* Tabs */}
        <div className="border-b dark:border-gray-700 mb-4">
          <div className="flex">
            <TabButton 
              active={activeTab === "All Clients"} 
              label="All Clients" 
              count={clients?.length?.toString() || "0"}
              onClick={() => setActiveTab("All Clients")}
            />
            <TabButton 
              active={activeTab === "Signup Codes Sent"} 
              label="Signup Codes Sent" 
              count={signupCodesSent?.length?.toString() || "0"}
              onClick={() => setActiveTab("Signup Codes Sent")}
            />
          </div>
        </div>

        {activeTab === "All Clients" ? (
          <>
            {/* Search and Actions */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
              <div className="w-full md:w-1/2">
                <Input
                  placeholder="Search for Client"
                  className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <SendCode refetch={refetch} />
                <AddClientDialog refetch={refetch} />
              </div>
            </div>

            {/* Table */}
            {filteredClients && filteredClients?.length > 0 ? (
              <div className="overflow-x-auto">
                {/* Grid Header */}
                <div className="grid grid-cols-7 gap-4 text-sm text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 py-3 px-4 font-normal">
                  <div>Client</div>
                  <div className="col-span-2">Point of Contact</div>
                  <div>Client Users</div>
                  <div>Active Pentests</div>
                  <div>Requested Pentests</div>
                  <div></div>
                </div>

                {/* Grid Body */}
                <div className="divide-y dark:divide-gray-700">
                  {filteredClients.map((client: Client) => (
                    <ClientRow key={client._id} client={client} refetch={refetch} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500 dark:text-gray-400">No clients found</p>
              </div>
            )}
          </>
        ) : (
          <SignupCodesList />
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">{icon}</div>
        <div>
          <div className="text-xl font-bold dark:text-gray-100">{value}</div>
          <div className="text-gray-500 dark:text-gray-400">{label}</div>
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
      className={`px-4 py-2 relative ${active ? "text-indigo-600 dark:text-indigo-400 font-medium" : "text-gray-500 dark:text-gray-400"}`}
    >
      {label}
      <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-1.5 py-0.5 rounded-md">{count}</span>
      {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>}
    </button>
  )
}

function ClientRow({ client, refetch }: { client: Client; refetch: () => void }) {
  return (
    <div className="grid grid-cols-7 gap-4 py-4 px-4 hover:bg-gray-50 dark:hover:bg-gray-700">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
            <img src={client.logoUrl || "/placeholder.svg"} alt={client.name} className="w-full h-full object-cover" />
          </div>
          <span className="font-medium dark:text-gray-100">{client.name}</span>
        </div>
      </div>
      <div className="text-gray-600 dark:text-gray-300 col-span-2">{client.poc_email}</div>
      <div>
        <span className="text-blue-600 dark:text-blue-400">{client.users.length}</span>
      </div>
      <div>
        <span className="text-blue-600 dark:text-blue-400">{client.pentests.length}</span>
      </div>
      <div>
        <span className="text-blue-600 dark:text-blue-400">{client.RequestedPentestsNo}</span>
      </div>
      <div className="text-right">
        <ClientActionMenu client={client} refetch={refetch} />
      </div>
    </div>
  )
}
