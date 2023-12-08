import {useState, useEffect} from "react";
import './home.scss'
import Navbar from '../Components/Navbar'

function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <>
      <Navbar />
      <h1>ReShop Home</h1>
      <p>{message}</p>
    </>
  );
}

export default Home