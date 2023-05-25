import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [interactions, setInteractions] = useState([]);
  const [input, setInput] = useState("");
  const displayRef = useRef(null)

  function scrollToBottom () {
    displayRef.current?.scrollIntoView({ behavior: "instant" })
  }

  async function submitAction(evt) {
    evt.preventDefault();
    //send form input to server-side game handler
    const response = await fetch("/act", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: input })
    });
    //parse and combine with previous input's and results
    const jsonRes = await response.json();
    const actionList = interactions.concat([jsonRes]);
    //display updated results
    setInteractions(actionList);
    //clear form
    setInput("")
  }

  useEffect(() => {
    scrollToBottom()
  }, [interactions])

  return (
    <div id="game-area">
      <div id="display">
        {interactions.length ? (
          interactions.map((interaction, i) => (
            <section key={i} className="interaction">
              <pre className="user-input"><i>{interaction.request}</i></pre>
              <pre className="action-result">{interaction.display}</pre>
            </section>
          ))
        ) : (
          <p>Greetings adventurer! What is your name?</p>
        )}
        <div ref={displayRef} />
      </div>
      <form onSubmit={submitAction}>
        <label id="blink-cursor" htmlFor="input">
          {">_ "}
        </label>
        <input
          id="input"
          type="text"
          placeholder="please type your actions in the format [action] [target]"
          value={input}
          onChange={(evt) => {
            setInput(evt.target.value);
          }}
        />
        <input type="submit" />
      </form>
    </div>
  );
}

export default App;
