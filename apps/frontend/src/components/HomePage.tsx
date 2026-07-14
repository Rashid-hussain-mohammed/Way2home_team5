import React, { useState, useEffect, useRef } from "react";
import {
  fetchListings,
  fetchFavoriteListings,
  addToFavListing,
  deleteFavProperty,
  addSearchHistory,
} from "../api";
import "../App.css";
import HouseCard from "./card";
import SearchHistoryComponent from "./searchHistoryComponent";
import { PropertyType } from "./addListing";
import { FaCaretDown, FaCaretUp, FaSearch } from "react-icons/fa";
import SearchFiltersComponent, { type SearchFilters } from "./SearchFilters";

interface MediaFile {
  id: string;
  creationDate: string;
  type: number;
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
  status: string;
  mediaFiles?: MediaFile[];
}

const HomePage: React.FC = () => {
  const setFiltersRef = useRef<(filters: SearchFilters) => void>(() => {})
  const [listings, setListings] = useState<Listing[]>([]);
  const [query, setQuery] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set()); // Set of favorite listing IDs
  const [userRole, setUserRole] = useState<string>(""); // User role state
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch all listings on component mount
  useEffect(() => {
    // Load favorites from localStorage
    const storedFavorites = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );
    setFavoriteIds(new Set(storedFavorites));

    // Fetch user role from localStorage
    const role = localStorage.getItem("userRole") || ""; // Get user role from localStorage
    setUserRole(role);

    const fetchAllListings = async () => {
      try {
        // Pass default values if no parameters are required
        const allListings = await fetchListings("", {});
        if (Array.isArray(allListings.data)) {
          setListings(allListings.data);
        } else {
          console.error("API response is not an array:", allListings);
        }
      } catch (error) {
        console.error("Error fetching all listings:", error);
      }
    };
    const fetchFavorites = async () => {
        try {
          const favoriteResponse = await fetchFavoriteListings(); // ✅Fetch from API
          console.log("Full API Response:", favoriteResponse); //  Debugging

          if (Array.isArray(favoriteResponse.data)) {
            const favoriteIds = new Set<string>(
              favoriteResponse.data.map((fav: { property: { id: string } }) => fav.property.id)
            );
            console.log("Extracted Favorite IDs:", favoriteIds);
            setFavoriteIds(favoriteIds); //  Update state
          } else {
            console.error("Unexpected favorite listings response:", favoriteResponse);
          }
        } catch (error) {
          console.error("Error fetching favorite listings:", error);
        }
      };



    if (role === "Student") {
      fetchFavorites();
    }
    fetchAllListings();
  }, []);
  const handleSearch = async (query: string, filters: SearchFilters) => {
    try {

      const filteredListings = await fetchListings(query, filters);

      if (Array.isArray(filteredListings.data)) {
        setListings(filteredListings.data);

      if (!query.trim()) {
        console.warn("Search query is empty. Aborting request.");
        return;
      }

        // Add search to history
        const newSearch = {
            query,
            location: filters.location || "",
            type: filters.propertyType,
            maxRent: filters.maxPrice !== undefined ? filters.maxPrice : null,    //  Default value
            minRent: filters.minPrice !== undefined ? filters.minPrice : null,    //  Default value
            availabilityFrom: filters.availabilityFrom || null,          //  Current date as fallback
            availabilityTo: filters.availabilityTo || null,              //  Current date as fallback
            minSize: filters.minSize !== undefined ? filters.minSize : null,         //  Default value
            maxSize: filters.maxSize !== undefined ? filters.maxSize : null,
            arePetsAllowed: filters.arePetsAllowed !== undefined ? filters.arePetsAllowed : null,  //  Default value
          };



        await addSearchHistory(newSearch); // This adds the search to the history
      } else {
        console.error("API response is not an array:", filteredListings);
      }
    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  const onReset = () => {
    setQuery("")
    setFilters({})
    // for some reason the query and filters state are not yet updated when calling handleSearch
    // this is why we need to pass our own filters
    handleSearch("", {})
  }

  const handleSearchSelect = (searchData: { query: string; filters: Partial<SearchFilters> }) => {
    setQuery(searchData.query);

    const mappedFilters: SearchFilters = {
        location: searchData.filters.location || "",
        propertyType: (searchData.filters.propertyType as PropertyType) || undefined,
        maxPrice: searchData.filters.maxPrice || undefined,
        minPrice: searchData.filters.minPrice || undefined,
        availabilityFrom: searchData.filters.availabilityFrom
          ? new Date(searchData.filters.availabilityFrom) //  Convert to Date object
          : undefined,
        availabilityTo: searchData.filters.availabilityTo
          ? new Date(searchData.filters.availabilityTo)   //  Convert to Date object
          : undefined,
        minSize: searchData.filters.minSize || undefined,
        arePetsAllowed: searchData.filters.arePetsAllowed !== undefined ? searchData.filters.arePetsAllowed : undefined,
      };

      setFilters(mappedFilters); //  No more type errors
      setFiltersRef.current(mappedFilters)
      handleSearch(searchData.query, mappedFilters)
  };



  const authToken = localStorage.getItem("authToken");

  const toggleFavorite = async (id: string, isNowFavorite: boolean) => {
    setFavoriteIds((prevFavorites) => {
      const updatedFavorites = new Set(prevFavorites);
      isNowFavorite ? updatedFavorites.add(id) : updatedFavorites.delete(id);
      return updatedFavorites; //  Ensures state update
    });

    try {
      if (isNowFavorite) {
        await addToFavListing(id); //  API call to add favorite
      } else {
        await deleteFavProperty(id); //  API call to remove favorite
      }
    } catch (error) {
      console.error("Failed to add/remove favorite:", error);
    }
  };


  // Filter only approved listings
  const approvedListings = listings.filter(
    (listing) => listing.status?.toLowerCase() === "approved"
  );

  return (
    <div className="px-4 py-8 md:px-6 lg:px-8">
      {/* Search Filters Section */}
      <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-xl font-bold text-center md:text-2xl md:text-left">
          What are you looking for?
        </h2>
  
        {/* First Row: Search Input with Icon */}
        <div className="flex flex-col items-center gap-3 mb-6 md:flex-row md:gap-2">
          <div className="relative w-full">
            <input
              id="search-query"
              type="text"
              placeholder="Type your search..."
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm md:text-base"
              value={query}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch(query, filters)
            }}
            onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            
            {showDropdown && (
              <div className="absolute left-0 right-0 z-20 mt-1">
                <SearchHistoryComponent onSearchSelect={handleSearchSelect} />
              </div>
            )}
          </div>
  
          <button
            className="flex items-center justify-center w-full px-4 py-2 text-white bg-black rounded-md md:w-auto hover:bg-yellow-600"
            onClick={() => handleSearch(query, filters)}
          >
            <FaSearch />
          </button>
        </div>
  
        {/* Filters Button */}
        <div className="flex justify-center">
          <button
            className="flex items-center gap-2 px-4 py-2 text-white bg-black rounded-md hover:bg-yellow-600"
            onClick={() => setFiltersVisible(!filtersVisible)}
          >
            Filters {filtersVisible ? <FaCaretUp /> : <FaCaretDown />}
          </button>
        </div>
  
        {/* Filters Section */}
        <div className={filtersVisible ? "hidden" : "mt-4"}>
          <SearchFiltersComponent 
            onChange={setFilters} 
            onReset={onReset} 
            onApplyFilters={() => handleSearch(query, filters)} 
            setFiltersRef={setFiltersRef} 
          />
        </div>
  
        {/* Results Count */}
        <div className="mt-6 text-center md:text-left">
          Found {approvedListings.length} results.
        </div>
      </div>
  
      {/* Listings Section */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="grid grid-cols-1 gap-4 ">
          {approvedListings.length > 0 ? (
            approvedListings.map((listing) => (
              <HouseCard
                key={listing.id}
                id={listing.id}
                name={listing.name}
                location={listing.location}
                type={listing.type}
                size={listing.size}
                coldRent={listing.coldRent}
                warmRent={listing.warmRent}
                additionalCosts={listing.additionalCosts}
                deposit={listing.deposit}
                availabilityFrom={listing.availabilityFrom}
                availabilityTo={listing.availabilityTo}
                description={listing.description}
                status={listing.status}
                mediaFiles={listing.mediaFiles}
                isFavorite={favoriteIds.has(listing.id)}
                onFavoriteToggle={toggleFavorite}
              />
            ))
          ) : (
            <p className="text-center">No listings found matching your search criteria.</p>
          )}
        </div>
      </div>
    </div>
  );
  
};

export default HomePage;
