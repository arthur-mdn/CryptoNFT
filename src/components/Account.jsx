import {useState} from 'react';
import {clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import {useAuth} from "../AuthContext.jsx";
import {toast} from "react-toastify";

const Account = () => {

    const [loading, setLoading] = useState(false);
    const {walletAddress, setWalletBalance} = useAuth();

    const aidrop = async () => {
        try {
            setLoading(true);
            const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
            const fromAirDropSignature = await connection.requestAirdrop(
                new PublicKey(walletAddress),
                LAMPORTS_PER_SOL
            );
            await connection.confirmTransaction(fromAirDropSignature, {commitment: "confirmed"});
            toast.success(`1 SOL a été airdroppé sur votre portefeuille ${walletAddress} avec succès`);
            console.log(`1 SOL a été airdroppé sur votre portefeuille ${walletAddress} avec succès`);
        } catch (err) {
            if(err.message.includes('airdrop limit')) {
                toast.error('Limite d\'Airdrop journalière atteinte');
                return;
            } else {
                toast.error('Erreur lors de l\'Airdrop');
            }
            console.error("Erreur lors de l'Airdrop:", err);
        } finally {
            setLoading(false);
        }
    };

    const checkBalance = async () => {
        try {
            setLoading(true);
            const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
            const balance = await connection.getBalance(new PublicKey(walletAddress));
            console.log('Solde du portefeuille:', balance / LAMPORTS_PER_SOL);
            toast.success(`Solde du portefeuille mis à jour`);
            setWalletBalance(balance / LAMPORTS_PER_SOL);
        } catch (error) {
            toast.error('Erreur lors de la vérification du solde');
            console.error('Erreur lors de la vérification du solde:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={'p1 card fc g1 ai-c'}>
            <h3 className={'fw-b'}>Account</h3>
            <div className={'fr g0-5 ai-c'}>
                <button
                    type={'button'}
                    disabled={loading}
                    onClick={aidrop}
                >
                    Airdrop 1 SOL
                </button>
                <button
                    type={'button'}
                    disabled={loading}
                    onClick={checkBalance}
                >
                    Refresh Balance
                </button>
            </div>
        </div>
    );
};

export default Account;