import { useState, useEffect } from 'react';
import { Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const MintNFTButton = () => {
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(false);

    const checkIfWalletIsConnected = async () => {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect({ onlyIfTrusted: true });
                setWalletConnected(true);
                setWalletAddress(response.publicKey.toString());
                setProvider(window.solana);
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
            setProvider(window.solana);
        } catch (err) {
            console.error('Erreur de connexion au portefeuille:', err);
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    const airDropHelper = async () => {
        try {
            setLoading(true);
            console.log("Airdrop en cours...");
            const connection = new Connection(clusterApiUrl("testnet"), "confirmed");
            const fromAirDropSignature = await connection.requestAirdrop(
                new PublicKey(walletAddress),
                LAMPORTS_PER_SOL
            );
            await connection.confirmTransaction(fromAirDropSignature, { commitment: "confirmed" });

            console.log(`1 SOL a été airdroppé sur votre portefeuille ${walletAddress} avec succès`);
        } catch (err) {
            console.error("Erreur lors de l'Airdrop:", err);
        } finally {
            console.log("Réinitialisation du statut de chargement");
            setLoading(false);
        }
    };

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
                    <p>Airdrop 1 SOL
                        <button
                            disabled={loading}
                            onClick={airDropHelper}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                            }}
                        >
                            {loading ? 'Airdrop en cours...' : 'AirDrop SOL'}
                        </button>
                    </p>
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