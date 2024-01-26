import { For, Show, createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
  const [curr, setCurr] = createSignal("");
  const [passw, setPass] = createSignal("");

  const [currS, setCurrS] = createSignal("");
  const [search, setSearch] = createSignal([]);

  async function validate() {
    // extra
    if (await invoke("validate", { name: curr() })) {
      setPass(curr());
    }else{

    }
  }

  return (
    <Show
      when={passw() !== ""}
      fallback={
        <div class="container">
          <form
            class="row"
            onSubmit={(e) => {
              e.preventDefault();
              validate();
            }}
          >
            <input
              id="greet-input"
              onChange={(e) => setCurr(e.currentTarget.value)}
              placeholder="Enter a name..."
            />
            <button type="submit">Greet</button>
          </form>
        </div>
      }
    >
      <h1>Admin Panel</h1>
      <form>
        <input 
          type="text"
          onChange={(e) => setCurrS(e.currentTarget.value)}
          placeholder="Search..."
        />
        <button type="submit">Submit</button>
      </form>
      <For each={search()}>
        {(item, index) => <h1>Listing</h1>}
      </For>
    </Show>
  );
}

export default App;