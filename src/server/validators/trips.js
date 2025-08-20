import { ValidationError } from '../middlewares/error.js';

const tripSchema = {
  title: {
    required: true,
    type: 'string',
    minLength: 3,
    maxLength: 100
  },
  description: {
    required: true,
    type: 'string',
    minLength: 10,
    maxLength: 1000
  },
  location: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 100
  },
  start_date: {
    required: true,
    type: 'date'
  },
  end_date: {
    required: true,
    type: 'date'
  },
  difficulty: {
    required: true,
    type: 'string',
    enum: ['easy', 'moderate', 'hard', 'expert']
  },
  price: {
    required: true,
    type: 'number',
    min: 0
  },
  seats_total: {
    required: true,
    type: 'number',
    min: 1,
    max: 100
  }
};

const validateTrip = (req, res, next) => {
  try {
    const { body } = req;
    const errors = [];

    // Validate required fields
    for (const [field, rules] of Object.entries(tripSchema)) {
      const value = body[field];

      // Check if required field is present
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      // Skip validation if field is not present and not required
      if (value === undefined || value === null) {
        continue;
      }

      // Type validation
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
      } else if (rules.type === 'number' && typeof value !== 'number') {
        errors.push(`${field} must be a number`);
      } else if (rules.type === 'date') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push(`${field} must be a valid date`);
        }
      }

      // String length validation
      if (rules.type === 'string' && typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters long`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be no more than ${rules.maxLength} characters long`);
        }
      }

      // Number range validation
      if (rules.type === 'number' && typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${field} must be no more than ${rules.max}`);
        }
      }

      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }
    }

    // Validate date range
    if (body.start_date && body.end_date) {
      const startDate = new Date(body.start_date);
      const endDate = new Date(body.end_date);
      
      if (startDate >= endDate) {
        errors.push('End date must be after start date');
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }

    next();
  } catch (error) {
    next(error);
  }
};

export { validateTrip };
