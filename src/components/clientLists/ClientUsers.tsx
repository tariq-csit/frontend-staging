import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronRight, MoreVertical } from "lucide-react"
import AddClientUserDialog from "./AddClientUserDialog";

export default function ClientUsers() {
  return (
    <div className="">

      {/* Client Users Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Client User List</h2>

        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="w-full md:w-1/2">
            <Input placeholder="Search for Client User" className="w-full" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <FilterIcon />
              Filter
            </Button>
            <AddClientUserDialog />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-sm text-gray-500">
                <th className="text-left py-3 px-4 font-normal">User</th>
                <th className="text-left py-3 px-4 font-normal">Point of Contact</th>
                <th className="text-left py-3 px-4 font-normal">Client</th>
                <th className="text-left py-3 px-4 font-normal">2FA Status</th>
                <th className="text-left py-3 px-4 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((item) => (
                <ClientUserRow key={item} />
              ))}
            </tbody>
          </table>
        </div>
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

function SearchIcon() {
  return (
    <svg
      className="h-5 w-5 text-gray-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
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

function ClientUserRow() {
  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
            <img src="https://ui-avatars.com/api/?name=Hammad+Mahmood" alt="User avatar" className="w-full h-full object-cover" />
          </div>
          <span className="font-medium">Hammad Mahmood</span>
        </div>
      </td>
      <td className="py-4 px-4 text-gray-600">hammad65@gmail.com</td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
            <VWLogo />
          </div>
          <span>Wols Wagon</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className={`px-3 py-1 rounded-full text-sm ${
          Math.random() > 0.5 
            ? "bg-[#DCFCE7] text-[#166534]" 
            : "bg-[#F3F4F6] text-[#6B7280]"
        }`}>
          {Math.random() > 0.5 ? "Active" : "In-Active"}
        </span>
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