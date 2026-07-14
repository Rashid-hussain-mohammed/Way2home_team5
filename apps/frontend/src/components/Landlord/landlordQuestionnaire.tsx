import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchQuestionnaire } from "../../api";

interface Questionnaire {
  id: string;
  name: string;
}

const LandlordQuestionnairePage = () => {
  const [createdQuestionnaires, setCreatedQuestionnaires] = useState<Questionnaire[]>([]); 
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); 
  const navigate = useNavigate();

  const fetchCreatedQuestionnaires = async () => {
    setLoading(true);
    setError(null); 
    try {
      const landlordId = localStorage.getItem("userId");
      if (!landlordId) {
        console.error("Landlord ID not found");
        setError("Landlord ID is missing. Please log in again.");
        return;
      }

      const response = await fetchQuestionnaire(landlordId);

      console.log(response);

      setCreatedQuestionnaires(response || []); 
    } catch (err) {
      console.error("Error fetching questionnaires:", err);
      setError("There was an error fetching your questionnaires.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatedQuestionnaires();
  }, []);

  const navigateToQuestionnaireDetails = (questionnaireId: string) => {
    navigate(`/questionnaire-details/${questionnaireId}`); 
  };

  return (
    <div className="py-8">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800"> My Questionnaires</h2>
            <p className="text-sm text-gray-500">Manage your questionnaires</p>
          </div>
          <button
            onClick={() => navigate("/add-questionnaire")}
            className="inline-flex items-center bg-black text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
          >
            + Add Questionnaire
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="text-center text-gray-600">
            <p>Loading your questionnaires...</p>
          </div>
        )}

        {!loading && !error && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Created Questionnaires</h3>
            {createdQuestionnaires.length === 0 ? (
              <p>No questionnaires created yet. Click the "+" button to create one.</p>
            ) : (
              <ul>
                {createdQuestionnaires.map((questionnaire) => (
                  <li key={questionnaire.id} className="mb-4">
                    <div className="p-4 bg-gray-100 rounded-lg cursor-pointer" onClick={() => navigateToQuestionnaireDetails(questionnaire.id)}>
                      <h4 className="font-semibold text-gray-700">{questionnaire.name}</h4>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandlordQuestionnairePage;
