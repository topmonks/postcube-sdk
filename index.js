const TRANSPORT_PROVIDER_TYPES = {
  LIFTAGO: "LIFTAGO",
  AIRWAY: "AIRWAY",
  SPS: "SPS",
  VIRTUAL: "VIRTUAL",
};

module.exports = {
  TRANSPORT_PROVIDER_TYPES,
  DELIVERY: require("./delivery"),
  BOX: require("./box"),
  BLE_BOX: require("./ble-box"),
  ORGANISATION: require("./organisation"),
  StateMachine: require("./state-machine"),
  ...require("./scheme"),
};
