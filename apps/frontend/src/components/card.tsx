import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMediaFile } from "../api"; // Ensure fetchMediaFile is imported
import { Link } from "react-router-dom";

interface MediaFile {
  id: string;
  creationDate: string;
  type: number;
}

interface HouseCardProps {
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
  status?: string;
  showStatus?: boolean;
  mediaFiles?: MediaFile[];
  isFavorite: boolean;
  onFavoriteToggle: (id: string, isNowFavorite: boolean) => void;
  onDelete?: (id: string) => void;
  //showDeleteButton?: boolean;
  onEdit?: (id: string) => void;
  showActionButtons?: boolean;
}

const HouseCard: React.FC<HouseCardProps> = ({
  id,
  name,
  location,
  type,
  size,
  coldRent,
  warmRent,
  additionalCosts,
  deposit,
  availabilityFrom,
  availabilityTo,
  description,
  status,
  showStatus = false,
  mediaFiles,
  isFavorite,
  onFavoriteToggle,
  onDelete,
  //showDeleteButton = false,
  onEdit,
  showActionButtons = false,
}) => {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const isEditable = status === "Pending"

  useEffect(() => {
    const loadImage = async () => {
      if (mediaFiles && mediaFiles.length > 0) {
        try {
          const url = await fetchMediaFile(mediaFiles[0]!.id);
          setImageUrl(url);
        } catch (error) {
          console.error("Error loading image:", error);
          setImageUrl("https://picsum.photos/id/71/200/200");
        }
      } else {
        setImageUrl("https://picsum.photos/id/71/200/200");
      }
    };
    loadImage();
  }, [mediaFiles]);

  const handleHeartClick = () => {
    onFavoriteToggle(id, !isFavorite); // Toggle favorite status
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-600 text-black";
      case "approved":
        return "bg-blue-300 text-black";
      case "rejected":
        return "bg-red-500 text-black";
      default:
        return "bg-gray-100 text-black";
    }
  };

  // Get the user role from localStorage
  const userRole = localStorage.getItem("userRole");

  const handleDelete = async () => {
    if (
      onDelete &&
      window.confirm("Are you sure you want to delete this listing?")
    ) {
      try {
        await onDelete(id);
        navigate("/"); // Redirect after successful deletion
      } catch (error) {
        console.error("Error during deletion:", error);
      }
    }
  };
  return (
    <div className="flex flex-col w-full mb-4 overflow-hidden bg-white border border-gray-300 rounded-lg shadow-md sm:flex-col md:flex-row">

      {/* Image Section */}
      <img
        src={imageUrl || "https://picsum.photos/id/71/200/200"}
        alt={name}
        className="object-cover w-full h-48 bg-gray-300 sm:w-full md:w-48"
      />

      {/* Details Section */}
      <div className="flex flex-col w-full p-4">
        <div className="flex flex-col items-start justify-between mb-2 md:flex-row md:items-center">
          <Link
            to={`/listing/${id}`}
            className="text-lg font-semibold text-gray-800 cursor-pointer"
          >
            {name}
          </Link>

          {/* Heart Icon for Student Users */}
          {userRole === "Student" && (
            <button
              onClick={handleHeartClick}
              className="mt-2 md:mt-0"
              style={{ border: "none", background: "none", cursor: "pointer" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={isFavorite ? "red" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-heart"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.65l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          )}
        </div>

        <p className="mt-2 text-gray-500">
          <span className="font-medium">Type:</span> {type}
        </p>
        <p className="mt-2 text-gray-500">
          <span className="font-medium">Location:</span> {location}
        </p>
        <p className="mt-2 text-gray-500">
          <span className="font-medium">Size:</span> {size} sqm
        </p>
        <p className="mt-4 text-gray-700">
          <span className="font-medium">Description:</span> {description}
        </p>
        <p className="mt-2 text-gray-500">
          <span className="font-medium">Availability:</span>{" "}
          {new Date(availabilityFrom).toLocaleDateString()} -{" "}
          {new Date(availabilityTo).toLocaleDateString()}
        </p>
      </div>

      {/* Rent & Actions Section */}
      <div className="flex flex-col justify-between w-full p-4 border-t border-gray-200 sm:w-full md:w-auto md:border-t-0 md:border-l">

        {/* Status Badge */}
        {showStatus && status && (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium mb-2 ${getStatusColor(status)}`}
          >
            {status}
          </span>
        )}

        {/* Rent Details */}
        <div className="text-center md:text-right">
          <span className="text-xl font-bold text-gray-800">
            €{warmRent} (Warm Rent)
          </span>
          <p className="text-sm text-gray-600">
            Cold Rent: €{coldRent} | Additional Costs: €{additionalCosts}
          </p>
          <p className="text-sm text-gray-600">Deposit: €{deposit}</p>
        </div>

        {/* Action Buttons */}
        {showActionButtons && (
          <div className="flex justify-center gap-2 mt-4 md:justify-end">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onEdit(id);
                }}
                disabled={!isEditable}
                title={isEditable ? undefined : "Only pending properties can be edited."}
                className={`px-4 py-1 text-sm text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600 ${isEditable ? "" : "hover:cursor-not-allowed"}`}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
                className="px-4 py-2 text-white transition-colors bg-red-500 rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HouseCard;
