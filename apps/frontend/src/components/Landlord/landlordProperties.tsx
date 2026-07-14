import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HouseCard from "../card";
import { fetchLandlordProperties, deleteListing } from "../../api";
import axios from "axios";

interface MediaFile {
  id: string;
  creationDate: string;
  type: number;
}

interface Landlord {
  id: string;
  firstName: string;
  lastName: string;
}

interface Listing {
  id: string;
  name: string;
  location: string;
  type: string;
  size: number;
  coldRent: number;
  warmRent: number;
  additionalCosts: number;
  deposit: number;
  availabilityFrom: string;
  availabilityTo: string;
  description: string;
  mediaFiles?: MediaFile[];
  landlord: Landlord;
  status: string;
}

const LandlordProperties: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [landlordName, setLandlordName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchProperties = async () => {
    try {
      setIsLoading(true);

      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");

      console.log("Fetching Properties - User ID:", userId);
      console.log("Fetching Properties - Auth Token:", !!authToken);

      const propertiesResponse = await fetchLandlordProperties();

      console.log("Fetched Properties Response:", propertiesResponse);

      // Handle different possible response formats
      const propertyList = Array.isArray(propertiesResponse.data)
        ? propertiesResponse.data
        : [];

      if (propertyList.length > 0 && propertyList[0].landlord) {
        // Extract landlord name
        const { firstName, lastName } = propertyList[0].landlord;
        setLandlordName(`${firstName} ${lastName}`);
      }

      setListings(propertyList);
      setError(null);
    } catch (error) {
      // Error handling remains the same as in the previous version
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("Error Response:", error.response.data);
          console.error("Status Code:", error.response.status);

          if (error.response.status === 204) {
            setError("No properties found.");
          } else {
            setError(
              error.response.data.message || "Failed to fetch properties"
            );
          }
        } else if (error.request) {
          console.error("No response received:", error.request);
          setError("No response from server. Please check your connection.");
        } else {
          console.error("Error setting up request:", error.message);
          setError("An error occurred while fetching properties");
        }
      } else {
        console.error("Unexpected error:", error);
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteListing(id);

      alert("Property deleted successfully!");
      fetchProperties();
    } catch (error) {
      console.error("Error deleting property:", error);
      setError("Failed to delete property. Please try again.");
    }
  };

  const handleEdit = (id: string) => {
    // Navigate to edit page
    navigate(`/edit-listing/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div>
            {landlordName ? (
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xl font-semibold text-gray-700">
                    {landlordName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {landlordName}'s Properties
                  </h2>
                  <p className="text-sm text-gray-500">
                    Manage your rental listings
                  </p>
                </div>
              </div>
            ) : (
              <h2 className="text-2xl font-bold text-gray-800">My Listings</h2>
            )}
          </div>
          <Link
            to="/add-listing"
            className="inline-flex items-center bg-black text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Listing
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {listings.length > 0 ? (
            listings.map((listing) => (
              <div key={listing.id}>
                <Link to={`/listing/${listing.id}`}>
                  <HouseCard
                    {...listing}
                    showStatus={true}
                    onDelete={handleDelete}
                    //showDeleteButton={true}
                    isFavorite={false} // Default value
                    onFavoriteToggle={() => {}} // Mock function
                    onEdit={handleEdit}
                    showActionButtons={true}
                  />
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">
                You haven't added any listings yet.
              </p>
              <Link
                to="/add-listing"
                className="mt-4 inline-block bg-black text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Add Your First Listing
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandlordProperties;
