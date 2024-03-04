import React, { useState } from "react";

const AgentForm = () => {
  // Your code goes here
  const [agent, setAgent] = useState({
    name: "",
    description: "",
    anweisungen: "",
  });

  return (
    <form>
      <input
        type="text"
        value={agent.name}
        onChange={(e) => setAgent({ ...agent, name: e.target.value })}
        placeholder="Name"
      />
      <textarea
        value={agent.description}
        onChange={(e) => setAgent({ ...agent, description: e.target.value })}
        placeholder="Description"
      />
    </form> // JSX code for the AgentForm component
  );
};

export default AgentForm;
