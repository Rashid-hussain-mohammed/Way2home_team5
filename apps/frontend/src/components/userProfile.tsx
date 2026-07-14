import React, { useEffect, useState } from "react";
import "../App.css";
import { getUserById, updateUserById } from "../api";
import { getPlaceholderAvatar } from "../utils";


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




const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});


  useEffect(() => {
    const fetchProfileData = async () => {
      const userId = localStorage.getItem("userId");
      console.log(userId);


      try {
        const res = await getUserById(userId || "");
        console.log(res);
        setProfileData(res.data);
        setFormData(res.data); // Initialize formData with fetched data
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };


    fetchProfileData();
  }, []);


  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };


  const handleSave = async () => {
    const userId = localStorage.getItem("userId");

    // Validate required fields
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.birthDate ||
      !formData.gender ||
      !formData.role ||
      !formData.email
    ) {
      alert(
        "First Name, Last Name, Date of Birth, Gender, Role, and Email are required."
      );
      return;
    }

    // Filter out parameters that should not be updated
    const filteredFormData: Partial<UserProfile> = (({
      firstName,
      lastName,
      email,
      gender,
      birthDate,
      phone,
      role,
      about,
    }) => ({
      firstName,
      lastName,
      email,
      gender,
      birthDate,
      phone,
      role,
      about,
    }))(formData);

    try {
      if (!userId) throw new Error("User ID not found");

      // Use the filteredFormData for the update
      await updateUserById(userId, filteredFormData);

      // Update profileData with new changes
      setProfileData((prev) => ({
        ...prev!,
        ...filteredFormData,
      }));
      setIsEditing(false);
    } catch (error) {
      alert(`Failed to update profile: ${error}`);
    }
  };


  const buttonStyles = "w-full px-6 py-2 bg-black text-white border-2 border-black rounded-lg hover:bg-yellow-600 transition duration-300";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            My Profile
          </h2>


          {profileData && (
            <div className="space-y-6">
              <div className="flex justify-center mb-6">
                <img
                  src={profileData.avatar || getPlaceholderAvatar(profileData.gender)}
                  alt="User Avatar"
                  className="rounded-full w-32 h-32 border-4 border-gray-200"
                />
              </div>


              <div className="grid grid-cols-1 gap-4">
                {isEditing ? (
                  <>
                    <div className="pb-2">
                      <label className="text-sm text-gray-500">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName || ""}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>


                    <div className="pb-2">
                      <label className="text-sm text-gray-500">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName || ""}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>


                    <div className="pb-2">
                      <label className="text-sm text-gray-500">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ""}
                        disabled
                        className="w-full border rounded px-3 py-2 hover:cursor-not-allowed"
                      />
                    </div>


                    <div className="pb-2">
                      <label className="text-sm text-gray-500">Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone || ""}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>


                    <div className="pb-2">
                    <label className="text-sm text-gray-500">Date of Birth</label>
                    <input
                        type="date"
                        name="birthDate"
                        value={
                        formData.birthDate
                            ? new Date(formData.birthDate).toISOString().split("T")[0]
                            : ""
                        }
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2"
                    />
                    </div>

                    <div className="pb-2">
                      <label className="text-sm text-gray-500">Gender</label>
                      <input
                        type="text"
                        name="gender"
                        value={formData.gender || ""}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>


                    <div className="pb-2">
                      <label className="text-sm text-gray-500">Role</label>
                      <input
                        type="text"
                        name="role"
                        value={formData.role || ""}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>


                    <div className="pb-2">
                      <label className="text-sm text-gray-500">About</label>
                      <textarea
                        name="about"
                        value={formData.about || ""}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="border-b pb-2">
                      <div className="text-sm text-gray-500">First Name</div>
                      <div className="text-lg font-medium text-gray-900">
                        {profileData.firstName}
                      </div>
                    </div>


                    <div className="border-b pb-2">
                      <div className="text-sm text-gray-500">Last Name</div>
                      <div className="text-lg font-medium text-gray-900">
                        {profileData.lastName}
                      </div>
                    </div>


                    <div className="border-b pb-2">
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="text-lg font-medium text-gray-900">
                        {profileData.email}
                      </div>
                    </div>


                    <div className="border-b pb-2">
                      <div className="text-sm text-gray-500">Phone Number</div>
                      <div className="text-lg font-medium text-gray-900">
                        {profileData.phone || "Not Provided"}
                      </div>
                    </div>


                    <div className="border-b pb-2">
                      <div className="text-sm text-gray-500">Date of Birth</div>
                      <div className="text-lg font-medium text-gray-900">
                        {new Date(profileData.birthDate).toLocaleDateString()}
                      </div>
                    </div>


                    <div className="border-b pb-2">
                      <div className="text-sm text-gray-500">Gender</div>
                      <div className="text-lg font-medium text-gray-900">
                        {profileData.gender}
                      </div>
                    </div>


                    <div className="border-b pb-2">
                      <div className="text-sm text-gray-500">Role</div>
                      <div className="text-lg font-medium text-gray-900">
                        {profileData.role}
                      </div>
                    </div>


                    {profileData.about && (
                      <div className="border-b pb-2">
                        <div className="text-sm text-gray-500">About</div>
                        <div className="text-lg font-medium text-gray-900">
                          {profileData.about || "Not Provided"}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>


              <div className="flex justify-center space-x-4">
              {isEditing ? (
                <>
                    <button
                    onClick={handleSave}
                    className={buttonStyles}
                    >
                    Save
                    </button>
                    <button
                    onClick={() => setIsEditing(false)}
                    className={buttonStyles}
                    >
                    Cancel
                    </button>
                </>
                ) : (
                <button
                    onClick={() => setIsEditing(true)}
                    className={buttonStyles}
                >
                    Edit Profile
                </button>
                )}

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default ProfilePage;
