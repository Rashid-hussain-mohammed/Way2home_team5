import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchListingsForReview } from '../../api'
import { FaSearch } from "react-icons/fa"
import "./dashboard.css"

interface MediaFile {
    id: string
    creationDate: string
    type: number
}

interface Listing {
    id: string
    name: string
    location: string
    type: string
    size: number
    coldRent: number
    warmRent: number
    additionalCosts: number
    deposit: number
    availabilityFrom: string
    availabilityTo: string
    description: string
    status: string
    reviewDate: Date
    mediaFiles?: MediaFile[]
    landlord: Landlord
}

interface Landlord {
    id: string
    firstName: string
    lastName: string
    role: string
}

const ModeratorDashboard: React.FC = () => {
    const navigate = useNavigate()
    const [listings, setListings] = useState<Listing[]>([])
    const [statusFilter, setStatusFilter] = useState<string>("")
    const [query, setQuery] = useState<string>("")

    const fetchAllListings = async () => {
        try {
            const allListings = await fetchListingsForReview(query, statusFilter)
            if (Array.isArray(allListings.data)) {
                setListings(allListings.data)
            } else {
                console.error("API response is not an array:", allListings)
            }
        } catch (error) {
            console.error("Error fetching all listings:", error)
        }
    }

    const handleSearch = () => {
        fetchAllListings()
    }

    const redirectToDetails = (item: Listing) => {
        navigate('/approve-listing/' + item.id)
    }

    useEffect(() => {
        fetchAllListings()
    }, [statusFilter])

    return (
        <div className="flex flex-col bg-gray-100">
            <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
                <h2 className="mb-4 text-2xl font-bold">What are you looking for?</h2>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <input
                            id="search-query"
                            type="text"
                            placeholder="Type your search..."
                            className="flex-grow px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button
                            className="px-3 py-3 text-white bg-black rounded-md hover:bg-yellow-600"
                            onClick={handleSearch}
                        >
                            <FaSearch />
                        </button>
                    </div>

                    <div className="flex items-center">
                        <label htmlFor="statusFilter" className="mr-2 text-gray-700 font-medium">
                            Filter by Status:
                        </label>
                        <select
                            id="statusFilter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="overflow-hidden bg-white shadow-sm border border-gray-200 rounded-lg">
                    {listings.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No listings found matching your search criteria.
                        </div>
                    ) : (
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-500">Listing Title</th>
                                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-500">Submitted By</th>
                                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-500">Status</th>
                                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-500">Review Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listings.map((item) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => redirectToDetails(item)}
                                        className="dashboard-table-item border-t border-gray-100"
                                    >
                                        <td className="py-3 px-6 text-sm text-black font-bold">{item.name}</td>
                                        <td className="py-3 px-6 text-sm text-gray-800">
                                            {item.landlord.firstName} {item.landlord.lastName}
                                        </td>
                                        <td className="py-3 px-6 text-sm text-black">{item.status}</td>
                                        <td className="py-3 px-6 text-sm text-black">
                                            {item.reviewDate ? new Date(item.reviewDate).toLocaleDateString() : "Not Reviewed"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ModeratorDashboard
