const Joi = require('joi');

const createCategorySchema = Joi.object({
  name:        Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  parentId:    Joi.number().integer().positive().optional().allow(null),
  iconUrl:     Joi.string().uri().optional().allow(null, ''),
  bannerUrl:   Joi.string().uri().optional().allow(null, ''),
  sortOrder:   Joi.number().integer().min(0).default(0),
  isActive:    Joi.boolean().default(true),
  isFeatured:  Joi.boolean().default(false),
});

const updateCategorySchema = Joi.object({
  name:        Joi.string().min(2).max(100),
  description: Joi.string().max(500).allow(null, ''),
  parentId:    Joi.number().integer().positive().allow(null),
  iconUrl:     Joi.string().uri().allow(null, ''),
  bannerUrl:   Joi.string().uri().allow(null, ''),
  sortOrder:   Joi.number().integer().min(0),
  isActive:    Joi.boolean(),
  isFeatured:  Joi.boolean(),
}).min(1);

module.exports = { createCategorySchema, updateCategorySchema };