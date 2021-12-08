
import * as Joi from 'joi'
const joi = (Joi as any)?.default ?
    (Joi as any).default : Joi

import {
    DELIVERY_TRANSITION_NAME,
} from './delivery'

export const SenderValidationSchema = joi.object({
    isSender: joi.bool().invalid(false).required(),
}).unknown(true)

export const RecipientValidationSchema = joi.object({
    isRecipient: joi.bool().invalid(false).required(),
}).unknown(true)

export const DeliveryPointSchema = joi.object({
    id:                  joi.string(),
    type:                joi.string().allow(''),
    address:             joi.string(),
    addressStreetNumber: joi.string(),
    addressStreet:       joi.string(),
    addressCity:         joi.string(),
    addressRegion:       joi.string(),
    addressPSC:          joi.string(),
    addressCountry:      joi.string(),
    phoneNumber:         joi.string().allow(''),
    placeId:             joi.string(),
    description:         joi.string().allow(''),
    ownerId:             joi.string(),
    name:                joi.string(),
}).unknown(true)

export const CreateSchema = joi.object({
    meta: SenderValidationSchema,
    create: joi.object({
        sender:            DeliveryPointSchema.required(),
        recipient:         DeliveryPointSchema.required(),
        note:              joi.string().allow(''),
        code:              joi.string().required(),
        transportProvider: joi.any(),
    }),
})

export const TransitionValidationSchema = {
    [DELIVERY_TRANSITION_NAME.UPDATE_FORM]: joi.object({
        meta: SenderValidationSchema,
        update: joi.object({
            sender:            DeliveryPointSchema,
            recipient:         DeliveryPointSchema,
            note:              joi.string().allow(''),
            code:              joi.string(),
            transportProvider: joi.any(),
            paymentMethod:     joi.any(),
            newCard:           joi.any(),
        }),
    }),
    [DELIVERY_TRANSITION_NAME.PACKAGE_TAGGED]: joi.object({
        meta: SenderValidationSchema,
        update: joi.allow(null),
    }),
    [DELIVERY_TRANSITION_NAME.DELETED_BY_RECIPIENT_WITHOUT_REFUND]: joi.object({
        meta: SenderValidationSchema,
        update: joi.allow(null),
    }),
    [DELIVERY_TRANSITION_NAME.SENDER_OPENS_BOX]: joi.object({
        meta: SenderValidationSchema,
        update: joi.allow(null),
    }),
    [DELIVERY_TRANSITION_NAME.SENDER_CONFIRMS_DELIVERY]: joi.object({
        meta: SenderValidationSchema,
        update: joi.allow(null),
    }),
    [DELIVERY_TRANSITION_NAME.RECIPIENT_OPENS_BOX]: joi.object({
        meta: RecipientValidationSchema,
        update: joi.allow(null),
    }),
    [DELIVERY_TRANSITION_NAME.RECIPIENT_CONFIRMS_DELIVERY]: joi.object({
        meta: RecipientValidationSchema,
        update: joi.allow(null),
    }),
}
