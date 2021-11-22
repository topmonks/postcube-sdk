import * as joi from 'joi';
export declare const SenderValidationSchema: joi.ObjectSchema<any>;
export declare const RecipientValidationSchema: joi.ObjectSchema<any>;
export declare const DeliveryPointSchema: joi.ObjectSchema<any>;
export declare const CreateSchema: joi.ObjectSchema<any>;
export declare const TransitionValidationSchema: {
    updateForm: joi.ObjectSchema<any>;
    packageTagged: joi.ObjectSchema<any>;
    deletedByRecipientWithoutRefund: joi.ObjectSchema<any>;
    senderOpensBox: joi.ObjectSchema<any>;
    senderConfirmsDelivery: joi.ObjectSchema<any>;
    recipientOpensBox: joi.ObjectSchema<any>;
    recipientConfirmsDelivery: joi.ObjectSchema<any>;
};
