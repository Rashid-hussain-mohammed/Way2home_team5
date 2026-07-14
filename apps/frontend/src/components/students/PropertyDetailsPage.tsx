import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ImageCarousel from "../imageCarousel";
import { fetchListingById, fetchMediaFile, checkQuestionnaireStatus, putPropertyStatus, getUserById, getUsersDetailsById } from "../../api";
import { addToFavListing, deleteFavProperty } from "../../api";
import { getPlaceholderAvatar } from "../../utils";

interface PropertyDetailsPageProps {
  mode: 'moderator' | 'user'
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
  birthDate: string;
  phone: string | null;
  creationDate: string;
  avatar: string | null;
  role: string;
  about: string | null;
}

const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({ mode = "user" }) => {

  const navigate = useNavigate()

  const handleMessageClick = () => {
    // Using optional chaining to safely access listing properties
    if (listing?.id && listing?.landlord?.id) {
      navigate(`/chatting?property=${listing.id}&user=${listing.landlord.id}`);
    } else {
      console.error("Listing or landlord is null or undefined");
    }
  };


  interface MediaFile {
    id: string;
    creationDate: string;
    type: number;
  }

  interface Landlord {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
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
    landlordQuestionnaireId: string;
    landlord: Landlord;
    arePetsAllowed: boolean;
  }

  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [hasTakenQuestionnaire, setHasTakenQuestionnaire] = useState(false);
  const [propertyId, setPropertyId] = useState<string | null>(null); // State to store propertyId
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set()); // Set of favorite listing IDs
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  useEffect(() => {
    // Get user role and ID from localStorage
    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");
    // Get user role from localStorage
    const role = localStorage.getItem("userRole");
    if (role) {
      setUserRole(role)
      console.log("the user role is set and its", userRole)
    }
    else {
      //console.warn("No role found in the localstorage")
    }
    //console.log("this is the user role", userRole)

        const fetchFavorites = async () => {
            try {
                const favoriteResponse = await fetchFavoriteListings();
                if (Array.isArray(favoriteResponse.data)) {
                    const favoriteIds = new Set<string>(
                        favoriteResponse.data.map((fav: { property: { id: string } }) => fav.property.id)
                    );
                    setFavoriteIds(favoriteIds); // Only update state, no localStorage
                } else {
                    console.error("Unexpected favorite listings response:", favoriteResponse);
                }
            } catch (error) {
                console.error("Error fetching favorite listings:", error);
            }
        };
        
        // Call this function in useEffect
        if(role === 'Student'){
        fetchFavorites();      
        }  
        console.log("Set after initialization:", fetchFavorites); // Debugging
    setUserId(userId || ""); // Set user ID


    window.scrollTo(0, 0);

    const fetchListing = async () => {
      try {
        if (!id) {
          console.error("Property ID is missing.");
          return;
        }

        // Fetch listing details
        const listingData = await fetchListingById(id);
        console.log("Listing Data:", listingData.data);
        setListing(listingData.data);
        setPropertyId(listingData.data.id); // Store the property ID

        // Handle media files
        if (listingData.data.mediaFiles?.length > 0) {
          const urls = await Promise.all(
            listingData.data.mediaFiles.map(async (file: MediaFile) => {
                            console.log("Fetching media file with ID:", file.id);
              return await fetchMediaFile(file.id); // Fetch the media URL
            })
          );
          setImageUrls(urls.filter(Boolean)); // Ensure only valid URLs are set
        } else {
          console.log("No media files found, setting default media.");
          setImageUrls(["https://picsum.photos/id/71/200/200"]); // Default media
        }

        // Check questionnaire status
        if (userId && listingData.data.id) {
          const questionnaireStatus = await checkQuestionnaireStatus(
            listingData.data.id,
            userId
          );
          console.log("Questionnaire Status:", questionnaireStatus); // Add logging
          setHasTakenQuestionnaire(questionnaireStatus?.hasTaken || false);
        }
      } catch (error) {
        console.error("Error fetching listing details:", error);

      }
    };

    if (id) {
      fetchListing();
    }
  }, [id, userId, propertyId]); // Add `userRole` and `propertyId` as dependencies

    useEffect(() => {
      const fetchProfileData = async () => {
        const userId = localStorage.getItem("userId");
        console.log(userId);
  
  
        try {
          const res = await getUserById(userId || "");
          console.log(res);
          setProfileData(res.data);
          // setFormData(res.data); // Initialize formData with fetched data
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      };
  
  
      fetchProfileData();
    }, []);
  

  if (!listing) {
    return <p>Loading listing details...</p>;
  }

  const isLandlord = userRole === "Landlord";
  const isModerator = userRole === "Moderator";

  const role = localStorage.getItem("userRole");
  //console.log(role);
  const toggleFavorite = async (id: string) => {
    // Check if the current listing is already a favorite
    const isNowFavorite = favoriteIds.has(id);

    // Create a new set to avoid mutating state directly
    const updatedFavorites = new Set(favoriteIds);

    if (isNowFavorite) {
      // If it's currently a favorite, remove it
      updatedFavorites.delete(id);
    } else {
      // Otherwise, add it to the favorites
      updatedFavorites.add(id);
    }

    // Update the state and localStorage
    setFavoriteIds(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(Array.from(updatedFavorites)));

    // Make API call to update the backend
    try {
      if (isNowFavorite) {
        // If removing from favorites, call the delete API
        await deleteFavProperty(id);
        console.log(`Removed ${id} from favorites`);
      } else {
        // If adding to favorites, call the add API
        await addToFavListing(id);
        console.log(`Added ${id} to favorites`);
      }
    } catch (error) {
      console.error("Failed to update favorites:", error);
    }
  };

  // Handle the click on "Take Questionnaire" button
  const handleTakeQuestionnaire = () => {
    // Navigate to Tenant Questionnaire page, passing landlordQuestionnaireId
    navigate(`/tenant-questionnaire/${listing.landlordQuestionnaireId}/${listing.id}`);
  };

  const handleApprove = async () => {
    try {
      if (listing) {
        await putPropertyStatus(listing.id, 'Approved')
        alert('Property has been approved')
        navigate('/moderator-dashboard')
      }
    } catch (error) {
      console.error('Error approving property:', error)
    }
  }

  const handleReject = async () => {
    try {
      if (listing) {
        await putPropertyStatus(listing.id, 'Rejected')
        alert('Property has been rejected')
        navigate('/moderator-dashboard')
      }
    } catch (error) {
      console.error('Error rejecting property:', error)
    }
  }

  const handleContactClick = () => {
    navigate("/chatting");
  }


  return (
    <div className="p-[20px]">
      {/* Carousel Section */}
      <div className="text-center mb-[20px]">
        <div>
          <ImageCarousel images={imageUrls} />
        </div>
        <div className="text-center p-[10px]"></div>
      </div>

     {/* Main Content Section */}
<div className="flex flex-col md:flex-row md:justify-between mb-[20px] gap-[20px]">
  {/* Property Details Section */}
  <div className="w-full md:w-[65%] flex flex-col">
    <div className="flex items-center justify-between">
      <h2 className="text-[24px] font-bold mr-[10px]">{listing.name}</h2>
      {/* Only show heart button if user is not a landlord */}
      {role === "Student" && (
        <button
          className="bg-transparent border-0 cursor-pointer"
          onClick={() => toggleFavorite(listing.id)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={favoriteIds.has(listing.id) ? "red" : "white"}
            stroke="black"
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

    {/* Property Details */}
    <div className="mt-[10px]">
      <p className="mb-[10px]">
        <strong>Availability :</strong>{" "}
        {new Date(listing.availabilityFrom).toLocaleDateString()} To{" "}
        {new Date(listing.availabilityTo).toLocaleDateString()}
      </p>
      <p>
        <strong>Address:</strong> {listing.location} (Contact Landlord for Full Address)
      </p>
      <p>
        <strong>Type:</strong> {listing.type}
      </p>
      <p>
        <strong>Size:</strong> {listing.size} m²
      </p>
      <p>
        <strong>Apartment Details: </strong> {listing.description}
      </p>
      <p>
        <strong>Pets Allowed:</strong> {listing.arePetsAllowed ? "Yes" : "No"}
      </p>
    </div>
  </div>

  {/* Price Section - Left align on mobile, Right align on larger screens */}
  <div className="w-full md:w-[35%] p-[0px] rounded-lg bg-gray-100 text-left md:text-right">
    <h3 className="text-xl font-bold text-green-600">
      €{listing.coldRent + listing.additionalCosts} (Warm Rent)
    </h3>
    <p className="text-gray-700 mt-[5px]">
      <strong>Cold Rent:</strong> €{listing.coldRent} |{" "}
      <strong>Additional Costs:</strong> €{listing.additionalCosts}
    </p>
    <p className="text-gray-700 mt-[5px]">
      <strong>Deposit:</strong> €{listing.deposit}
    </p>
  </div>


      


      {/* Landlord Section */}
      {!isLandlord && (
        <div className="w-full md:w-[30%] text-center p-[20px] border border-[#ccc] rounded-lg mt-[20px] md:mt-0">
          <div className="flex flex-col items-center justify-center mb-[20px]">
            <img
                              src={profileData?.avatar || getPlaceholderAvatar(profileData?.gender || "default")}
                              alt="User Avatar"
                              className="w-32 h-32 border-4 border-gray-200 rounded-full"
                            />
            <h3>
              {listing.landlord.firstName} {listing.landlord.lastName}
            </h3>
          </div>
          {mode === "user" && (
            <p>
              If you have any questions or would like to schedule a viewing, please
              don't hesitate to reach out. I'm here to help you find your perfect home!
            </p>
          )}

          {/* Only show send message button if user is not a landlord */}
          {mode === "user" ? (
            <button
              onClick={handleMessageClick}
              className="mt-[20px] px-[10px] py-[10px] bg-green-500 text-white border-0 rounded-[5px] cursor-pointer"
            >
              Send Message
            </button>
          ) : (
            <div className="mt-[20px] flex flex-col items-center gap-[10px]">
              <button
                onClick={handleApprove}
                className="w-full px-[10px] py-[10px] bg-green-500 text-white border-0 rounded-[5px] cursor-pointer"
              >
                Approve
              </button>
              <button
                onClick={handleReject}
                className="w-full px-[10px] py-[10px] bg-red-500 text-white border-0 rounded-[5px] cursor-pointer"
              >
                Reject
              </button>
              <button
                onClick={handleContactClick}
                className="w-full px-[10px] py-[10px] bg-blue-500 text-white border-0 rounded-[5px] cursor-pointer"
              >
                Contact
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  
      {/* Questionnaire Section */ }
  {
    !isLandlord && !isModerator && listing.landlordQuestionnaireId?.trim() && (
      <div className="mt-[20px]">
        <h3 className="text-xl font-semibold mb-[10px]">Interested in this property?</h3>
        <p>
          To proceed with your application, please fill out the questionnaire by clicking the button below.
          This will help us understand your preferences and requirements better.
        </p>
        <button
          onClick={handleTakeQuestionnaire}
          className="mt-[20px] px-[10px] py-[10px] bg-black text-white border-0 rounded-[5px] cursor-pointer"
          disabled={hasTakenQuestionnaire}
        >
          {hasTakenQuestionnaire ? "Questionnaire Already Taken" : "Take Questionnaire"}
        </button>
      </div>
    )
  }
    </div >
  );
}

export default PropertyDetailsPage;