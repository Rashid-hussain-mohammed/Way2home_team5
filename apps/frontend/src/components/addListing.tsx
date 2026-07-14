import React, { useEffect, useState } from "react";
import { addProperty, fetchQuestionnaire, uploadMediaFile } from "../api";
import { useNavigate } from "react-router-dom";
import { ChangeEvent } from "react";

// Enums
export enum PropertyType {
  Apartment = "Apartment",
  Studio = "House",
  House = "SharedApartment",
  Other = "SharedHouse",
}

type Amenity = {
  amenityId: string; // ID of the amenity
  value: string; // Value of the amenity (e.g., 'yes', 'no')
};

const AddListing: React.FC = () => {
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
    landlordQuestionnaireId: "",
    amenitiesValues: [] as Amenity[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [questionnaireId, setQuestionnaireId] = useState<string>("0");
  // State for storing the fetched questionnaires
  const [questionnaireOptions, setQuestionnaireOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] =
    useState<string>("");

  const validateDates = (fromDate: string, toDate: string): string => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (to < from) {
        return "'Available To' date should be after than 'Available From' date";
      }
    }
    return "";
  };

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
        const dateError = validateDates(
          name === "availabilityFrom" ? value : formData.availabilityFrom,
          name === "availabilityTo" ? value : formData.availabilityTo
        );
        if (dateError) return dateError;
        break;
      default:
        return "";
    }
    return "";
  };

  useEffect(() => {
    const questionId = localStorage.getItem("questionnaireId") || "0";
    setQuestionnaireId(questionId);
    console.log(questionId);
  }, []);

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

    if (name === "availabilityFrom" || name === "availabilityTo") {
      const newFormData = {
        ...formData,
        [name]: value,
      };

      const dateError = validateDates(
        name === "availabilityFrom" ? value : newFormData.availabilityFrom,
        name === "availabilityTo" ? value : newFormData.availabilityTo
      );

      setErrors((prevErrors) => ({
        ...prevErrors,
        availabilityFrom: dateError,
        availabilityTo: dateError,
      }));
    } else {
      const error = validateField(name, value);
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error,
      }));
    }
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
      const mediaIds = await Promise.all(uploadPromises);

      setFormData((prevState) => ({
        ...prevState,
        mediaFileIds: mediaIds,
      }));

      setIsUploading(false);
    } catch (error) {
      console.error("Media upload error:", error);
      setUploadError("Failed to upload media files");
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validMediaFiles =
      formData.mediaFileIds.length > 0 ? formData.mediaFileIds : [];
    const updatedFormData = { ...formData, mediaFileIds: validMediaFiles };

    try {
      const response = await addProperty(updatedFormData);

      if (response.status === 400) {
        const backendErrors = await response.json();
        const errorMap = backendErrors.errors.reduce(
          (acc: Record<string, string>, err: any) => {
            acc[err.param] = err.msg;
            return acc;
          },
          {}
        );
        setErrors(errorMap);
        return;
      }

      alert("Property submitted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error submitting property:", error);
      alert("Failed to submit property.");
    }
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

  // Fetch the questionnaire options once the component mounts
  useEffect(() => {
    const fetchQuestionnaireData = async () => {
      const landlordId = localStorage.getItem("userId");
      if (!landlordId) {
        console.error("Landlord ID not found");
        return;
      }

      try {
        const questionnaire = await fetchQuestionnaire(landlordId);
        setQuestionnaireOptions(questionnaire); // Save the entire array with IDs and names
        console.log("Questionnaire options:", questionnaire);
      } catch (error) {
        console.error("Error fetching questionnaire:", error);
      }
    };

    fetchQuestionnaireData();
  }, []);

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      landlordQuestionnaireId: e.target.value, // Store the selected questionnaire ID in formData
    }));
  };

  return (
    <div className="container p-6 mx-auto bg-white rounded-lg shadow-md">
      <h2 className="mb-4 text-2xl font-bold">Add a New Listing</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Location */}
        <div className="flex flex-col md:flex-row md:gap-4">
          {/* Name */}
          <div className="w-full">
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
              <p className="mt-2 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Location */}
          <div className="w-full">
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
              <p className="mt-2 text-sm text-red-500">{errors.location}</p>
            )}
          </div>
        </div>

        {/* Description and Media Upload */}
        <div className="flex flex-col md:flex-row md:gap-4">
          {/* Description */}
          <div className="w-full">
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
              <p className="mt-2 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Media Upload */}
          <div className="w-full">
            <label
              htmlFor="mediaFileIds"
              className="block font-medium text-gray-700"
            >
              Upload Media (max 10 MB)
            </label>
            <input
              id="mediaFileIds"
              name="mediaFileIds"
              type="file"
              accept="image/*,video/*"
              multiple
              className="w-full px-3 py-2 mt-1 border rounded"
              onChange={handleMediaFileUpload}
              disabled={isUploading}
            />
            {isUploading && (
              <p className="mt-2 text-sm text-blue-500">Uploading media...</p>
            )}
            {uploadError && <p className="mt-2 text-red-500">{uploadError}</p>}
            {formData.mediaFileIds.length > 0 && (
              <p className="mt-2 text-green-500">
                Uploaded {formData.mediaFileIds.length} file(s)
              </p>
            )}
          </div>
        </div>

        {/* Type and Size */}
        <div className="flex flex-col md:flex-row md:gap-4">
          {/* Type */}
          <div className="w-full">
            <label htmlFor="type" className="block font-medium text-gray-700">
              Type
            </label>
            <select
              id="type"
              name="type"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded"
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
          <div className="w-full">
            <label htmlFor="size" className="block font-medium text-gray-700">
              Size (m²)
            </label>
            <input
              id="size"
              name="size"
              type="number"
              step="0.01"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded"
              value={(formData as any)["size"]}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
            />
          </div>
        </div>

        {/* Updated Availability Dates section with error display */}
        <div className="flex flex-col md:flex-row md:gap-4">
          {["availabilityFrom", "availabilityTo"].map((field) => (
            <div key={field} className="w-full">
              <label
                htmlFor={field}
                className="block font-medium text-gray-700 capitalize"
              >
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                id={field}
                name={field}
                type="date"
                className={`w-full px-3 py-2 mt-1 border rounded ${
                  errors[field] ? "border-red-500" : "border-gray-300"
                }`}
                value={(formData as any)[field]}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
              />
              {errors[field] && (
                <p className="mt-2 text-sm text-red-500">{errors[field]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Cold Rent and Additional Costs */}
        <div className="flex flex-col md:flex-row md:gap-4">
          {/* Cold Rent */}
          <div className="w-full">
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
              value={(formData as any)["coldRent"]}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
            />
            {errors.coldRent && (
              <p className="mt-2 text-sm text-red-500">{errors.coldRent}</p>
            )}
          </div>

          {/* Additional Costs */}
          <div className="w-full">
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
              value={(formData as any)["additionalCosts"]}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
            />
            {errors.additionalCosts && (
              <p className="mt-2 text-sm text-red-500">
                {errors.additionalCosts}
              </p>
            )}
          </div>
        </div>

        {/* Deposit and Pets Allowed */}
        <div className="flex flex-col md:flex-row md:gap-4">
          {/* Deposit */}
          <div className="w-full">
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
              <p className="mt-2 text-sm text-red-500">{errors.deposit}</p>
            )}
          </div>

          {/* Pets Allowed */}
          <div className="w-full flex items-center mt-4 md:mt-0">
            <label
              htmlFor="arePetsAllowed"
              className="block font-medium text-gray-700 mr-2"
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

        {/* Questionnaire */}
        <div className="w-full">
          <label
            htmlFor="questionnaire"
            className="block font-medium text-gray-700"
          >
            Questionnaire
          </label>
          <select
            id="questionnaire"
            name="questionnaire"
            value={formData.landlordQuestionnaireId}
            onChange={handleDropdownChange}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded"
          >
            <option value="" disabled>
              Select a questionnaire
            </option>
            {questionnaireOptions.map((questionnaire) => (
              <option key={questionnaire.id} value={questionnaire.id}>
                {questionnaire.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          style={{ width: "150px" }}
          className="px-4 py-2 font-medium text-white bg-black rounded hover:bg-yellow-600 w-full md:w-1/3"
        >
          Submit Listing
        </button>
      </form>
    </div>
  );
};

export default AddListing;
