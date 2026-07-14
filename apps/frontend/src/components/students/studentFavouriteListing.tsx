import React, { useEffect, useState } from "react";
import { fetchFavoriteListings, deleteFavProperty } from "../../api"; // Import API functions
import { Link, useParams } from "react-router-dom";
import HouseCard from "../card"; // Reusing the HouseCard
//import HeartButton from "../heartButton";

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

const FavoriteListingsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Extract 'id' from URL params
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await fetchFavoriteListings();
        if (response.success && response.data) {
          const properties = response.data.map((item: any) => item.property);
          setFavorites(properties);
          setFavoriteIds(new Set(properties.map((property: Listing) => property.id)));
        } else {
          throw new Error("Failed to fetch favorite listings");
        }
      } catch (error) {
        console.error("Error fetching favorite listings:", error);
        setError("Failed to fetch favorite listings.");
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);


  const handleRemoveFavorite = async (id: string) => {
    try {
      // Remove the listing from favoriteIds and update localStorage
      const updatedFavorites = Array.from(favoriteIds).filter(
        (favoriteId) => favoriteId !== id
      );
      setFavoriteIds(new Set(updatedFavorites));
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  
      // Update the `favorites` state to remove the listing
      setFavorites((prevFavorites) =>
        prevFavorites.filter((listing) => listing.id !== id)
      );
  
      // Make API call to remove the favorite
      await deleteFavProperty(id);
      alert("Listing removed from favorites.");
    } catch (error) {
      console.error("Error removing favorite listing:", error);
      alert("Failed to remove the listing from favorites.");
    }
  };
  
  

  if (loading) return <p>Loading favorite listings...</p>; // Show a loading message
  if (error) return <p>{error}</p>; // Show error message if there's an error

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="grid grid-cols-1 gap-4">
        {favorites.length > 0 ? (
          favorites.map((listing) => (
            <div key={listing.id} className="relative">
              {/* Link and HouseCard */}
                <HouseCard
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
                   isFavorite={favorites.some((fav) => fav.id === listing.id)}
                   onFavoriteToggle={handleRemoveFavorite}
                  
                />
            </div>
          ))
        ) : (
          <p>No favorite listings found.</p>
        )}
      </div>
    </div>
  );
};

export default FavoriteListingsPage;
