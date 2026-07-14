import React, { useState, useEffect } from "react";
import { editListing, fetchListingById, uploadMediaFile } from "../api";
import { useNavigate, useParams } from "react-router-dom";

// Enums
export enum PropertyType {
  Apartment = "Apartment",
  Studio = "House",
  House = "SharedApartment",
  Other = "SharedHouse",
}

type Amenity = {
  amenityId: string;
  value: string;
};

const EditListing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    type: PropertyType.Apartment,
    coldRent: "",
    additionalCosts: "",
    deposit: "",
    availabilityFrom: "",
    availabilityTo: "",
    size: "",
    arePetsAllowed: false,
    mediaFileIds: [] as string[],
    landlordQuestionnaireId: "1",
    amenitiesValues: [] as Amenity[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) {
        navigate("/properties");
        return;
      }

      try {
        const response = await fetchListingById(id);

        // Check if response.data exists
        const listing = response.data || response;

        if (!listing) {
          throw new Error("No listing data received");
        }

        const formattedListing = {
          ...listing,
          availabilityFrom: listing.availabilityFrom
            ? new Date(listing.availabilityFrom).toISOString().split("T")[0]
            : "",
          availabilityTo: listing.availabilityTo
            ? new Date(listing.availabilityTo).toISOString().split("T")[0]
            : "",
          coldRent: listing.coldRent?.toString() || "",
          additionalCosts: listing.additionalCosts?.toString() || "",
          deposit: listing.deposit?.toString() || "",
          size: listing.size?.toString() || "",
          mediaFileIds: listing.mediaFiles?.map((file: any) => file.id) || [],
          arePetsAllowed: listing.arePetsAllowed || false,
        };

        setFormData(formattedListing);
      } catch (error) {
        console.error("Error fetching listing:", error);
        // More specific error message based on the error type
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load listing details";
        alert(errorMessage);
        navigate("/properties");
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [id, navigate]);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "name":
        if (!value) return "Name is required.";
        break;
      case "location":
        if (!value) return "Location is required.";
        break;
      case "coldRent":
      case "additionalCosts":
      case "deposit":
        if (!value) return `${name} is required.`;
        if (isNaN(Number(value)) || Number(value) <= 0)
          return `${name} must be a positive number.`;
        break;
      case "availabilityFrom":
      case "availabilityTo":
        if (!value) return `${name} is required.`;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
          return `${name} must be a valid date (YYYY-MM-DD).`;
        break;
      default:
        return "";
    }
    return "";
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    const isCheckbox = (e.target as HTMLInputElement).type === "checkbox";
    const checked = isCheckbox
      ? (e.target as HTMLInputElement).checked
      : undefined;

    setFormData((prevData) => ({
      ...prevData,
      [name]: isCheckbox ? checked : value,
    }));

    const error = validateField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleMediaFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadPromises = Array.from(files).map(uploadMediaFile);
      const newMediaIds = await Promise.all(uploadPromises);

      setFormData((prevState) => {
        const updatedData = {
          ...prevState,
          mediaFileIds: newMediaIds,
        };

        return updatedData;
      });

      setIsUploading(false);
    } catch (error) {
      console.error("Media upload error:", error);
      setUploadError("Failed to upload media files");
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedFormData = {
      ...formData,
      mediaFileIds: formData.mediaFileIds,
      coldRent: Number(formData.coldRent),
      additionalCosts: Number(formData.additionalCosts),
      deposit: Number(formData.deposit),
      size: Number(formData.size),
    };

    try {
      await editListing(id!, updatedFormData);
      alert("Property updated successfully!");
      navigate("/properties");
    } catch (error) {
      console.error("Error updating property:", error);
      alert("Failed to update property.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto bg-white rounded-lg shadow-md">
      <h2 className="mb-4 text-2xl font-bold">Edit Listing</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-wrap mb-4 -mx-2">
          {/* Name */}
          <div className="w-full px-2 mb-4 md:w-1/2 md:mb-0">
            <label htmlFor="name" className="block font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={`w-full px-3 py-2 mt-1 border rounded ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
            />
            {errors.name && (
              <p className="mt-2 text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          {/* Location */}
          <div className="w-full px-2 md:w-1/2">
            <label
              htmlFor="location"
              className="block font-medium text-gray-700"
            >
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              className={`w-full px-3 py-2 mt-1 border rounded ${
                errors.location ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.location}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
            />
            {errors.location && (
              <p className="mt-2 text-red-500 text-sm">{errors.location}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap mb-4 -mx-2">
          {/* Description */}
          <div className="w-full px-2 mb-4 md:w-1/2 md:mb-0">
            <label
              htmlFor="description"
              className="block font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className={`w-full px-3 py-2 mt-1 border rounded ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.description}
              onChange={handleInputChange}
              onBlur={handleBlur}
              rows={4}
              required
            />
            {errors.description && (
              <p className="mt-2 text-red-500 text-sm">{errors.description}</p>
            )}
          </div>

          {/* Media Upload */}
          <div className="w-full px-2 md:w-1/2">
            <label
              htmlFor="mediaFileIds"
              className="block font-medium text-gray-700"
            >
              Upload Media
            </label>
            <input
              id="mediaFileIds"
              name="mediaFileIds"
              type="file"
              accept="image/*,video/*"
              multiple
              className="w-1/2 px-3 py-2 mt-1 border rounded"
              onChange={handleMediaFileUpload}
              disabled={isUploading}
            />
            {isUploading && (
              <p className="mt-2 text-blue-500 text-sm">Uploading media...</p>
            )}
            {uploadError && <p className="mt-2 text-red-500">{uploadError}</p>}

            {formData.mediaFileIds.length > 0 && (
              <div className="mt-2">
                <p className="text-green-500">
                  Uploaded {formData.mediaFileIds.length} file(s)
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap mb-4 -mx-2">
          {/* Type */}
          <div className="w-full px-2 mb-4 md:w-1/2 md:mb-0">
            <label htmlFor="type" className="block font-medium text-gray-700">
              Type
            </label>
            <select
              id="type"
              name="type"
              className="w-full px-3 py-2 mt-1 border rounded border-gray-300"
              value={formData.type}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
            >
              {Object.values(PropertyType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Size */}
          <div className="w-full px-2 md:w-1/2">
            <label htmlFor="size" className="block font-medium text-gray-700">
              Size (m²)
            </label>
            <input
              id="size"
              name="size"
              type="number"
              step="0.01"
              className="w-full px-3 py-2 mt-1 border rounded border-gray-300"
              value={formData.size}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
            />
          </div>
        </div>

        <div className="flex flex-wrap mb-4 -mx-2">
          {/* Availability Dates */}
          <div className="w-full px-2 mb-4 md:w-1/2 md:mb-0">
            <label
              htmlFor="availabilityFrom"
              className="block font-medium text-gray-700"
            >
              Availability From
            </label>
            <input
              id="availabilityFrom"
              name="availabilityFrom"
              type="date"
              className="w-full px-3 py-2 mt-1 border rounded border-gray-300"
              value={formData.availabilityFrom}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
            />
          </div>
          <div className="w-full px-2 md:w-1/2">
            <label
              htmlFor="availabilityTo"
              className="block font-medium text-gray-700"
            >
              Availability To
            </label>
            <input
              id="availabilityTo"
              name="availabilityTo"
              type="date"
              className="w-full px-3 py-2 mt-1 border rounded border-gray-300"
              value={formData.availabilityTo}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
            />
          </div>
        </div>

        <div className="flex flex-wrap mb-4 -mx-2">
          {/* Cold Rent */}
          <div className="w-full px-2 mb-4 md:w-1/2 md:mb-0">
            <label
              htmlFor="coldRent"
              className="block font-medium text-gray-700"
            >
              Cold Rent (€)
            </label>
            <input
              id="coldRent"
              name="coldRent"
              type="number"
              step="0.01"
              className={`w-full px-3 py-2 mt-1 border rounded ${
                errors.coldRent ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.coldRent}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
            />
            {errors.coldRent && (
              <p className="mt-2 text-red-500 text-sm">{errors.coldRent}</p>
            )}
          </div>

          {/* Additional Costs */}
          <div className="w-full px-2 md:w-1/2">
            <label
              htmlFor="additionalCosts"
              className="block font-medium text-gray-700"
            >
              Additional Costs (€)
            </label>
            <input
              id="additionalCosts"
              name="additionalCosts"
              type="number"
              step="0.01"
              className={`w-full px-3 py-2 mt-1 border rounded ${
                errors.additionalCosts ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.additionalCosts}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
            />
            {errors.additionalCosts && (
              <p className="mt-2 text-red-500 text-sm">
                {errors.additionalCosts}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap mb-4 -mx-2">
          {/* Deposit */}
          <div className="w-full px-2 mb-4 md:w-1/2 md:mb-0">
            <label
              htmlFor="deposit"
              className="block font-medium text-gray-700"
            >
              Deposit (€)
            </label>
            <input
              id="deposit"
              name="deposit"
              type="number"
              step="0.01"
              className={`w-full px-3 py-2 mt-1 border rounded ${
                errors.deposit ? "border-red-500" : "border-gray-300"
              }`}
              value={(formData as any)["deposit"]}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
            />
            {errors.deposit && (
              <p className="mt-2 text-red-500 text-sm">{errors.deposit}</p>
            )}
          </div>

          {/* Pets Allowed */}
          <div className="w-full px-2 md:w-1/2">
            <label
              htmlFor="arePetsAllowed"
              className="block font-medium text-gray-700"
            >
              Are Pets Allowed?
            </label>
            <input
              id="arePetsAllowed"
              name="arePetsAllowed"
              type="checkbox"
              checked={formData.arePetsAllowed}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{ width: "150px" }}
          className="px-4 py-2 font-medium text-white bg-black rounded hover:bg-yellow-600"
        >
          Save Listing
        </button>
      </form>
    </div>
  );
};
export default EditListing;
