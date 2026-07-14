export interface ILandlordQuestionnaire {
    id: string; 
    creationDate: Date; 
    landlordId: string; 
    name: string; 
    questions: {
      question: string; 
      options: string[]; 
      correctAnswerIndex: number; 
      score: number; 
    }[]; 
  }