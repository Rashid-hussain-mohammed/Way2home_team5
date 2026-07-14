import React, { useState } from "react";
import { submitLandlordQuestionnaire } from "../../api";

const AddQuestionnairePage = () => {
  const [name, setQuestionnaireName] = useState(""); 
  const [questions, setQuestions] = useState([
    { question: "", options: [""], correctAnswerIndex: null, score: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [questionnaireId, setQuestionnaireId] = useState<string | null>(null);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: [""], correctAnswerIndex: null, score: 0 },
    ]);
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value === "" ? "" : value,  
    };
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const addOption = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].options.push("");
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    const landlordId = localStorage.getItem("userId");
    if (!landlordId) {
      alert("Landlord ID is missing. Please log in again.");
      return;
    }

    const payload = {
      landlordId,
      name, 
      questions,
    };
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const data = await submitLandlordQuestionnaire(payload);
      const questionnaireId = data.id;
      setQuestionnaireId(questionnaireId);
      localStorage.setItem("questionnaireId", questionnaireId);
      alert("Questionnaire submitted successfully!"); 
    } catch (err) {
      setSubmitError("There was an error submitting the questionnaire.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8">
      <div className="p-6 bg-white rounded-lg shadow-md">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Create a New Questionnaire</h2>
            <p className="text-sm text-gray-500">Manage your landlord questionnaires</p>
          </div>
        </div>

        {/* Questionnaire Name input */}
        <div className="p-4 mb-6 bg-white rounded-lg shadow-sm">
          <label className="block mb-2 font-medium text-gray-700">
            <strong>Questionnaire Name:</strong>
            <input
              type="text"
              value={name}
              onChange={(e) => setQuestionnaireName(e.target.value)}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring focus:ring-black focus:outline-none"
              placeholder="Enter the name of the questionnaire"
            />
          </label>

          {questions.map((q, questionIndex) => (
            <div key={questionIndex}>
              <label className="block mb-2 font-medium text-gray-700">
                <strong>Question {questionIndex + 1}:</strong>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) =>
                    handleQuestionChange(questionIndex, "question", e.target.value)
                  }
                  className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring focus:ring-black focus:outline-none"
                  placeholder="Enter your question here"
                />
              </label>

              <strong className="block mb-2 text-gray-700">Options:</strong>
              {q.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) =>
                      handleOptionChange(questionIndex, optionIndex, e.target.value)
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-black focus:outline-none"
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => addOption(questionIndex)}
                    className="px-4 py-2 text-white transition bg-black rounded-lg hover:bg-yellow-600"
                  >
                    +
                  </button>
                </div>
              ))}

<strong>Correct Answer:</strong>
  <select
    value={q.correctAnswerIndex !== null && q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : ""}
    onChange={(e) =>
      handleQuestionChange(
        questionIndex,
        "correctAnswerIndex",
        e.target.value === "" ? "" : parseInt(e.target.value, 10) 
      )
    }
    className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring focus:ring-black focus:outline-none"
    disabled={q.options.length === 0}
  >
    <option value="" disabled>
      Select an answer
    </option>
    {q.options.map((option, optionIndex) => (
      <option key={optionIndex} value={optionIndex}>
        {option}
      </option>
    ))}
  </select>

              <label className="block mb-2 font-medium text-gray-700">
                <strong>Score:</strong>
                <input
                  type="number"
                  value={q.score}
                  onChange={(e) =>
                    handleQuestionChange(
                      questionIndex,
                      "score",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring focus:ring-black focus:outline-none"
                  placeholder="Enter score for this question"
                />
              </label>
            </div>
          ))}
        </div>

        {/* Submit Section */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={addQuestion}
            className="px-6 py-3 text-white transition bg-black rounded-lg hover:bg-yellow-600"
          >
            Add Question
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-3 text-white transition bg-black rounded-lg hover:bg-yellow-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Questionnaire"}
          </button>
        </div>

        {submitError && (
          <p className="mt-4 text-center text-red-600">{submitError}</p>
        )}
        {questionnaireId && (
          <div className="mt-6 text-center text-green-600">
            <h3 className="text-lg font-semibold">
              Questionnaire Submitted Successfully!
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddQuestionnairePage;
