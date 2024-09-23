import Gallery from "./Gallery.jsx";
import MintNFT from "./MintNFT.jsx";
import CreateCollection from "./CreateCollection.jsx";
import {useEffect, useState} from "react";
import axios from "axios";

const NFT = () => {
    const nftId = 'QmSNgA6j77sViapVLuqBAZ4ie5KWMQVPpFj3oSjxyT5BBs'
    const [nftCollection, setNftCollection] = useState(null);

    useEffect(() => {
        axios.get(`https://ipfs.io/ipfs/${nftId}`)
            .then(res => {
                setNftCollection(res.data)
                setNftCollection({...res.data, uri: `https://ipfs.io/ipfs/${nftId}`})
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
