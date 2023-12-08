import { Routes, Route } from 'react-router-dom';
import './App.scss'
import Home from './Pages/Home'
import About from './Pages/About'
import DisplayText from './Pages/DisplayTest';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element = {<Home />}/>
        <Route path="/about" element = {<About />}/>
        <Route path="/display/:text" element = {<DisplayText />}/>
      </Routes>
    </>
  );
}

export default App