import Gallery from "./Gallery.jsx";
import MintNFT from "./MintNFT.jsx";
import CreateCollection from "./CreateCollection.jsx";
import {useEffect, useState} from "react";
import axios from "axios";

const NFT = () => {
    const nftUrl = 'https://ipfs.io/ipfs/QmR6zEuBo5CDxYbqRa6NHqPGh3G2jZanPt6HFKMwZhpsqx'
    const [nftCollection, setNftCollection] = useState(null);

    useEffect(() => {
        axios.get(`${nftUrl}`)
            .then(res => {
                setNftCollection(res.data)
                setNftCollection({...res.data, uri: `${nftUrl}`})
            })
    }, []);

    return (
        <div className={"fc g1"}>
            {nftCollection && (
                <>
                    {!nftCollection.id &&
                        <CreateCollection nftCollection={nftCollection}/>
                    }
                    <MintNFT nftCollection={nftCollection}/>
                    <Gallery nftCollection={nftCollection}/>
                </>
            )}

        </div>
    );
};

export default NFT;
