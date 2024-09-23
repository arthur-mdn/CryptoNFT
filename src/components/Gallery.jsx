import {useEffect, useState} from "react";
import axios from "axios";

function Gallery({candyMachine}) {
    const [nftData, setNftData] = useState([]);
    let mintedNfts = localStorage.getItem('mintedNfts') || [];

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
                <h3 className={'fw-b bungee'}>Galerie de NFTs</h3>
                <div className={"fr g1 fw-w collection"}>
                    {nftData.map((nft, index) => (
                        <div key={index} className={`collection-item fr g1 ${mintedNfts.includes(nft.uri) ? 'minted-by-you' : ''}`}>
                            <img src={nft.image} alt={`NFT ${nft.name}`}/>
                            <h4 className={'fw-b'}>{nft.name}</h4>
                            {nft.minted && <p>{mintedNfts.includes(nft.uri) ? 'Dans votre portefeuille' : 'Déjà récupéré'}</p>}
                            <div className={`${nft.minted ? 'minted' : ''}`}>
                                <img src={'/ban.png'} alt={'Ban'}/>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Gallery;