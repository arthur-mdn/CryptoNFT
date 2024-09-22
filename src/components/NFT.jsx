import {useEffect, useState} from 'react';
import {clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import {useAuth} from "../AuthContext.jsx";

const NFT = () => {
    const {walletConnected, setWalletConnected, walletAddress, setWalletAddress, provider, setProvider} = useAuth();

    return (
        <div style={{textAlign: 'center', marginTop: '50px'}}>
            <h2>NFT</h2>
            {walletConnected ?? (
                <>
                    <p>Veuillez connecter votre portefeuille pour voir vos NFTs</p>
                </>
            )}
        </div>
    );
};

export default NFT;