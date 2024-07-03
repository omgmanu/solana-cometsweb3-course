import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    clusterApiUrl,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import { createMemoInstruction } from "@solana/spl-memo";

const connection = new Connection(clusterApiUrl("devnet"), 'confirmed');
const keypair = getKeypairFromEnvironment("SECRET_KEY");


const myAddress = keypair.publicKey.toBase58();
const publickey = new PublicKey(myAddress);

const balanceinLamports = await connection.getBalance(publickey);
const balanceinSol = balanceinLamports / LAMPORTS_PER_SOL;
console.log(`My balance: ${balanceinSol}`);

const receiver = new PublicKey('CudRDBKDeKpenz7braYbw5QNG5TUzqNNQWpvqDUdmZXz');

const transaction = new Transaction();

const transferInstruction = SystemProgram.transfer({
    fromPubkey: keypair.publicKey,
    toPubkey: receiver,
    lamports: 0.01 * LAMPORTS_PER_SOL,
});

transaction.add(transferInstruction);

const memo = "beer here: 🍺 🍺 🍺 <--real beer";
const memoInstruction = createMemoInstruction(memo);

transaction.add(memoInstruction);

const signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);
console.log(`Transaction sent with signature: ${signature}`);