import React, { useEffect, useState } from "react";
import { fetchLandlordProperties, fetchTenantsForProperty } from "../../api";
import { FaSpinner } from "react-icons/fa"; 
import { AiOutlineCloseCircle } from "react-icons/ai"; 
interface Tenant {
  name: string;
  tenantScore: number;
  propertyId: string;
}

interface Property {
  id: string;
  name: string;
}

const AppliedListingsPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPropertiesAndTenants = async () => {
      setLoading(true);

      try {
        const landlordId = localStorage.getItem("userId");
        if (!landlordId) {
          console.error("Landlord ID not found");
          setLoading(false);
          return;
        }

        const propertyResponse = await fetchLandlordProperties();
        const propertyData: Property[] = propertyResponse.data || [];
        setProperties(propertyData);

        if (propertyData.length === 0) {
          setLoading(false);
          return;
        }

        const tenantPromises = propertyData.map((property) =>
          fetchTenantsForProperty(property.id).then((data) => ({
            propertyId: property.id,
            tenants: data.tenants,
          }))
        );

        const tenantsData = await Promise.all(tenantPromises);
        const allTenants: Tenant[] = tenantsData.flatMap((tenantData) =>
          tenantData.tenants?.map((tenant: Tenant) => ({
            ...tenant,
            propertyId: tenantData.propertyId,
          })) || []
        );

        setTenants(allTenants);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching listings or tenants:", err);
        setError("Error fetching listings or tenants.");
        setLoading(false);
      }
    };

    fetchPropertiesAndTenants();
  }, []);

  return (
    <div className="py-8">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Tenants Applied to Listings
            </h2>
            <p className="text-sm text-gray-500">
              View tenants who have applied to your listings
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center text-gray-600">
            <FaSpinner className="animate-spin text-3xl" />
            <p className="ml-2">Loading listings and tenants...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded mb-4 flex justify-between items-center">
            <p>{error}</p>
            <AiOutlineCloseCircle
              className="cursor-pointer"
              onClick={() => setError("")}
            />
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-6">
            {properties.map((property) => (
              <div
                key={property.id}
                className="p-6 bg-gray-100 rounded-lg shadow-md border border-gray"
              >
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  {property.name}
                </h3>

                <div>
                  {tenants.filter((t) => t.propertyId === property.id).length ===
                  0 ? (
                    <p className="text-sm text-gray-500">
                      No tenants have applied for this property yet.
                    </p>
                  ) : (
                    <ul className="grid gap-4">
                      {tenants
                        .filter((tenant) => tenant.propertyId === property.id)
                        .map((tenant) => (
                          <li
                            key={tenant.name}
                            className="p-4 bg-white shadow rounded-lg"
                          >
                            <h4 className="text-md font-semibold text-gray-800">
                              {tenant.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Tenant Score: {tenant.tenantScore}
                            </p>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppliedListingsPage;
