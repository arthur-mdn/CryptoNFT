import React, {useState, useEffect} from 'react';
import {Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL} from '@solana/web3.js';
import {Metaplex, walletAdapterIdentity} from '@metaplex-foundation/js';

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
    const [selectedNFTIndex, setSelectedNFTIndex] = useState(0);
    const [alert, setAlert] = useState(null);

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
    ];

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

    const mintNFT = async () => {
        if (!provider) {
            showAlert('Please connect your Phantom wallet', 'error');
            return;
        }

        setLoading(true);
        try {
            const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
            const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(provider));
            const selectedNFT = nftOptions[selectedNFTIndex];
            const {nft} = await metaplex.nfts().create({
                name: selectedNFT.name,
                description: selectedNFT.description,
                uri: selectedNFT.uri,
                sellerFeeBasisPoints: 1,
            });
            showAlert(`NFT successfully minted! Mint address: ${nft.address.toString()}`, 'success');
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
                        <h3 style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '10px'}}>Select an NFT to
                            Mint</h3>
                        <div style={{display: 'flex', gap: '20px'}}>
                            {nftOptions.map((nft, index) => (
                                <div
                                    key={index}
                                    onClick={() => setSelectedNFTIndex(index)}
                                    style={{
                                        cursor: 'pointer',
                                        border: `2px solid ${selectedNFTIndex === index ? '#4F46E5' : '#E5E7EB'}`,
                                        borderRadius: '8px',
                                        padding: '10px',
                                        flex: 1,
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <img
                                        src={nft.uri}
                                        alt={nft.name}
                                        style={{
                                            width: '100%',
                                            height: '120px',
                                            objectFit: 'cover',
                                            borderRadius: '4px',
                                            marginBottom: '10px'
                                        }}
                                    />
                                    <p style={{fontWeight: 'bold', textAlign: 'center'}}>{nft.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{border: '1px solid #E5E7EB', borderRadius: '8px', padding: '20px'}}>
                        <h3 style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '10px'}}>NFT Preview</h3>
                        <img
                            src={nftOptions[selectedNFTIndex].uri}
                            alt="NFT Preview"
                            style={{
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                marginBottom: '10px'
                            }}
                        />
                        <h4 style={{fontWeight: 'bold'}}>{nftOptions[selectedNFTIndex].name}</h4>
                        <p style={{color: '#6B7280'}}>{nftOptions[selectedNFTIndex].description}</p>
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
                                    backgroundColor: 'white',
                                    color: '#4F46E5',
                                    padding: '10px 20px',
                                    borderRadius: '4px',
                                    border: '1px solid #4F46E5',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                {loading ? 'Airdropping...' : 'Airdrop 1 SOL'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MintNFTButton;
