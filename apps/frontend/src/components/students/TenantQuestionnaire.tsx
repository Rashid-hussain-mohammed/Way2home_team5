import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchTenantQuestionnaire, submitTenantQuestionnaire } from "../../api";
import { useNavigate } from "react-router-dom";

interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number | null;
  score: number;
}

const TenantQuestionnaire: React.FC = () => {
  const { landlordQuestionnaireId, propertyId } = useParams<{
    landlordQuestionnaireId?: string;
    propertyId?: string;
  }>();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [tenantScore, setTenantScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const landlordId = localStorage.getItem("userId");
        if (!landlordId) {
          console.error("Landlord ID not found");
          setSubmitError("Landlord ID is missing. Please log in again.");
          return;
        }

        if (!landlordQuestionnaireId) {
          setSubmitError("Questionnaire ID is missing.");
          return;
        }

        const questionnaire = await fetchTenantQuestionnaire(
          landlordQuestionnaireId
        );
        if (questionnaire && questionnaire.questions) {
          setQuestions(questionnaire.questions);
          setAnswers(new Array(questionnaire.questions.length).fill(null));
        }
      } catch (error) {
        setSubmitError("An error occurred while fetching the questionnaire.");
      }
    };

    fetchQuestions();
  }, [landlordQuestionnaireId]);

  const handleAnswerChange = (
    questionIndex: number,
    selectedOptionIndex: number
  ) => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = selectedOptionIndex;
    setAnswers(updatedAnswers);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      if (!landlordQuestionnaireId) {
        setSubmitError("Questionnaire ID is missing.");
        setIsSubmitting(false);
        return;
      }

      const userId = localStorage.getItem("userId");
      if (!userId) {
        setSubmitError("User ID is missing.");
        setIsSubmitting(false);
        return;
      }

      const filteredAnswers = answers.filter(
        (answer) => answer !== null
      ) as number[];

      const payload = {
        landlordQuestionnaireId,
        propertyId,
        userId,
        answers: filteredAnswers,
      };

      const result = await submitTenantQuestionnaire(payload);

      if (
        result &&
        result.tenantQuestionnaire &&
        result.tenantQuestionnaire.tenantScore !== undefined
      ) {
        setTenantScore(result.tenantQuestionnaire.tenantScore);
        setIsRedirecting(true);
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setSubmitError("Error: Tenant score not found in the response.");
      }
    } catch (error) {
      setSubmitError("An error occurred while submitting the questionnaire.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl p-6 mx-auto bg-gray-100 rounded-lg shadow-md">
      <h1 className="mb-6 text-2xl font-semibold text-center text-gray-800">
        Tenant Questionnaire
      </h1>

      {submitError && (
        <p className="mt-4 text-center text-red-600">{submitError}</p>
      )}

      {questions.length === 0 ? (
        <p className="text-center text-gray-600">Loading questions...</p>
      ) : (
        questions.map((question, index) => (
          <div key={index} className="p-4 mb-6 bg-white rounded-lg shadow-sm">
            <label className="block mb-2 font-medium text-gray-700">
              <strong>Question {index + 1}:</strong>
              <p>{question.question}</p>
            </label>

            <strong className="block mb-2 text-gray-700">Options:</strong>
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2 mb-3">
                <input
                  type="radio"
                  id={`q${index}-option${optionIndex}`}
                  name={`question-${index}`}
                  value={optionIndex}
                  checked={answers[index] === optionIndex}
                  onChange={() => handleAnswerChange(index, optionIndex)}
                  className="form-radio"
                />
                <label
                  htmlFor={`q${index}-option${optionIndex}`}
                  className="text-gray-700"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        ))
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-3 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
          disabled={isSubmitting || answers.includes(null)}
        >
          {isSubmitting ? "Submitting..." : "Submit Questionnaire"}
        </button>
      </div>

      {isRedirecting ? (
        <p className="mt-6 text-center text-lg font-bold text-green-600">
          Your response has been recorded! <br />
          Redirecting to homepage in 3 seconds...
        </p>
      ) : (
        tenantScore >= 0 && (
          <div className="mt-6 text-center text-green-600">
            <h3 className="text-lg font-semibold">
              Your Score: {tenantScore}/
              {questions.reduce((acc, q) => acc + q.score, 0)}
            </h3>
            <p>Thank you for completing the questionnaire!</p>
          </div>
        )
      )}
    </div>
  );
};

export default TenantQuestionnaire;
