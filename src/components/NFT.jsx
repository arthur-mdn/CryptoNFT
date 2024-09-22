import Gallery from "./Gallery.jsx";
import MintNFT from "./MintNFT.jsx";
import CreateCollection from "./CreateCollection.jsx";

const NFT = () => {
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
                edition: 1
            },
            {
                name: "My Second NFT",
                symbol: "",
                seller_fee_basis_points: 1,
                description: "This is my second NFT minted with Metaplex!",
                creators: null,
                uri: "https://ipfs.io/ipfs/QmVsE9ZNnJ3ZQ3fqUvNEnUjz1VZSbdmzCLBz29QAsxdcnn",
                edition: 2,
            },
        ]
    };

    return (
        <div className={"fc g1"}>
            {/*<CreateCollection nftCollection={nftCollection}/>*/}
            <MintNFT nftCollection={nftCollection}/>
            <Gallery nftCollection={nftCollection}/>
        </div>
    );
};

export default NFT;
