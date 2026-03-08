const Joi = require('joi');

/**
 * validate(schema, target?)
 * Middleware factory for Joi request validation.
 * target: 'body' | 'query' | 'params'  (default: 'body')
 *
 * Usage:
 *   router.post('/', validate(createProductSchema), controller)
 *   router.get('/',  validate(listQuerySchema, 'query'), controller)
 */
function validate(schema, target = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field:   d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Replace request data with validated & sanitized value
    req[target] = value;
    next();
  };
}

// ─────────────────────────────────────────────
//  Shared / reusable schemas
// ─────────────────────────────────────────────

const paginationSchema = Joi.object({
  page:  Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort:  Joi.string().optional(),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

const idParamSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().uuid()
  ).required(),
});

module.exports = { validate, paginationSchema, idParamSchema };