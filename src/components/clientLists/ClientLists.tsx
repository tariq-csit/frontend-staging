import { ChevronRight, MoreVertical, Shield, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import axiosInstance from "@/lib/AxiosInstance"
import { useQuery } from "@tanstack/react-query"
import { apiRoutes } from "@/lib/routes"
import SendCode from "./SendCode"
import AddClientDialog from "./AddClientDialog"
import { Client } from "@/types/types"
import { useState } from "react"

export default function ClientDashboard() {
  const {data: clients, refetch} = useQuery({
    queryKey: ["clients"],
    queryFn: () => axiosInstance.get(apiRoutes.clients.all).then((res) => res.data)
  })

  const [search, setSearch] = useState("")

  console.log(clients)

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
            <TabButton active={true} label="All Clients" count="12" />
            <TabButton label="Signup Codes Sent" count="24" />
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="w-full md:w-1/2">
            <Input placeholder="Search for Client" className="w-full" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <FilterIcon />
              Filter
            </Button>
            <SendCode />
            <AddClientDialog refetch={refetch}/>
          </div>
        </div>

        {/* Table */}
        {
          clients && clients?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
              <tr className="text-sm text-gray-500">
                <th className="text-left py-3 px-4 font-normal">Client</th>
                <th className="text-left py-3 px-4 font-normal">Point of Contact</th>
                <th className="text-left py-3 px-4 font-normal">Client Users</th>
                <th className="text-left py-3 px-4 font-normal">Active Pentests</th>
                <th className="text-left py-3 px-4 font-normal">Requested Pentests</th>
                <th className="text-left py-3 px-4 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {clients?.filter((client: Client) => client.name.toLowerCase().includes(search.toLowerCase())).map((client: Client) => (
                <ClientRow key={client._id} client={client} />
              ))}
            </tbody>
          </table>
        </div>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No clients found</p>
            </div>
          )
        }
      </div>
    </div>
  )
}

function StatCard({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
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

function TabButton({ label, count, active = false }: { label: string, count: string, active?: boolean }) {
  return (
    <button className={`px-4 py-2 relative ${active ? "text-indigo-600 font-medium" : "text-gray-500"}`}>
      {label}
      <span className="ml-2 bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded-md">{count}</span>
      {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
    </button>
  )
}

function FilterIcon() {
  return (
    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  )
}

function ClientRow({ client }: { client: Client }) {
  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
            <img src={client.logoUrl} alt={client.name} className="w-full h-full object-cover" />
          </div>
          <span className="font-medium">{client.name}</span>
        </div>
      </td>
      <td className="py-4 px-4 text-gray-600">{client.poc_email}</td>
      <td className="py-4 px-4">
        <span className="text-blue-600">{client.users.length}</span>
      </td>
      <td className="py-4 px-4">
        <span className="text-blue-600">{client.pentests.length}</span>
      </td>
      <td className="py-4 px-4">
        <span className="text-blue-600">{client.pentests.length}</span>
      </td>
      <td className="py-4 px-4 text-right">
        <button className="p-1 rounded-full hover:bg-gray-100">
          <MoreVertical className="h-5 w-5 text-gray-400" />
        </button>
      </td>
    </tr>
  )
}

function VWLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#0D28A6" />
      <path d="M12 4L6 16H8L12 8L16 16H18L12 4Z" fill="white" />
    </svg>
  )
}

