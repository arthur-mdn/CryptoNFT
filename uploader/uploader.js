import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import PinataClient from '@pinata/sdk';

dotenv.config();
const config = dotenv.config().parsed;

const pinata = new PinataClient(config.PINATA_API_KEY, config.PINATA_SECRET_API_KEY);

const uploadFileToPinata = async (filePath) => {
    const fileName = path.basename(filePath);
    const readableStreamForFile = fs.createReadStream(filePath);
    const options = {
        pinataMetadata: {
            name: fileName,
        },
    };

    try {
        const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
        console.log(`Uploaded ${fileName} to Pinata. IPFS Hash: ${result.IpfsHash}`);
        return result.IpfsHash;
    } catch (error) {
        console.error(`Error uploading ${fileName}:`, error.message);
    }
};

const uploadDirectoryToPinata = async (directoryPath) => {
    const files = fs.readdirSync(directoryPath);
    const ipfsHashes = {};

    await Promise.all(files.map(async (file) => {
        const filePath = path.join(directoryPath, file);

        if (file.startsWith('.') || !file.endsWith('.png') && !file.endsWith('.json')) {
            console.warn(`Ignoring file: ${file}`);
            return;
        }

        const ipfsHash = await uploadFileToPinata(filePath);
        if (ipfsHash) {
            ipfsHashes[file] = ipfsHash;
        }
    }));

    return ipfsHashes;
};

const updateMetadataWithImageLinks = (metadataDir, imageHashes) => {
    const metadataFiles = fs.readdirSync(metadataDir);

    metadataFiles.forEach((metadataFile) => {
        const metadataPath = path.join(metadataDir, metadataFile);
        try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath));

            const imageName = path.basename(metadata.image);
            const ipfsHash = imageHashes[imageName];

            if (ipfsHash) {
                metadata.image = `https://ipfs.io/ipfs/${ipfsHash}`;
                fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
                console.log(`Updated metadata for ${metadataFile} with IPFS link.`);
            } else {
                console.warn(`No IPFS hash found for ${imageName}`);
            }
        } catch (error) {
            console.error(`Error parsing JSON for ${metadataFile}:`, error.message);
        }
    });
};

const main = async () => {
    const imagesDir = '../generator/output/images';
    const metadataDir = '../generator/output/metadata';

    try {
        if (!fs.existsSync(imagesDir) || !fs.existsSync(metadataDir)) {
            console.error('Les dossiers images ou metadata sont introuvables.');
            return;
        }

        console.log('Uploading images to Pinata...');
        const imageHashes = await uploadDirectoryToPinata(imagesDir);

        console.log('Updating metadata with IPFS links...');
        updateMetadataWithImageLinks(metadataDir, imageHashes);

        console.log('Uploading metadata to Pinata...');
        const metadataHashes = await uploadDirectoryToPinata(metadataDir);

        const collectionMetadata = {
            id: null,
            name: "MDS NFT Collection",
            description: "This is a collection of unique NFTs representing a cute cloud being diplomed from MDS.",
            uri: "",
            sellerFeeBasisPoints: 500,
            nfts: Object.entries(metadataHashes).map(([fileName, ipfsHash], index) => {
                const metadataPath = path.join(metadataDir, fileName);
                const metadata = JSON.parse(fs.readFileSync(metadataPath));
                return {
                    name: metadata.name,
                    symbol: metadata.symbol || "",
                    seller_fee_basis_points: metadata.seller_fee_basis_points || 0,
                    description: metadata.description,
                    creators: metadata.properties.creators || null,
                    uri: `https://ipfs.io/ipfs/${ipfsHash}`,
                    image: metadata.image,
                    edition: index + 1,
                };
            })
        };

        const collectionPath = './output/collection.json';
        fs.writeFileSync(collectionPath, JSON.stringify(collectionMetadata, null, 2));
        console.log('Collection metadata saved to collection.json');

        const collectionIpfsHash = await uploadFileToPinata(collectionPath);
        collectionMetadata.uri = `https://ipfs.io/ipfs/${collectionIpfsHash}`;

        fs.writeFileSync(collectionPath, JSON.stringify(collectionMetadata, null, 2));
        console.log('Collection URI updated in collection.json');
    } catch (error) {
        console.error('Error in main process:', error.message);
    }
};

main().catch(console.error);