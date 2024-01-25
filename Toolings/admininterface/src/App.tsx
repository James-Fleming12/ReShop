import { createSignal, type Component, Show } from 'solid-js';

import styles from './App.module.css';
import Listing from './Components/Listing';

const App: Component = () => {
  const [value, setValue] = createSignal("");

  const checkInfo = (e: Event) => {
    e.preventDefault();
    const form = e.target;
    if (!e.target) return;
    // const formData = new FormData(e.);
  }

  return (
    <>
      <Show 
        when={value() !== ""}
        fallback={
          <form onSubmit={checkInfo}>
            <label>
              Password
              <input type="text" name="passw"/>
            </label>
          </form>
        }
      >
        <h1>Admin Panel</h1>
        <Listing name=""/>
      </Show>
    </>
  );
};

export default App;