import type { Component } from 'solid-js';

import styles from './App.module.css';
import Listing from './Components/Listing';

const App: Component = () => {
  return (
    <>
      <h1>Admin Panel</h1>
      <Listing />
    </>
  );
};

export default App;