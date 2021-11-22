"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransitionValidationSchema = exports.CreateSchema = exports.DeliveryPointSchema = exports.RecipientValidationSchema = exports.SenderValidationSchema = void 0;
const joi = require("joi");
const delivery_1 = require("./delivery");
exports.SenderValidationSchema = joi.object({
    isSender: joi.bool().invalid(false).required(),
}).unknown(true);
exports.RecipientValidationSchema = joi.object({
    isRecipient: joi.bool().invalid(false).required(),
}).unknown(true);
exports.DeliveryPointSchema = joi.object({
    id: joi.string(),
    type: joi.string().allow(""),
    address: joi.string(),
    addressStreetNumber: joi.string(),
    addressStreet: joi.string(),
    addressCity: joi.string(),
    addressRegion: joi.string(),
    addressPSC: joi.string(),
    addressCountry: joi.string(),
    phoneNumber: joi.string().allow(""),
    placeId: joi.string(),
    description: joi.string().allow(""),
    ownerId: joi.string(),
    name: joi.string(),
}).unknown(true);
exports.CreateSchema = joi.object({
    meta: exports.SenderValidationSchema,
    create: joi.object({
        sender: exports.DeliveryPointSchema.required(),
        recipient: exports.DeliveryPointSchema.required(),
        note: joi.string().allow(""),
        code: joi.string().required(),
        transportProvider: joi.any(),
    }),
});
exports.TransitionValidationSchema = {
    [delivery_1.TRANSITION_NAME.UPDATE_FORM]: joi.object({
        meta: exports.SenderValidationSchema,
        update: joi.object({
            sender: exports.DeliveryPointSchema,
            recipient: exports.DeliveryPointSchema,
            note: joi.string().allow(""),
            code: joi.string(),
            transportProvider: joi.any(),
            paymentMethod: joi.any(),
            newCard: joi.any(),
        }),
    }),
    [delivery_1.TRANSITION_NAME.PACKAGE_TAGGED]: joi.object({
        meta: exports.SenderValidationSchema,
        update: joi.allow(null),
    }),
    [delivery_1.TRANSITION_NAME.DELETED_BY_RECIPIENT_WITHOUT_REFUND]: joi.object({
        meta: exports.SenderValidationSchema,
        update: joi.allow(null),
    }),
    [delivery_1.TRANSITION_NAME.SENDER_OPENS_BOX]: joi.object({
        meta: exports.SenderValidationSchema,
        update: joi.allow(null),
    }),
    [delivery_1.TRANSITION_NAME.SENDER_CONFIRMS_DELIVERY]: joi.object({
        meta: exports.SenderValidationSchema,
        update: joi.allow(null),
    }),
    [delivery_1.TRANSITION_NAME.RECIPIENT_OPENS_BOX]: joi.object({
        meta: exports.RecipientValidationSchema,
        update: joi.allow(null),
    }),
    [delivery_1.TRANSITION_NAME.RECIPIENT_CONFIRMS_DELIVERY]: joi.object({
        meta: exports.RecipientValidationSchema,
        update: joi.allow(null),
    }),
};
