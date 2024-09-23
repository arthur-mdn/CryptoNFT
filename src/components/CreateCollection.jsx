import {useState} from 'react';
import {Connection, clusterApiUrl} from '@solana/web3.js';
import {Metaplex, walletAdapterIdentity} from '@metaplex-foundation/js';
import pinataSDK from '@pinata/sdk';
import {useAuth} from "../AuthContext.jsx";
import {toast} from "react-toastify";

function CreateCollection({nftCollection}) {
    const { provider } = useAuth();
    const [loading, setLoading] = useState(false);

    const createCollection = async () => {
        if (!provider) {
            toast.error('Please connect your Phantom wallet');
            return;
        }

        setLoading(true);
        try {
            const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
            const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(provider));

            if (!nftCollection.name || !nftCollection.description || !nftCollection.uri || nftCollection.sellerFeeBasisPoints === undefined) {
                console.error('One or more properties of nftCollection are undefined:', nftCollection);
                toast.error('An error occurred while creating the collection. Please check the console for more details.');
                return;
            }

            // Créer le NFT de collection
            const { nft } = await metaplex.nfts().create({
                name: nftCollection.name,
                description: nftCollection.description,
                uri: nftCollection.uri,
                sellerFeeBasisPoints: nftCollection.seller_fee_basis_points,
                isCollection: true,
            });

            nftCollection.id = nft.address.toString();

            const pinata = new pinataSDK('8923aa66e31b89f372ea', '9d58d8384fcc4b065d79dc1d7b880ddfa664e3c6057b814300b38f0bb7d38618');

            console.log('Created collection:', nftCollection);
            toast.success(`Collection successfully created! Collection address: ${nft.address.toString()}`);

            const pinataResponse = await pinata.pinJSONToIPFS(nftCollection);
            if (pinataResponse.IpfsHash) {
                console.log(`Collection data successfully uploaded to Pinata with hash: ${pinataResponse.IpfsHash}`);
            } else {
                console.error('Failed to upload collection data to Pinata');
            }

        } catch (error) {
            console.error('Error creating collection:', error);
            toast.error('An error occurred while creating the collection. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={createCollection} disabled={loading} type={'button'}>
                {loading ? 'Creating...' : 'Create Collection'}
            </button>
        </div>
    );
}

export default CreateCollection;