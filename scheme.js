const Joi = require("joi");
const { TRANSITION_NAME } = require("./delivery");

const SenderValidation = Joi.object({
  isSender: Joi.bool().invalid(false).required(),
}).unknown(true);

const RecipientValidation = Joi.object({
  isRecipient: Joi.bool().invalid(false).required(),
}).unknown(true);

const DeliveryPointSchema = Joi.object({
  id: Joi.string(),
  type: Joi.string().allow(""),
  address: Joi.string(),
  addressStreetNumber: Joi.string(),
  addressStreet: Joi.string(),
  addressCity: Joi.string(),
  addressRegion: Joi.string(),
  addressPSC: Joi.string(),
  addressCountry: Joi.string(),
  phoneNumber: Joi.string().allow(""),
  placeId: Joi.string(),
  description: Joi.string().allow(""),
  ownerId: Joi.string(),
  name: Joi.string(),
}).unknown(true);

const CreateSchema = Joi.object({
  meta: SenderValidation,
  create: Joi.object({
    sender: DeliveryPointSchema.required(),
    recipient: DeliveryPointSchema.required(),
    note: Joi.string().allow(""),
    code: Joi.string().required(),
    transportProvider: Joi.any(),
  }),
});

const TransitionValidationSchema = {
  [TRANSITION_NAME.UPDATE_FORM]: Joi.object({
    meta: SenderValidation,
    update: Joi.object({
      sender: DeliveryPointSchema,
      recipient: DeliveryPointSchema,
      note: Joi.string().allow(""),
      code: Joi.string(),
      transportProvider: Joi.any(),
      paymentMethod: Joi.any(),
      newCard: Joi.any(),
    }),
  }),
  [TRANSITION_NAME.PACKAGE_TAGGED]: Joi.object({
    meta: SenderValidation,
    update: Joi.allow(null),
  }),
  [TRANSITION_NAME.DELETED_BY_RECIPIENT_WITHOUT_REFUND]: Joi.object({
    meta: SenderValidation,
    update: Joi.allow(null),
  }),
  [TRANSITION_NAME.SENDER_OPENS_BOX]: Joi.object({
    meta: SenderValidation,
    update: Joi.allow(null),
  }),
  [TRANSITION_NAME.SENDER_CONFIRMS_DELIVERY]: Joi.object({
    meta: SenderValidation,
    update: Joi.allow(null),
  }),
  [TRANSITION_NAME.RECIPIENT_OPENS_BOX]: Joi.object({
    meta: RecipientValidation,
    update: Joi.allow(null),
  }),
  [TRANSITION_NAME.RECIPIENT_CONFIRMS_DELIVERY]: Joi.object({
    meta: RecipientValidation,
    update: Joi.allow(null),
  }),
};

module.exports = {
  DeliveryPointSchema,
  CreateSchema,
  TransitionValidationSchema,
};
