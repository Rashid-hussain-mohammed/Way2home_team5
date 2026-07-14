import type { IChat, IMessage, IProperty, IUser } from '@gdsd/common/models';
import axios from 'axios';
import type { SearchFilters } from './components/SearchFilters';
import type { UserProfile } from "./components/userProfile";


export const baseURL = process.env["NODE_ENV"] === 'production'
    ? 'https://your-production-domain.com/api'
    : 'http://localhost:5000'

// Create a single Axios instance for all API calls
const axiosInstance = axios.create({
  baseURL: baseURL,
});

interface IFavoritedProperty extends IProperty {
    favoriteCount: number;
}

interface IAppliedProperty extends IProperty {
    applicationCount: number;
}

// Function to fetch listings based on filter parameters
export const fetchListings = async (query: string, filters: SearchFilters) => {
  try {
    const response = await axiosInstance.get('/properties', {
      params: {
        query: query || undefined,
        ...filters
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
};

export const fetchListingsForReview = async (query: string, propertyStatus: string) => {
    try {
      const token = localStorage.getItem('authToken')

      if (!token) {
        throw new Error('Token not found')
      }

      const response = await axiosInstance.get('/review/property', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          query: query || undefined,
          propertyStatus: propertyStatus || undefined,
        },
      })

      return response.data;
    } catch (error) {
      console.error('Error fetching listings for review:', error)
      throw error;
    }
}

export const uploadMediaFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Get the token from localStorage
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error('Token not found');
      }

      // Make the request with the token in the Authorization header
      const response = await axiosInstance.post('/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`, // Include the Authorization header with the token
        },
      });

      // Return the media ID
      return response.data.id;
    } catch (error) {
      console.error('Error uploading media file:', error);
      throw error; // Re-throw the error to handle it in the component
    }
  };

export const addProperty = async (formData: any) => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem("authToken");
      const landlordId = localStorage.getItem("userId");
      const updatedFormData = { ...formData, landlordId: landlordId };

      // Create the headers with the Authorization token
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include token in the Authorization header
      };

      // Make the request with the headers
      const response = await axiosInstance.post('/properties', updatedFormData, { headers });

      return response.data; // Return the response data
    } catch (error) {
      console.error('Error adding property:', error);
      throw error; // Re-throw the error to handle it in the component
    }
  };

export const fetchMediaFile = async (mediaId: string): Promise<string> => {
  try {
    const response = await axiosInstance.get(`/media/${mediaId}`, {
      responseType: 'blob'
    });

    const imageUrl = URL.createObjectURL(response.data);
    return imageUrl;
  } catch (error) {
    console.error('Error fetching media file:', error);
    throw error;
  }
};

export const fetchListingById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/properties/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching listing by ID:', error);
    throw error;  // Propagate the error to the calling function
  }
};

