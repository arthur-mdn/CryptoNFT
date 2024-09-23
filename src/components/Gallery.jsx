import { useEffect, useState } from "react";
import axios from "axios";
import { openDB } from 'idb';
import {FaSpinner} from "react-icons/fa6";

function Gallery({ candyMachine }) {
    const [nftData, setNftData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 12; // Limite de 12 requêtes par page
    let mintedNfts = localStorage.getItem('mintedNfts') || [];

    const initDB = async () => {
        return await openDB('nftGalleryDB', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('nfts')) {
                    db.createObjectStore('nfts', { keyPath: 'uri' });
                }
            },
        });
    };

    const getNftFromDB = async (db, uri) => {
        const tx = db.transaction('nfts', 'readonly');
        const store = tx.objectStore('nfts');
        return await store.get(uri);
    };

    const addNftToDB = async (db, nft) => {
        const tx = db.transaction('nfts', 'readwrite');
        const store = tx.objectStore('nfts');
        await store.put(nft);
        await tx.done;
    };

    const fetchNftData = async () => {
        setLoading(true);
        const db = await initDB();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const itemsToLoad = candyMachine.items.slice(startIndex, endIndex);

        const data = await Promise.all(itemsToLoad.map(async (nft) => {
            let nftData = await getNftFromDB(db, nft.uri);
            if (!nftData) {
                const response = await axios.get(nft.uri);
                nftData = { ...nft, image: response.data.image };
                await addNftToDB(db, nftData);
            }
            return nftData;
        }));

        setNftData(prevData => [...prevData, ...data]);
        setLoading(false);
    };

    useEffect(() => {
        fetchNftData();
    }, [currentPage, candyMachine]);

    const loadMore = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    return (
        <div>
            <div className={"p1 card fc g1"}>
                <h3 className={'fw-b bungee'}>Galerie de NFTs</h3>
                <div className={"fr g1 fw-w collection"}>
                    {nftData.map((nft, index) => (
                        <div key={index} className={`collection-item fr g1 ${mintedNfts.includes(nft.uri) ? 'minted-by-you' : ''}`}>
                            <img src={nft.image} alt={`NFT ${nft.name}`} />
                            <h4 className={'fw-b'}>{nft.name}</h4>
                            {nft.minted && <p>{mintedNfts.includes(nft.uri) ? 'Dans votre portefeuille' : 'Déjà récupéré'}</p>}
                            <div className={`${nft.minted ? 'minted' : ''}`}>
                                <img src={'/ban.png'} alt={'Ban'} />
                            </div>
                        </div>
                    ))}
                </div>
                {loading ? (
                    <p className={"bungee fs1-5"}>Chargement...</p>
                ) : (
                    <button onClick={loadMore} className="load-more-btn bungee"><FaSpinner/>Charger la suite</button>
                )}
            </div>
        </div>
    );
}

export default Gallery;