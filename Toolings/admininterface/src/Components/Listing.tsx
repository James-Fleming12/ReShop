import "./Listing.css";

interface ListProps {
    name: string;
}

const Listing = (props: ListProps) => {
    return (
        <div class="container">  
            <h1>Listing {props.name}</h1>
        </div>
    );
};

export default Listing;