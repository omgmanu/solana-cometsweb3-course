import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";

const keypair = getKeypairFromEnvironment("SECRET_KEY");
import {
Connection,
LAMPORTS_PER_SOL,
PublicKey,
clusterApiUrl,
} from "@solana/web3.js";
import bs58 from "bs58";

const connection = new Connection(clusterApiUrl("devnet"));
const myAddress = keypair.publicKey.toBase58();
const secretKey = bs58.encode(keypair.secretKey);
const publickey = new PublicKey(myAddress);

const balanceinLamports = await connection.getBalance(publickey);
const balanceinSol = balanceinLamports / LAMPORTS_PER_SOL;
console.log(`My balance: ${balanceinSol}`);
// console.log(`Secret key: ${secretKey}`);