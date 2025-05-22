import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronRight, MoreVertical } from "lucide-react"
import AddClientUserDialog from "./AddClientUserDialog";
import { apiRoutes } from "@/lib/routes";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/AxiosInstance";
import { ClientUser } from "@/types/types";
import { useState } from "react";
import ClientUserActionMenu from "./ClientUserActionMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/hooks/useUser";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientUsers() {
  const { isClient, loading: userLoading } = useUser();
  const {data: clientUsers, refetch, isLoading: dataLoading} = useQuery({
    queryKey: ["clientUsers"],
    queryFn: () => {
      // Use the client-specific endpoint if the user is a client
      const endpoint = isClient() 
        ? apiRoutes.client.team.all
        : apiRoutes.clientUsers.all;
      return axiosInstance.get(endpoint).then((res) => res.data);
    },
    enabled: !userLoading, // Only fetch when user data is loaded
  })

  const isLoading = userLoading || dataLoading;
  const [search, setSearch] = useState("");

  return (
    <div className="">

      {/* Client Users Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
          {userLoading ? <Skeleton className="h-7 w-40" /> : (isClient() ? "Team Members" : "Client User List")}
        </h2>

        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="w-full md:w-1/2">
            {userLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Input 
                onChange={(e) => setSearch(e.target.value)} 
                value={search} 
                placeholder={isClient() ? "Search for Team Member" : "Search for Client User"} 
                className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400" 
                disabled={isLoading}
              />
            )}
          </div>
          <div className="flex gap-2">
            {userLoading ? (
              <Skeleton className="h-10 w-40" />
            ) : (
              <AddClientUserDialog refetch={refetch} isClientView={isClient()} />
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-sm text-gray-500 dark:text-gray-400">
                <th className="text-left py-3 px-4 font-normal">User</th>
                <th className="text-left py-3 px-4 font-normal">Email</th>
                <th className="text-left py-3 px-4 font-normal">
                  {userLoading ? <Skeleton className="h-5 w-20" /> : (isClient() ? "Organization" : "Client")}
                </th>
                <th className="text-left py-3 px-4 font-normal">2FA Status</th>
                <th className="text-left py-3 px-4 font-normal">Account Status</th>
                <th className="text-left py-3 px-4 font-normal"></th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {isLoading ? (
                // Show skeleton rows while loading
                Array(5).fill(0).map((_, index) => (
                  <ClientUserSkeletonRow key={index} />
                ))
              ) : (
                clientUsers && clientUsers
                  ?.filter((user: ClientUser) => user.name.toLowerCase().includes(search.toLowerCase()) && user.role === "client")
                  .map((user: ClientUser) => (
                    <ClientUserRow key={user._id} user={user} refetch={refetch} isClientView={isClient()} />
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ClientUserSkeletonRow() {
  return (
    <tr className="border-t dark:border-gray-700">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
      </td>
      <td className="py-4 px-4">
        <Skeleton className="h-5 w-40" />
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
      </td>
      <td className="py-4 px-4">
        <Skeleton className="h-6 w-28 rounded-md" />
      </td>
      <td className="py-4 px-4">
        <Skeleton className="h-6 w-28 rounded-md" />
      </td>
      <td className="py-4 px-4 text-right">
        <Skeleton className="h-8 w-8 rounded-md ml-auto" />
      </td>
    </tr>
  )
}

function StatCard({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
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

function TabButton({ label, count, active = false }: { label: string, count: string, active?: boolean }) {
  return (
    <button className={`px-4 py-2 relative ${active ? "text-indigo-600 dark:text-indigo-400 font-medium" : "text-gray-500 dark:text-gray-400"}`}>
      {label}
      <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-1.5 py-0.5 rounded-md">{count}</span>
      {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>}
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

function ClientUserRow({user, refetch, isClientView = false}: {user: ClientUser, refetch: () => void, isClientView?: boolean}) {
  return (
    <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
            <Avatar>
              <AvatarImage src={user.profilePicture || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <span className="font-medium dark:text-gray-100">{user.name}</span>
        </div>
      </td>
      <td className="py-4 px-4 text-gray-600 dark:text-gray-300">{user.email}</td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
            <img src={user.clients[0].logoUrl || "/placeholder.svg"} alt="Client logo" className="w-full h-full object-cover" />
          </div>
          <span className="dark:text-gray-100">{user.clients[0].name}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className={`px-3 py-1 rounded-md text-sm w-28 text-center inline-block ${
          user.twoFactorEnabled 
            ? "bg-statusGreen text-statusTextGreen dark:bg-green-900 dark:text-green-200" 
            : "bg-statusSilver text-statusTextSilver dark:bg-gray-700 dark:text-gray-300"
        }`}>
          {user.twoFactorEnabled ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="py-4 px-4">
        <span className={`px-3 py-1 rounded-md text-sm w-28 text-center inline-block ${
          user.isActive 
            ? "bg-statusGreen text-statusTextGreen dark:bg-green-900 dark:text-green-200" 
            : "bg-statusSilver text-statusTextSilver dark:bg-gray-700 dark:text-gray-300"
        }`}>
          {user.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="py-4 px-4 text-right">
        <ClientUserActionMenu user={user} refetch={refetch} isClientView={isClientView} />
      </td>
    </tr>
  )
}
