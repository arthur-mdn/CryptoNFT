import React, {useState, useEffect} from 'react';
import {Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL} from '@solana/web3.js';
import {Metaplex, walletAdapterIdentity} from '@metaplex-foundation/js';
import pinataSDK from '@pinata/sdk';

const FloatingAlert = ({message, type, onClose}) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            borderRadius: '4px',
            backgroundColor: type === 'error' ? '#FEE2E2' : '#D1FAE5',
            color: type === 'error' ? '#991B1B' : '#065F46',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000,
            transition: 'opacity 0.3s ease-in-out',
        }}>
            <p style={{margin: 0}}>{message}</p>
        </div>
    );
};

const WalletStatusIndicator = ({address}) => {
    const truncatedAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '10px 15px',
            borderRadius: '20px',
            backgroundColor: '#4F46E5',
            color: 'white',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000,
        }}>
            <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                marginRight: '8px',
            }}></span>
            Wallet Connected: {truncatedAddress}
        </div>
    );
};

const MintNFTButton = () => {
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [randomNFT, setRandomNFT] = useState(null);
    const [collectionId, setCollectionId] = useState(null);

    const nftCollection = {
        id: null,
        name: "My Awesome NFT Collection",
        description: "This is a collection of unique NFTs representing various themes.",
        uri: "https://ipfs.io/ipfs/QmU9RzpWJQ3QFhD2bxvKURVFei4Nqv2HCA8uQDYUH5MABo",
        sellerFeeBasisPoints: 1,
        nfts: [
            {
                name: "My First NFT",
                symbol: "",
                seller_fee_basis_points: 1,
                description: "This is my first NFT minted with Metaplex!",
                creators: null,
                uri: "https://ipfs.io/ipfs/QmNWqAaKigBptCTuDshapsxRKw6WtQGcavoKNMXVN8CFja",
            },
            {
                name: "My Second NFT",
                symbol: "",
                seller_fee_basis_points: 1,
                description: "This is my second NFT minted with Metaplex!",
                creators: null,
                uri: "https://ipfs.io/ipfs/QmVsE9ZNnJ3ZQ3fqUvNEnUjz1VZSbdmzCLBz29QAsxdcnn",
            },
        ]
    };

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    const showAlert = (message, type) => {
        setAlert({message, type});
    };

    const checkIfWalletIsConnected = async () => {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect({onlyIfTrusted: true});
                handleWalletConnection(response);
            } catch (err) {
                console.error('Error connecting to wallet:', err);
            }
        } else {
            showAlert('Phantom Wallet not detected. Please install it to continue.', 'error');
        }
    };

    const connectWallet = async () => {
        try {
            const response = await window.solana.connect();
            handleWalletConnection(response);
        } catch (err) {
            console.error('Error connecting to wallet:', err);
            showAlert('Failed to connect wallet. Please try again.', 'error');
        }
    };

    const handleWalletConnection = (response) => {
        setWalletConnected(true);
        setWalletAddress(response.publicKey.toString());
        setProvider(window.solana);
    };

    const airDropHelper = async () => {
        try {
            setLoading(true);
            const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
            const fromAirDropSignature = await connection.requestAirdrop(
                new PublicKey(walletAddress),
                LAMPORTS_PER_SOL
            );
            await connection.confirmTransaction(fromAirDropSignature, {commitment: "confirmed"});
            showAlert('1 SOL has been airdropped to your wallet successfully', 'success');
        } catch (err) {
            console.error("Error during Airdrop:", err);
            showAlert('Airdrop failed. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const createCollection = async () => {
        if (!provider) {
            showAlert('Please connect your Phantom wallet', 'error');
            return;
        }

        setLoading(true);
        try {
            const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
            const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(provider));

            if (!nftCollection.name || !nftCollection.description || !nftCollection.uri || nftCollection.sellerFeeBasisPoints === undefined) {
                console.error('One or more properties of nftCollection are undefined:', nftCollection);
                showAlert('An error occurred while creating the collection. Please check the console for more details.', 'error');
                return;
            }

            const { nft } = await metaplex.nfts().create({
                name: nftCollection.name,
                description: nftCollection.description,
                uri: nftCollection.uri,
                sellerFeeBasisPoints: nftCollection.seller_fee_basis_points,
                isCollection: true,
            });

            // setCollectionId(nft.address.toString());
            // nftCollection.id = nft.address.toString();

            const pinata = new pinataSDK('', '');

            console.log('Created collection:', nftCollection);
            showAlert(`Collection successfully created! Collection address: ${nft.address.toString()}`, 'success');

            const pinataResponse = await pinata.pinJSONToIPFS(nftCollection);
            if (pinataResponse.IpfsHash) {
                console.log(`Collection data successfully uploaded to Pinata with hash: ${pinataResponse.IpfsHash}`);
            } else {
                console.error('Failed to upload collection data to Pinata');
            }


        } catch (error) {
            console.error('Error creating collection:', error);
            showAlert('An error occurred while creating the collection. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const mintNFT = async () => {
        if (!provider) {
            showAlert('Please connect your Phantom wallet', 'error');
            return;
        }

        setLoading(true);
        try {
            const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
            const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(provider));

            const randomIndex = Math.floor(Math.random() * nftCollection.nfts.length);
            const selectedNFT = nftCollection.nfts[randomIndex];

            setRandomNFT(selectedNFT);

            // Fetch the collection data from IPFS
            const response = await fetch('https://ipfs.io/ipfs/QmQ41t7LM4HGM57GkqvwLPZ5LBjnGQYZy8rgDFtEF4KVJC');
            const collectionData = await response.json();
            const collectionId = collectionData.id;

            let collectionNft;
            try {
                collectionNft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(collectionId) });
            } catch (error) {
                showAlert('Collection NFT does not exist. Please create it before minting the NFT.', 'error');
                return;
            }

            const { nft } = await metaplex.nfts().create({
                name: selectedNFT.name,
                description: selectedNFT.description,
                uri: selectedNFT.uri,
                sellerFeeBasisPoints: selectedNFT.seller_fee_basis_points,
                collection: collectionNft.address,
            });

            // await metaplex.nfts().verifyCollection({
            //     mintAddress: nft.address,
            //     collectionMintAddress: collectionNft.address,
            //     isSizedCollection: true,
            // });

            console.log('Minted NFT:', nft);
            showAlert(`NFT successfully minted and added to collection! Mint address: ${nft.address.toString()}`, 'success');
        } catch (error) {
            console.error('Error minting NFT:', error);
            showAlert('An error occurred while minting the NFT. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{maxWidth: '800px', margin: '0 auto', padding: '20px'}}>
            {alert && (
                <FloatingAlert
                    message={alert.message}
                    type={alert.type}
                    onClose={() => setAlert(null)}
                />
            )}

            {walletConnected && <WalletStatusIndicator address={walletAddress}/>}

            <h2 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center'}}>Mint NFT on
                Solana</h2>

            {!walletConnected ? (
                <div style={{
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '200px'
                }}>
                    <button
                        onClick={connectWallet}
                        disabled={loading}
                        style={{
                            backgroundColor: '#4F46E5',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        {loading ? 'Connecting...' : 'Connect Phantom Wallet'}
                    </button>
                </div>
            ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                    <div style={{border: '1px solid #E5E7EB', borderRadius: '8px', padding: '20px'}}>
                        <h3 style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '10px'}}>???</h3>
                        {randomNFT && (
                            <>
                                <img
                                    src={randomNFT.uri}
                                    alt="Random NFT Preview"
                                    style={{
                                        height: '200px',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        marginBottom: '10px'
                                    }}
                                />
                                <h4 style={{fontWeight: 'bold'}}>{randomNFT.name}</h4>
                                <p style={{color: '#6B7280'}}>{randomNFT.description}</p>
                            </>
                        )}
                        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                            <button
                                onClick={mintNFT}
                                disabled={loading}
                                style={{
                                    backgroundColor: '#4F46E5',
                                    color: 'white',
                                    padding: '10px 20px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                {loading ? 'Minting...' : 'Mint NFT'}
                            </button>
                            <button
                                onClick={airDropHelper}
                                disabled={loading}
                                style={{
                                    backgroundColor: '#FBBF24',
                                    color: 'white',
                                    padding: '10px 20px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                {loading ? 'Airdropping...' : 'Airdrop SOL'}
                            </button>
                        </div>
                    </div>

                    <div style={{border: '1px solid #E5E7EB', borderRadius: '8px', padding: '20px'}}>
                        <h3 style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '10px'}}>Collection Preview</h3>
                        {nftCollection.nfts.map((nft, index) => (
                            <div key={index} style={{marginBottom: '15px', display: 'flex', alignItems: 'center'}}>
                                <img
                                    src={nft.uri}
                                    alt={`NFT ${nft.name}`}
                                    style={{
                                        height: '100px',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        marginRight: '10px'
                                    }}
                                />
                                <div>
                                    <h4 style={{fontWeight: 'bold'}}>{nft.name}</h4>
                                    <p style={{color: '#6B7280'}}>{nft.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MintNFTButton;
