import React, { useState, useEffect } from "react";
import { fetchSearchHistory, deleteSearchHistory } from "../api";
import { PropertyType } from "./addListing"; //  Import PropertyType if needed
import type { SearchFilters } from "./SearchFilters";

export interface SearchHistoryItem {
  id: string;
  query: string;
  location?: string;
  type?: string;
  maxRent?: number;
  minRent?: number;
  deposit?: number;
  availabilityFrom?: string;
  availabilityTo?: string;
  size?: number;
  arePetsAllowed?: boolean;
  amenitiesValues?: { amenityId: string; value: "yes" | "no" }[];
}

interface SearchHistoryProps {
  onSearchSelect: (searchData: { query: string; filters: Partial<SearchFilters> ; key: number }) => void; // Pass both query and filters
}

const SearchHistoryComponent: React.FC<SearchHistoryProps> = ({ onSearchSelect }) => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    const handleStorageChange = () => {
      loadSearchHistory(); // Refresh history when localStorage changes
    };

    window.addEventListener("storage", handleStorageChange);

    loadSearchHistory(); // Initial load

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const loadSearchHistory = async () => {
    try {
      const history = await fetchSearchHistory();
      if (Array.isArray(history)) {
        setSearchHistory(history.slice(0, 5)); // Limit to last 5 items
      }
    } catch (error) {
      console.error("Error fetching search history:", error);
    }
  };

  const handleSelectHistory = (history: SearchHistoryItem) => {
    const filters: Partial<SearchFilters> = {
        location: history.location || "",
        propertyType: (history.type as PropertyType) || undefined,
        maxPrice: history.maxRent || undefined,
        minPrice: history.minRent || undefined,
        availabilityFrom: history.availabilityFrom
          ? new Date(history.availabilityFrom)
          : undefined, //  Convert to ISO date string (YYYY-MM-DD)
        availabilityTo: history.availabilityTo
          ? new Date(history.availabilityTo)
          : undefined, //  Convert to ISO date string (YYYY-MM-DD)
        minSize: history.size || undefined,
        arePetsAllowed: history.arePetsAllowed !== undefined ? history.arePetsAllowed : undefined,
      };


    onSearchSelect({ query: history.query, filters, key: Date.now(), }); //  Send both query and filters
  };

  const handleDeleteHistory = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering parent click events
    try {
      await deleteSearchHistory(id);
      setSearchHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting search history:", error);
    }
  };

  return (
    <div className="w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
      {searchHistory.length === 0 ? (
        <p className="p-4 text-gray-500">No recent searches found.</p>
      ) : (
        searchHistory.map((history) => (
          <div
            key={history.id}
            className="flex justify-between items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
            onClick={() => handleSelectHistory(history)} //  Trigger select handler
          >
            <div className="flex flex-col truncate">
              <span className="font-medium text-gray-700">{history.query}</span>
              <div className="text-sm text-gray-500">
                {Object.entries(history)
                  .filter(([key, value]) =>
                    key !== "user" &&
                    key !== "status" &&
                    key !== "id" &&
                    key !== "creationDate" &&
                    key !== "amenitiesValues" &&
                    value !== null &&
                    value !== undefined &&
                    value !== ""
                  )
                  .map(([key, value], index) => (
                    <span key={key}>
                      {index > 0 && " | "}
                      {key === "maxRent" || key === "minRent"
                        ? `${key === "maxRent" ? "Max Rent" : "Min Rent"}: €${value}`
                        : key === "type"
                        ? `Type: ${value}`
                        : key === "size"
                        ? `Size: ${value} m²`
                        : key === "arePetsAllowed"
                        ? `Pets Allowed: ${value ? "Yes" : "No"}`
                        : key === "availabilityFrom" || key === "availabilityTo"
                        ? `${key === "availabilityFrom" ? "Available From" : "Available To"}: ${new Date(value as string).toLocaleDateString()}`
                        : `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`}
                    </span>
                  ))}
              </div>
            </div>

            <button
              className="text-red-500 hover:text-red-700 px-2 py-1 rounded-md bg-transparent hover:bg-red-100"
              onClick={(e) => handleDeleteHistory(history.id, e)}
            >
              ❌
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default SearchHistoryComponent;
