import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import {
    Connection,
    clusterApiUrl,
} from "@solana/web3.js";
import { createMint } from "@solana/spl-token";

const connection = new Connection(clusterApiUrl("devnet"), 'confirmed');
const keypair = getKeypairFromEnvironment("SECRET_KEY");

const tokenMint = await createMint(connection, keypair, keypair.publicKey, null, 9);

console.log(`Token mint: ${tokenMint}`);