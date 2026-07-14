export interface ITenantQuestionnaire {
    id: string; // Unique identifier for the tenant questionnaire
    creationDate: Date; // When the tenant questionnaire was created
    landlordQuestionnaireId: string; // Reference to the associated LandlordQuestionnaire
    userId: string; // Reference to the User entity for the tenant
    answers: number[]; // Array of selected answer indexes, corresponding to the LandlordQuestionnaire questions
    tenantScore: number; // Total score achieved by the tenant based on correct answers
  }
  