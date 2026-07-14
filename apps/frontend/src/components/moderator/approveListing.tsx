import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ApproveListing: React.FC = () => {
  const [imageIndex, setImageIndex] = useState(0);
  const imageIds = [1, 2, 3, 4, 5];

  const handleNext = () => {
    setImageIndex((prevIndex) => (prevIndex + 1) % imageIds.length);
  };

  const handlePrevious = () => {
    setImageIndex((prevIndex) => (prevIndex - 1 + imageIds.length) % imageIds.length);
  };

  return (
    <div className="flex flex-col bg-gray-100">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-4 flex justify-between items-center px-6">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gray-300"></div>
            <div>
              <div className="text-gray-700 text-xl font-medium">Moderator Dashboard</div>
              <div className="text-gray-500 text-sm">Welcome back, Julia Braun</div>
            </div>
          </div>
          <nav className="flex space-x-8">
            <Link to="/" className="py-3 text-blue-600 border-b-2 border-blue-600 font-medium">
              Listings
            </Link>
            <Link to="/students" className="py-3 text-gray-600 hover:text-blue-600">
              Students
            </Link>
            <Link to="/landlords" className="py-3 text-gray-600 hover:text-blue-600">
              Landlords
            </Link>
            <Link to="/profile" className="py-3 text-gray-600 hover:text-blue-600">
              My Profile
            </Link>
          </nav>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow-sm max-w-7xl mx-auto border border-gray-200">
          <div className="bg-gray-200 p-4 mb-6 rounded-lg">
            <h2 className="text-lg font-semibold">Listing Details</h2>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-700">2-Bedroom Apartment near Campus</h1>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">Review Pending</div>
              <div className="space-x-3">
                <button className="px-4 py-2 mr-2 text-black rounded-lg bg-[#dcefea] border border-[#b5d7e3]">
                  Approve
                </button>
                <button className="px-4 py-2 mr-2 text-black rounded-lg bg-[#fadcdc] border border-[#f7b6b6]">
                  Reject
                </button>
                <button className="px-4 py-2 text-black rounded-lg bg-[#eef0ef] border border-[#c9d5d5]">
                  Contact
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Description</label>
            <textarea
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              rows={3}
              placeholder="A detailed description of the property"
              readOnly
            ></textarea>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Address</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Address of the property"
              readOnly
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Rent</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="The total rent"
              readOnly
            />
          </div>

          <div className="flex mb-6 space-x-6">
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-2">Property Type</label>
              <select
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                value="sharedApartment"
                disabled
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="sharedApartment">Shared Apartment</option>
                <option value="sharedHouse">Shared House</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-2">Availability Date</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="12-03-2024 TO 12-03-2025"
                readOnly
              />
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mt-6">
            <div className="text-gray-500 text-center">
              <div className="relative">
                <img
                  src={`https://picsum.photos/id/${imageIds[imageIndex]}/400/300`}
                  alt="Property"
                  className="mx-auto"
                  style={{ width: '80%', maxWidth: '500px' }}
                />
                <button
                  onClick={handlePrevious}
                  className="absolute left-20 top-1/2 transform -translate-y-1/2 px-4 py-2 text-white bg-gray-600 rounded-md"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-20 top-1/2 transform -translate-y-1/2 px-4 py-2 text-white bg-gray-600 rounded-md"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApproveListing;
