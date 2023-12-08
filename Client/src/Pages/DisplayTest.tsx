import './displaytest.scss'
import Navbar from '../Components/Navbar'

import { useParams } from 'react-router-dom';

function DisplayText() {

    const { text } = useParams();
    console.log(useParams())

    return (
        <>
            <Navbar />
            <h1>Display Test for URL Information</h1>
            <p> {text} </p>
        </>
    );
}

export default DisplayText