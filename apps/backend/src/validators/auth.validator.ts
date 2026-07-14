import { body } from 'express-validator';

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address'),
 body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

export const signupValidation = [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address')
      .custom((email, { req }) => {
        if (req.body.role === 'Student' && !email.endsWith('.hs-fulda.de')) {
          throw new Error('Students must use an email ending with .hs-fulda.de');
        }
        return true;
      }),
  
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ];
