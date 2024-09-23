import fs from 'fs';
import sharp from 'sharp';
import path from "path";

const layers = [
    { name: 'background', path: './layers/background/' },
    { name: 'friendly_cloud', path: './layers/friendly_cloud/', isStatic: true },
    { name: 'diploma', path: './layers/diploma/' },
    { name: 'cap', path: './layers/cap/' },
    { name: 'pompon', path: './layers/pompon/' }
];

function generateCombinations(layers) {
    const combinations = [];

    function helper(layerIndex, currentCombination) {
        if (layerIndex === layers.length) {
            combinations.push([...currentCombination]);
            return;
        }

        const layer = layers[layerIndex];
        const elements = fs.readdirSync(layer.path).filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ext === '.png' || ext === '.jpg' || ext === '.jpeg';
        });

        if (layer.isStatic) {
            currentCombination.push(elements[0]);
            helper(layerIndex + 1, currentCombination);
            currentCombination.pop();
        } else {
            for (const element of elements) {
                currentCombination.push(element);
                helper(layerIndex + 1, currentCombination);
                currentCombination.pop();
            }
        }
    }

    helper(0, []);
    return combinations;
}

function generateMetadata(id, attributes) {
    return {
        name: `NFT MDS #${id}`,
        symbol: "NFTMDS",
        description: "Unique NFT generated for My Digital School",
        seller_fee_basis_points: 500,
        image: `https://path.to.image/${id}.png`,
        attributes: attributes.map((attr, index) => ({
            trait_type: layers[index].name,
            value: attr.replace('.png', '')
        })),
        properties: {
            files: [
                {
                    uri: `${id}.png`,
                    type: "image/png"
                }
            ],
            category: "image"
        }
    };
}

async function createImage(id, combination) {
    const attributes = [];
    const composites = [];

    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        const element = combination[i];

        if (!element) {
            console.error(`Aucun élément trouvé pour le calque ${layer.name}`);
            continue;
        }

        const imagePath = `${layer.path}${element}`;

        try {
            await sharp(imagePath).metadata();
            attributes.push(element);
            composites.push({ input: imagePath, top: 0, left: 0 });
        } catch (error) {
            console.error(`Erreur lors de la préparation de l'image ${imagePath}: ${error.message}`);
            continue;
        }

        try {
            composites.push({ input: imagePath, top: 0, left: 0 });
        } catch (error) {
            console.error(`Erreur lors de la préparation de l'image ${imagePath}: ${error}`);
        }
    }

    const compositeImage = sharp({
        create: {
            width: 2048,
            height: 2048,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
    }).composite(composites);

    const outputImageDir = './output/images';
    if (!fs.existsSync(outputImageDir)) {
        fs.mkdirSync(outputImageDir, { recursive: true });
    }
    await compositeImage.toFile(`${outputImageDir}/${id}.png`);

    const metadata = generateMetadata(id, attributes);
    const outputMetadataDir = './output/metadata';
    if (!fs.existsSync(outputMetadataDir)) {
        fs.mkdirSync(outputMetadataDir, { recursive: true });
    }
    fs.writeFileSync(`${outputMetadataDir}/${id}.json`, JSON.stringify(metadata, null, 2));

    console.log(`Image et métadonnées générées pour NFT #${id}`);
}

const combinations = generateCombinations(layers);
combinations.forEach((combination, index) => {
    createImage(index, combination);
});

console.log(`Génération des NFTs terminée. Nombre total de combinaisons générées: ${combinations.length}`);