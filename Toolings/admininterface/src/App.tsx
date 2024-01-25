import { createSignal, type Component, Show } from 'solid-js';

import styles from './App.module.css';
import Listing from './Components/Listing';

const App: Component = () => {
  const [value, setValue] = createSignal("");

  return (
    <>
      <Show 
        when={value() !== ""}
        fallback={
          <form>

          </form>
        }
      >
        <h1>Admin Panel</h1>
        <Listing name="Listing1"/>
      </Show>
    </>
  );
};

export default App;