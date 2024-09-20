import { useState, useEffect } from 'react';

const MintNFTButton = () => {
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');

    const checkIfWalletIsConnected = async () => {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect({ onlyIfTrusted: true });
                setWalletConnected(true);
                setWalletAddress(response.publicKey.toString());
            } catch (err) {
                console.error('Erreur de connexion au portefeuille:', err);
            }
        } else {
            alert('Phantom Wallet non détecté. Veuillez l’installer pour continuer.');
        }
    };

    const connectWallet = async () => {
        try {
            const response = await window.solana.connect();
            setWalletConnected(true);
            setWalletAddress(response.publicKey.toString());
        } catch (err) {
            console.error('Erreur de connexion au portefeuille:', err);
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Mint NFT sur Solana</h2>
            {walletConnected ? (
                <>
                    <p>Portefeuille connecté: {walletAddress}</p>
                    <button
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                        onClick={() => alert('Fonctionnalité de Mint à implémenter !')}
                    >
                        Mint NFT
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
                    Connecter le portefeuille Phantom
                </button>
            )}
        </div>
    );
};

export default MintNFTButton;