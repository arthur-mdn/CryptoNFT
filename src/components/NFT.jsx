import Gallery from "./Gallery.jsx";
import MintNFT from "./MintNFT.jsx";
import CreateCollection from "./CreateCollection.jsx";
import {useEffect, useState} from "react";
import {createSignerFromKeypair, publicKey, signerIdentity} from "@metaplex-foundation/umi";
import config from "../config.js";
import {fetchCandyMachine, mplCandyMachine} from "@metaplex-foundation/mpl-candy-machine";
import {createUmi} from "@metaplex-foundation/umi-bundle-defaults";

const NFT = () => {
    const umi = createUmi('https://api.devnet.solana.com').use(mplCandyMachine());
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

    return (
        <div className={"fc g1"}>
            {/*{!nftCollection.id &&*/}
            {/*    <CreateCollection nftCollection={nftCollection}/>*/}
            {/*}*/}
            {
                candyMachine && candyMachine.items &&
                <>
                    <MintNFT candyMachine={candyMachine}/>
                    <Gallery candyMachine={candyMachine}/>
                </>
            }
        </div>
    );
};

export default NFT;
