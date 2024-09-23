import {useEffect, useState} from "react";
import axios from "axios";

function Gallery({candyMachine}) {
    const [nftData, setNftData] = useState([]);

    useEffect(() => {
        const fetchNftData = async () => {
            const data = await Promise.all(candyMachine.items.map(async (nft) => {
                const response = await axios.get(nft.uri);
                return {...nft, image: response.data.image};
            }));
            setNftData(data);
        };

        fetchNftData();
    }, [candyMachine]);

    return (
        <div>
            <div className={"p1 card fc g1"}>
                <h3 className={'fw-b'}>Collection Gallery</h3>
                <div className={"fc g1"}>
                    {nftData.map((nft, index) => (
                        <div key={index} className={'collection-item fr g1'}>
                            <img src={nft.image} alt={`NFT ${nft.name}`}/>
                            <div className={"fc ai-fs"}>
                                <h4 className={'fw-b'}>{nft.name}</h4>
                                {nft.minted && <p className={'minted'}>Minted</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Gallery;