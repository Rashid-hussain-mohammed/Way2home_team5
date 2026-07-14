import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchTenantQuestionnaire } from "../../api"; 

interface Option {
  score: number;
  options: string[];
  question: string;
  correctAnswerIndex: number;
}

interface Questionnaire {
  id: string;
  creationDate: string;
  landlordId: string;
  name: string;
  questions: Option[];
}

const QuestionnaireDetailsPage = () => {
  const { id: landlordQuestionnaireId } = useParams<{ id: string }>();
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const landlordId = localStorage.getItem("userId");
        if (!landlordId) {
          console.error("Landlord ID not found");
          setError("Landlord ID is missing. Please log in again.");
          setLoading(false);
          return;
        }

        if (!landlordQuestionnaireId) {
          setError("Questionnaire ID is missing.");
          setLoading(false);
          return;
        }

        const questionnaireData = await fetchTenantQuestionnaire(landlordQuestionnaireId);
        if (questionnaireData) {
          setQuestionnaire(questionnaireData);
        }
      } catch (fetchError) {
        console.error("Error fetching questionnaire:", fetchError);
        setError("An error occurred while fetching the questionnaire.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [landlordQuestionnaireId]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Questionnaire Details</h2>

      {loading && <p className="text-gray-600">Loading questionnaire...</p>}

      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && questionnaire && (
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Questionnaire Details</h3>

          <div className="mb-4">
            <label className="block text-gray-600 font-medium mb-2">Name:</label>
            <input
              type="text"
              value={questionnaire.name}
              disabled
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <h3 className="text-xl font-semibold text-gray-700 mb-4">Questions</h3>
          <ul className="space-y-6">
            {questionnaire.questions.map((q, index) => (
              <li key={index} className="p-4 bg-gray-100 rounded-lg border border-gray-300">
                <div className="mb-4">
                  <label className="block text-gray-600 font-medium mb-2">Question:</label>
                  <input
                    type="text"
                    value={q.question}
                    disabled
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-600 font-medium mb-2">Options:</label>
                  {q.options.map((option, optIndex) => (
                    <input
                      key={optIndex}
                      type="text"
                      value={option}
                      disabled
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                  ))}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-600 font-medium mb-2">Correct Answer Index:</label>
                  <input
                    type="text"
                    value={q.correctAnswerIndex}
                    disabled
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-2">Score:</label>
                  <input
                    type="text"
                    value={q.score}
                    disabled
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && !error && !questionnaire && (
        <p className="text-gray-600">No questionnaire details found.</p>
      )}
    </div>
  );
};

export default QuestionnaireDetailsPage;
