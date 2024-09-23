import config from "../config.js";
import {useEffect, useState} from "react";
import {createUmi} from "@metaplex-foundation/umi-bundle-defaults";
import {mplCandyMachine, fetchCandyMachine, mintFromCandyMachineV2} from "@metaplex-foundation/mpl-candy-machine";
import {publicKey, createSignerFromKeypair, signerIdentity, transactionBuilder, generateSigner} from "@metaplex-foundation/umi";
import { setComputeUnitLimit} from "@metaplex-foundation/mpl-toolbox";
import {useAuth} from "../AuthContext.jsx";

const MintNFTNew = () => {
    const {walletAddress} = useAuth();
    const [minting, setMinting] = useState(false);
    const umi = createUmi('https://api.devnet.solana.com').use(mplCandyMachine());
    const [remainingUnits, setRemainingUnits] = useState(null);
    console.log(config)
    let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(config.secretKeyArray));

    const signer = createSignerFromKeypair(umi, keypair);

    umi.use(signerIdentity(signer));
    const [candyMachine, setCandyMachine] = useState(null);

    const getCandyMachine = async () => {
        const candyMachinePublicKey = publicKey(config.candyMachineId);
        const fetchedCandyMachine = await fetchCandyMachine(umi, candyMachinePublicKey);
        setCandyMachine(fetchedCandyMachine);
        console.log('Candy Machine data:', fetchedCandyMachine);
    }

    useEffect(() => {
        getCandyMachine();
    }, []);

    useEffect(() => {
        if (candyMachine && candyMachine.items) {
            const mintedItems = Array.from(candyMachine.items.values()).filter(item => item.minted);
            console.log('Minted items:', mintedItems);
            setRemainingUnits(candyMachine.items.length - mintedItems.length);
        }
    }, [candyMachine]);

    const mint = async () => {
        setMinting(true);
        try {
            console.log('Minting NFT...');

            const nftMint= generateSigner(umi);
            const nftOwner = publicKey(walletAddress);

            const response = await transactionBuilder()
                .add(setComputeUnitLimit(umi, {units: 800_000}))
                .add(
                    mintFromCandyMachineV2(umi, {
                        candyMachine: candyMachine.publicKey,
                        mintAuthority: umi.identity,
                        nftOwner,
                        nftMint,
                        collectionMint: candyMachine.collectionMint,
                        collectionUpdateAuthority: candyMachine.mintAuthority
                    })
                )
                .sendAndConfirm(umi);

            console.log(response);

            console.log('NFT minted successfully (nope)');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setMinting(false);
        }
    }

    return (
        <div>
            {
                remainingUnits !== null && (
                    <p>Remaining units: {remainingUnits}</p>
                )
            }
            <button onClick={mint} disabled={minting}>
                {minting ? 'Minting...' : 'Mint NFT'}
            </button>
        </div>
    );
};

export default MintNFTNew;