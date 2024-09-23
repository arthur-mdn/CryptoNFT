import {useState} from 'react';
import {Connection, clusterApiUrl, PublicKey} from '@solana/web3.js';
import {Metaplex, walletAdapterIdentity} from '@metaplex-foundation/js';
import {useAuth} from "../AuthContext.jsx";
import {toast} from "react-toastify";
import PropTypes from 'prop-types';

MintNFT.propTypes = {
    nftCollection: PropTypes.shape({
        nfts: PropTypes.arrayOf(PropTypes.shape({
            uri: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            description: PropTypes.string
        })).isRequired
    }).isRequired
};

function MintNFT({nftCollection}) {
    const { provider } = useAuth();
    const [randomNFT, setRandomNFT] = useState(null);
    const [loading, setLoading] = useState(false);

    const mintNFT = async () => {
        if (!provider) {
            toast.error('Please connect your Phantom wallet');
            return;
        }

        setLoading(true);
        try {
            const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
            const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(provider));

            const response = await fetch(nftCollection.uri);
            const collectionData = await response.json();
            const randomIndex = Math.floor(Math.random() * collectionData.nfts.length);
            const selectedNFT = collectionData.nfts[randomIndex];
            const collectionId = collectionData.id;
            setRandomNFT(selectedNFT);

            let collectionNft;
            try {
                collectionNft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(collectionId) });
            } catch (error) {
                toast.error('Collection NFT does not exist. Please create it before minting the NFT.');
                return;
            }

            const { nft } = await metaplex.nfts().create({
                name: `${selectedNFT.name} #${selectedNFT.edition}`,
                description: selectedNFT.description,
                uri: selectedNFT.uri,
                sellerFeeBasisPoints: selectedNFT.seller_fee_basis_points,
                collection: collectionNft.address,
            });

            await metaplex.nfts().verifyCollection({
                mintAddress: nft.address,
                collectionMintAddress: collectionNft.address,
                isSizedCollection: true,
            });


            console.log('Minted NFT:', nft);
            toast.success(`NFT successfully minted and added to collection! Mint address: ${nft.address.toString()}`);
        } catch (error) {
            console.error('Error minting NFT:', error);
            toast.error('An error occurred while minting the NFT. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div>
            <div className={"p1 card fc g1"}>
                <div className={"fc g1 ai-c"}>
                    {randomNFT ? (
                        <>
                            <img
                                src={randomNFT.image}
                                className={"nft"}
                                alt="Random NFT Preview"
                            />
                            <h4 style={{fontWeight: 'bold'}}>{randomNFT.name}</h4>
                            <p style={{color: '#6B7280'}}>{randomNFT.description}</p>
                        </>
                    ) :
                        <img src={"placeholder.png"} className={"nft"} alt="Random NFT Preview"/>
                    }
                    <button onClick={mintNFT} disabled={loading} type={'button'}>
                        {loading ? 'Minting...' : 'Mint NFT'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MintNFT;
