import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [interactions, setInteractions] = useState([])
  const [input, setInput] = useState("")

  async function submitAction(evt) {
    evt.preventDefault();
    const response = await fetch("/act")
    const jsonRes = await response.json()
    const actionList = interactions.concat([jsonRes])

    setInteractions(actionList)
  }

  return (
    <>
      <div id="display">
        {interactions.length ? interactions.map((interaction, i) => <section key={i}><p>{interaction.request}</p><p >{interaction.display}</p></section>) : <p>Grettings adventurer! What is your name?</p>}
      </div>
    <form onSubmit={submitAction}>
      <label id="blink-cursor" htmlFor="input">{">_"}</label>
      <input name="input" type="text" placeholder="please type your actions in the format [action] [item]" value={input} onChange={(evt) => {setInput(evt.target.value)}}/>
    </form>
    </>
  )
}

export default App
