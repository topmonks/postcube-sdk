const fs = require("fs");
const _visualize = require("javascript-state-machine/lib/visualize");

const StateMachine = require("../state-machine");

fs.writeFileSync("fsm.dot", _visualize(StateMachine()), { encoding: "utf-8" });
