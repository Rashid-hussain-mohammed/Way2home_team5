import { body } from "express-validator";

// Validator for checking required fields and structure of the request body
export const validateLandlordQuestionnaire = [
  body('id').isString().withMessage('id must be a valid UUID'),
  body('creationDate').isISO8601().withMessage('creationDate must be a valid date'),
  body('landlordId').isUUID().withMessage('landlordId must be a valid UUID'),
  body('questions').isArray().withMessage('questions must be an array'),
  body('questions.*.question').notEmpty().withMessage('question must not be empty'),
  body('questions.*.options').isArray().withMessage('options must be an array'),
  body('questions.*.options.*').notEmpty().withMessage('options must not be empty'),
  body('questions.*.correctAnswerIndex').isInt({ min: 0 }).withMessage('correctAnswerIndex must be a valid index'),
  body('questions.*.score').isInt({ min: 0 }).withMessage('score must be a positive number'),
];
