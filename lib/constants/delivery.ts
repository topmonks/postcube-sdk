
export enum POINT_TYPES {
    BOX     = "BOX",
    ADDRESS = "ADDRESS",
    ESHOP   = "ESHOP",
}

export enum DIRECTION {
    SENDING  = "sending",
    INCOMING = "incoming",
}

export enum STATE_NAMES {
    NONE                                      = "none",
    FORM_IN_PROGRESS                          = "FORM_IN_PROGRESS",
    PAYMENT_IN_PROGRESS                       = "PAYMENT_IN_PROGRESS",
    PAID                                      = "PAID",
    DELETED_WITHOUT_REFUND                    = "DELETED_WITHOUT_REFUND",
    READY_FOR_BOX                             = "READY_FOR_BOX",
    PACKAGE_IN_SENDER_BOX                     = "PACKAGE_IN_SENDER_BOX",
    PACKAGE_WAITING_FOR_DELIVERY              = "PACKAGE_WAITING_FOR_DELIVERY",
    DELIVERY_ACCEPTED_BY_TRANSPORT_COMPANY    = "DELIVERY_ACCEPTED_BY_TRANSPORT_COMPANY",
    SENDER_BOX_OPENED_BY_TRANSPORT_COMPANY    = "SENDER_BOX_OPENED_BY_TRANSPORT_COMPANY",
    PACKAGE_TAKEOVER_BY_TRANSPORT_COMPANY     = "PACKAGE_TAKEOVER_BY_TRANSPORT_COMPANY",
    RECIPIENT_BOX_OPENED_BY_TRANSPORT_COMPANY = "RECIPIENT_BOX_OPENED_BY_TRANSPORT_COMPANY",
    PACKAGE_IN_RECIPIENT_BOX                  = "PACKAGE_IN_RECIPIENT_BOX",
    RECIPIENT_BOX_OPENED_BY_RECIPIENT         = "RECIPIENT_BOX_OPENED_BY_RECIPIENT",
    PACKAGE_CONFIRMED_BY_RECIPIENT            = "PACKAGE_CONFIRMED_BY_RECIPIENT",
}

export enum TRANSITION_NAME {
    UPDATE_FORM                                  = "updateForm",
    PAYMENT_ATTEMPT                              = "paymentAttempt",
    DELETED_BY_RECIPIENT_WITHOUT_REFUND          = "deletedByRecipientWithoutRefund",
    SUCCESSFUL_PAYMENT                           = "successfulPayment",
    FAILED_PAYMENT                               = "failedPayment",
    PACKAGE_TAGGED                               = "packageTagged",
    SENDER_OPENS_BOX                             = "senderOpensBox",
    SENDER_CONFIRMS_DELIVERY                     = "senderConfirmsDelivery",
    TRANSPORT_COMPANY_ACCEPTS                    = "transportCompanyAccepts",
    TRANSPORT_COMPANY_OPENS_SENDER_BOX           = "transportCompanyOpensSenderBox",
    TRANSPORT_COMPANY_CONFIRMS_PACKAGE_TAKEOVER  = "transportCompanyConfirmsPackageTakeover",
    TRANSPORT_COMPANY_OPENS_RECIPIENT_BOX        = "transportCompanyOpensRecipientBox",
    TRANSPORT_COMPANY_CONFIRMS_PACKAGE_DELIVERED = "transportCompanyConfirmsPackageDelivered",
    RECIPIENT_OPENS_BOX                          = "recipientOpensBox",
    RECIPIENT_CONFIRMS_DELIVERY                  = "recipientConfirmsDelivery",
}

export const STATE_VISIBILITY = {
    DELETED_BY_SENDER: [
        STATE_NAMES.DELETED_WITHOUT_REFUND,
    ],
    RECIPIENT: [
        STATE_NAMES.PACKAGE_WAITING_FOR_DELIVERY,
        STATE_NAMES.DELIVERY_ACCEPTED_BY_TRANSPORT_COMPANY,
        STATE_NAMES.SENDER_BOX_OPENED_BY_TRANSPORT_COMPANY,
        STATE_NAMES.PACKAGE_TAKEOVER_BY_TRANSPORT_COMPANY,
        STATE_NAMES.RECIPIENT_BOX_OPENED_BY_TRANSPORT_COMPANY,
        STATE_NAMES.PACKAGE_IN_RECIPIENT_BOX,
        STATE_NAMES.RECIPIENT_BOX_OPENED_BY_RECIPIENT,
        STATE_NAMES.PACKAGE_CONFIRMED_BY_RECIPIENT,
    ],
    MESSENGER_DELIVERED: [
        STATE_NAMES.PACKAGE_IN_RECIPIENT_BOX,
        STATE_NAMES.RECIPIENT_BOX_OPENED_BY_RECIPIENT,
        STATE_NAMES.PACKAGE_CONFIRMED_BY_RECIPIENT,
    ],
    HISTORY: [
        STATE_NAMES.PACKAGE_CONFIRMED_BY_RECIPIENT,
    ],
}