// Function to fetch favorite listings by userId
export const fetchFavoriteListings = async () => {
    try {
        const token = localStorage.getItem("authToken");
        console.log(token)

        if (!token) {
          throw new Error("Authentication token not found");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const response = await axiosInstance.get("/favorites", { headers }); // GET request to fetch the user's favorite listings

        return response.data; // Assuming the backend returns a list of favorite listings
      } catch (error) {
        console.error("Error fetching favorite listings:", error);
        throw error;
      }
    };
  //funtion to add new listings by propertyId
  export const addToFavListing = async (propertyId: string) => {
    try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          throw new Error("Authentication token not found");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Send listingId as a path variable
        const response = await axiosInstance.post(
          `/favorites/${propertyId}`,
          {}, // No request body, sending only headers
          { headers }
        );

        return response.data;
      } catch (error) {
        console.error("Error adding to favourites:", error);
        throw error;
      }
    };

  //function to delete new listings by propertyId
  export const deleteFavProperty = async (propertyId: string) => {
    try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          throw new Error("Authentication token not found");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const response = await axiosInstance.delete(`/favorites/${propertyId}`, { headers }); // DELETE request to remove a favorite property by its ID

        return response.data; // Assuming the backend returns a confirmation of the removal
      } catch (error) {
        console.error("Error removing favorite property:", error);
        throw error;
      }
    };

  // LOGIN function
  export const login = async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  export const updateUserById = async (userId: string, updatedData: Partial<UserProfile>) => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("Token not found");
      }

      // Define allowed fields
      const allowedFields = [
        "firstName",
        "lastName",
        "email",
        "gender",
        "birthDate",
        "phone",
        "about",
      ];

      // Filter the updatedData to include only allowed fields
      const filteredData = Object.keys(updatedData)
        .filter((key) => allowedFields.includes(key) && updatedData[key as keyof Partial<UserProfile>] != null)
        .reduce((obj, key) => {
          obj[key as keyof Partial<UserProfile>] = updatedData[key as keyof Partial<UserProfile>
          ]as any;
          return obj;
        }, {} as Partial<UserProfile>);

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const response = await axiosInstance.put(`/profile/${userId}`, filteredData, {
        headers,
      });

      return response.data; // Returns updated profile
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  };



  export const signup = async (formData: any) => {
      try {
        const response = await axiosInstance.post('/auth/signup', formData);
        return response.data;
      } catch (error) {
        console.error('Error adding User:', error);
        throw error;
      }
    };

    export const getUserById = async (userId: string) => {
      try {
          const token = localStorage.getItem("authToken");

        // Create the headers with the Authorization token
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include token in the Authorization header
        };

        const response = await axiosInstance.get(`/profile/${userId}`,{headers});
        return response.data;
      } catch (error) {
        console.error('Error during get User by ID:', error);
        throw error;
      }
    };

    export const fetchLandlordProperties = async () => {
      try {
        const landlordId = localStorage.getItem("userId");
        const token = localStorage.getItem('authToken');

        if (!landlordId) {
          throw new Error('Landlord ID not found');
        }

        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await axiosInstance.get(`/properties/landlord/${landlordId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          // Add this to handle 204 responses
          validateStatus: function (status) {
            return (status >= 200 && status < 300) || status === 204;
          }
        });

        // If status is 204, return an empty array
        return response.status === 204 ? [] : response.data;
      } catch (error) {
        console.error('Error fetching landlord properties:', error);
        throw error;
      }
    };
  // Function to submit the questionnaire
export const submitLandlordQuestionnaire = async (questionnaireData: any) => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem("authToken");

      // If no token is found, throw an error
      if (!token) {
        throw new Error("Authentication token is required.");
      }

      // Prepare the headers with the Authorization token
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include token in the Authorization header
      };

      // Make the POST request to submit the questionnaire
      const response = await axiosInstance.post('/questionnaire/landlord/create', questionnaireData, {
        headers: headers,
      });

      return response.data; // Return the response data, likely the questionnaire ID
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      throw error; // Re-throw the error to handle it in the component
    }
  };

  export const fetchQuestionnaire = async (landlordId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token not found");

      const response = await axiosInstance.get(`/questionnaire/landlord/${landlordId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching questionnaire:", error);
      throw error;
    }
  };

  export const fetchTenantQuestionnaire = async (landlordQuestionnaireId: string) => {
    try {
        const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token not found");
        const response = await axiosInstance.get(`/questionnaire/landlord/get/${landlordQuestionnaireId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          return response.data;
        } catch (error) {
          console.error("Error fetching questionnaire:", error);
          throw error;
        }
    };

  export const deleteListing = async (propertyId: string) => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axiosInstance.delete(`/properties/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(`Property ${propertyId} deleted successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting listing:', error);
      throw error;
    }
  };



    export const submitTenantQuestionnaire = async (payload: {
        landlordQuestionnaireId: string;
        userId: string;
        answers: number[];
      }) => {
        try {
          const token = localStorage.getItem("authToken");
          if (!token) throw new Error("Authentication token not found");

          const response = await axiosInstance.post('/questionnaire/tenant/submit', payload, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          return response.data;
        } catch (error) {
          console.error("Error submitting tenant questionnaire:", error);
          throw error;
        }
      };

      export const checkQuestionnaireStatus = async (propertyId: string, userId: string) => {

         // Retrieve the auth token from localStorage
          const token = localStorage.getItem("authToken");

          // Check if the token exists, and throw an error if not
          if (!token) throw new Error("Authentication token not found");

          // Make the API call with the updated Authorization header
          const response = await axiosInstance.get(`/questionnaire/tenant/${propertyId}/${userId}`,
            {
                headers: {
                  Authorization: `Bearer ${token}`, // Use 'authToken' instead of 'token'
                },
              }

          );
        return response.data;
      };


      export const fetchTenantsForProperty = async (propertyId: string) => {
        try {
          // Retrieve the auth token from localStorage
          const token = localStorage.getItem("authToken");

          // Check if the token exists, and throw an error if not
          if (!token) throw new Error("Authentication token not found");

          // Make the API call with the updated Authorization header
          const response = await axiosInstance.get(
            `/questionnaire/landlord/properties/${propertyId}/tenants`,
            {
              headers: {
                Authorization: `Bearer ${token}`, // Use 'authToken' instead of 'token'
              },
            }
          );

          // Return the response data
          return response.data;
        } catch (err) {
          console.error("Error fetching tenants:", err);
          throw err;
        }
      };


      export const putPropertyStatus = async (propertyId: string, status: string) => {
        try {
          const token = localStorage.getItem('authToken')

          if (!token) {
            throw new Error('Token not found')
          }

          const response = await axiosInstance.put(`/review/property/${propertyId}`,
            { status },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )

          return response.data
        } catch (error) {
          console.error('Error updating property status:', error)
          throw error
        }
      }


export const fetchChatMessages = async (
  otherUser: string,
  property: string
): Promise<IChat> => {
  const token = localStorage.getItem('authToken')

  if (!token) {
    throw new Error('Token not found')
  }

  try {
    const response = await axiosInstance.get(`/chat/${otherUser}/${property}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error("Error getting chat messages:", error);
    throw error;
  }
};

export const fetchUser = async (id: string): Promise<IUser> => {
  const token = localStorage.getItem('authToken')

  if (!token) {
    throw new Error('Token not found')
  }
  try {
    const response = await axiosInstance.get(`/profile/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const fetchChats = async (): Promise<IChat[]> => {
  const token = localStorage.getItem('authToken')

  if (!token) {
    throw new Error('Token not found')
  }

  try {
    const response = await axiosInstance.get(`/chat`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data.chats;
  } catch (error) {
    console.error("Error fetching chat list:", error);
    throw error;
  }
};

export const fetchUnreadCount = async (): Promise<number> => {
  const token = localStorage.getItem('authToken')

  if (!token) {
    throw new Error('Token not found')
  }

  try {
    const response = await axiosInstance.get(`/chat/unread`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data.unreadCount;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

export const readChat = async (otherUser: string, property: string): Promise<void> => {
  const token = localStorage.getItem('authToken')

  if (!token) {
    throw new Error('Token not found')
  }

  try {
    await axiosInstance.post(`chat/${otherUser}/${property}/read`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error("Error reading message:", error);
    throw error;
  }
};

export const editListing = async (propertyId: string, formData: any) => {
    try {
        const token = localStorage.getItem('authToken');

        if (!token) {
            throw new Error('Authentication token not found');
        }

        // Log the data being sent
        console.log('Sending update request with data:', {
            propertyId,
            formData,
            mediaFileIds: formData.mediaFileIds
        });

        // Ensure the data structure matches what the backend expects
        const requestData = {
            name: formData.name,
            location: formData.location,
            description: formData.description,
            type: formData.type,
            coldRent: Number(formData.coldRent),
            additionalCosts: Number(formData.additionalCosts),
            deposit: Number(formData.deposit),
            size: Number(formData.size),
            availabilityFrom: formData.availabilityFrom,
            availabilityTo: formData.availabilityTo,
            arePetsAllowed: formData.arePetsAllowed,
            mediaFileIds: formData.mediaFileIds, // Make sure this is an array
            landlordQuestionnaireId: formData.landlordQuestionnaireId,
            amenitiesValues: formData.amenitiesValues
        };

        const response = await axiosInstance.patch(
            `/properties/${propertyId}`,
            requestData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log('Update response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Detailed error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error;
    }
};

/** Fetch the last 5 search history records for the logged-in user */
export const fetchSearchHistory = async (): Promise<any[]> => {
    try {
      const authToken = localStorage.getItem("authToken");
      const headers = {
        Authorization: `Bearer ${authToken}`,
      };
      const response = await axiosInstance.get("/search-history", { headers });
      return response.data.data; // Assuming your backend returns `data` array
    } catch (error) {
      console.error("Error fetching search history:", error);
      throw error;
    }
  };

  /** Add a new search history record */
  export const addSearchHistory = async (searchData: {
    query: string;
    location?: string;
    type?: string;
    maxRent?: number | null;
    minRent?: number | null;
    deposit?: number | null;
    availabilityFrom?: Date | null;
    availabilityTo?: Date | null;
    minSize?: number | null;
    maxSize?: number | null;
    arePetsAllowed?: boolean | null;
    searchPreferencesId?: string;
    amenitiesValues?: { amenityId: string; value: "yes" | "no" }[];
    status?: string;
  }): Promise<any> => {
    try {
      console.log("Requesting:", axiosInstance.defaults.baseURL + "/search-history");
      const response = await axiosInstance.post("/search-history", searchData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      });
      return response.data; // Return the response from the backend
    } catch (error) {
      console.error("Error adding search history:", error);
      throw error;
    }
  };

  /** Delete a specific search history record */
  export const deleteSearchHistory = async (searchHistoryId: string): Promise<void> => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axiosInstance.delete(`/search-history/${searchHistoryId}`, { headers });

      return response.data; // Assuming the backend returns a confirmation of the removal
    } catch (error) {
      console.error("Error deleting search history:", error);
      throw error;
    }
  };
export const fetchMostVisited = async (): Promise<{ success: boolean; data: IProperty[] }> => {
    try {
        const token = localStorage.getItem("authToken");

        if (!token) {
            throw new Error("Authentication token not found");
        }

        const headers = {
            Authorization: `Bearer ${token}`,
        };

        const response = await axiosInstance.get('/insights/most-visited', { headers });
        return response.data;
    } catch (error) {
        console.error("Error fetching most visited:", error);
        throw error;
    }
};

export const fetchMostFavorited = async (): Promise<{ success: boolean; data: IFavoritedProperty[] }> => { 
    try {
        const token = localStorage.getItem("authToken");

        if (!token) {
            throw new Error("Authentication token not found");
        }

        const headers = {
            Authorization: `Bearer ${token}`,
        };

        const response = await axiosInstance.get('/insights/most-favorited', { headers });
        return response.data;
    } catch (error) {
        console.error("Error fetching most favorited:", error);
        throw error;
    }
};

export const fetchMostApplied = async (): Promise<{ success: boolean; data: IAppliedProperty[] }> => { 
    try {
        const token = localStorage.getItem("authToken");

        if (!token) {
            throw new Error("Authentication token not found");
        }

        const headers = {
            Authorization: `Bearer ${token}`,
        };

        const response = await axiosInstance.get('/insights/most-applied', { headers });
        return response.data;
    } catch (error) {
        console.error("Error fetching most applied:", error);
        throw error;
    }
};

export const fetchPropertyCounts = async (): Promise<{ success: boolean; data: { Approved: number; Pending: number; Rejected: number } }> => {
    try {
        const token = localStorage.getItem("authToken");

        if (!token) {
            throw new Error("Authentication token not found");
        }

        const headers = {
            Authorization: `Bearer ${token}`,
        };

        const response = await axiosInstance.get('/insights/property-counts', { headers });
        return response.data;
    } catch (error) {
        console.error("Error fetching property counts:", error);
        throw error;
    }
};

export const fetchUserCounts = async (): Promise<{ success: boolean; data: { Student: number; Landlord: number; Moderator: number } }> => {
    try {
        const token = localStorage.getItem("authToken");

        if (!token) {
            throw new Error("Authentication token not found");
        }

        const headers = {
            Authorization: `Bearer ${token}`,
        };

        const response = await axiosInstance.get('/insights/user-counts', { headers });
        return response.data;
    } catch (error) {
        console.error("Error fetching user counts:", error);
        throw error;
    }
};
