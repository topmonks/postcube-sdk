import React, { useCallback, useState } from "react";
import Button from "./components/Button";
import TextInput from "./components/TextInput";
import usePostCubeDevice from "./hooks/usePostCubeDevice";
import "./Application.css";

const validate = (unlockStringCommand) => Boolean(unlockStringCommand);

/**
 *
 * @returns
 */
function Application() {
  const [unlockStringCommand, setUnlockStringCommand] = useState("");
  const handleUnlockStringCommandChange = useCallback(
    ({ target: { value } }) => {
      setUnlockStringCommand(value);
    },
    []
  );
  const device = usePostCubeDevice();

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    if (!device) return console.error("No PostCube device");
  }, []);

  return (
    <form className="application" onSubmit={handleSubmit}>
      <h1>Unlock PostCube</h1>
      <div className="mb16">
        <TextInput
          label="Enter the Command"
          value={unlockStringCommand}
          onChange={handleUnlockStringCommandChange}
        />
      </div>
      <Button
        className="m16"
        disabled={!validate(unlockStringCommand)}
        type="submit"
      >
        Unlock
      </Button>
      <Button className="m16" secondary name="paste-and-unlock" type="submit">
        Paste & Unlock
      </Button>
    </form>
  );
}

export default Application;
