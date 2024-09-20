import React, {useState, useEffect} from 'react';
import {Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL} from '@solana/web3.js';
import {Metaplex, walletAdapterIdentity} from '@metaplex-foundation/js';

const MintNFTButton = () => {
    // State variables
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedNFTIndex, setSelectedNFTIndex] = useState(0); // State for selected NFT

    // Array of NFT metadata
    const nftOptions = [
        {
            name: "My First NFT",
            description: "This is my first NFT minted with Metaplex!",
            uri: "https://ipfs.io/ipfs/QmNWqAaKigBptCTuDshapsxRKw6WtQGcavoKNMXVN8CFja",
        },
        {
            name: "My Second NFT",
            description: "This is my second NFT minted with Metaplex!",
            uri: "https://ipfs.io/ipfs/QmVsE9ZNnJ3ZQ3fqUvNEnUjz1VZSbdmzCLBz29QAsxdcnn",
        },
        // {
        //     name: "My Third NFT",
        //     description: "This is my third NFT minted with Metaplex!",
        //     uri: "https://ipfs.io/ipfs/NEW_URI_FOR_THIRD_NFT",
        // },
    ];

    // Check if the wallet is already connected
    const checkIfWalletIsConnected = async () => {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect({onlyIfTrusted: true});
                setWalletConnected(true);
                setWalletAddress(response.publicKey.toString());
                setProvider(window.solana);
            } catch (err) {
                console.error('Error connecting to wallet:', err);
            }
        } else {
            alert('Phantom Wallet not detected. Please install it to continue.');
        }
    };

    // Connect to the wallet
    const connectWallet = async () => {
        try {
            const response = await window.solana.connect();
            setWalletConnected(true);
            setWalletAddress(response.publicKey.toString());
            setProvider(window.solana);
        } catch (err) {
            console.error('Error connecting to wallet:', err);
        }
    };

    // Check wallet connection on component mount
    useEffect(() => {
        checkIfWalletIsConnected().then(r => console.log('Wallet connection checked'));
    }, []);

    // Airdrop SOL to the connected wallet (for testing purposes)
    const airDropHelper = async () => {
        try {
            setLoading(true);
            console.log("Airdrop in progress...");
            const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
            const fromAirDropSignature = await connection.requestAirdrop(
                new PublicKey(walletAddress),
                LAMPORTS_PER_SOL
            );
            await connection.confirmTransaction(fromAirDropSignature, {commitment: "confirmed"});

            console.log(`1 SOL has been airdropped to your wallet ${walletAddress} successfully`);
        } catch (err) {
            console.error("Error during Airdrop:", err);
        } finally {
            console.log("Resetting loading status");
            setLoading(false);
        }
    };

    // Mint NFT function
    const mintNFT = async () => {
        if (!provider) {
            alert('Please connect your Phantom wallet');
            return;
        }

        setLoading(true);
        try {
            const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
            const metaplex = Metaplex.make(connection)
                .use(walletAdapterIdentity(provider));

            // Get selected NFT metadata
            const selectedNFT = nftOptions[selectedNFTIndex];

            // Create the NFT with user-defined metadata
            const {nft} = await metaplex.nfts().create({
                name: selectedNFT.name,
                description: selectedNFT.description,
                uri: selectedNFT.uri,
                sellerFeeBasisPoints: 1, // 1% royalty
            });

            console.log('NFT created:', nft);
            alert(`NFT successfully minted! Mint address: ${nft.address.toString()}`);
        } catch (error) {
            console.error('Error minting NFT:', error);
            alert('An error occurred while minting the NFT. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    // Handle NFT selection
    const handleNFTClick = (index) => {
        setSelectedNFTIndex(index);
    };

    // Component render
    return (
        <div style={{textAlign: 'center', marginTop: '50px'}}>
            <h2>Mint NFT on Solana</h2>
            {walletConnected ? (
                <>
                    <p>Wallet connected: {walletAddress}</p>
                    {/* NFT Selection Section */}
                    <div style={{marginBottom: '20px'}}>
                        <h3>Select an NFT to Mint</h3>
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                            {nftOptions.map((nft, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleNFTClick(index)}
                                    style={{
                                        margin: '0 10px',
                                        cursor: 'pointer',
                                        border: selectedNFTIndex === index ? '2px solid #4CAF50' : '2px solid transparent',
                                        borderRadius: '5px',
                                        padding: '5px'
                                    }}
                                >
                                    <img
                                        src={nft.uri}
                                        alt={nft.name}
                                        style={{width: '100px', height: '100px', objectFit: 'cover'}}
                                    />
                                    <p>{nft.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* NFT Preview Section */}
                    <div style={{marginBottom: '20px'}}>
                        <h3>Preview NFT</h3>
                        <p><strong>Name:</strong> {nftOptions[selectedNFTIndex].name}</p>
                        <p><strong>Description:</strong> {nftOptions[selectedNFTIndex].description}</p>
                        <img src={nftOptions[selectedNFTIndex].uri} alt="NFT Preview"
                             style={{width: '200px', height: '200px', objectFit: 'cover'}}/>
                    </div>
                    <button
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginRight: '10px'
                        }}
                        onClick={mintNFT}
                        disabled={loading}
                    >
                        {loading ? 'Minting NFT...' : 'Mint NFT'}
                    </button>
                    <button
                        disabled={loading}
                        onClick={airDropHelper}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#008CBA',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        {loading ? 'Airdrop in progress...' : 'Airdrop 1 SOL'}
                    </button>
                </>
            ) : (
                <button
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#008CBA',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                    onClick={connectWallet}
                >
                    Connect Phantom Wallet
                </button>
            )}
        </div>
    );
};

export default MintNFTButton;
