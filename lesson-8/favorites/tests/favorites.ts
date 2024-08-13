import { assert } from 'chai';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Favorites } from '../target/types/favorites';

const web3 = anchor.web3;

describe('Favorites', () => {
  // Use the cluster and the keypair specified in Anchor.toml
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const user = (provider.wallet as anchor.Wallet).payer;
  const program = anchor.workspace.Favorites as Program<Favorites>;
  // You can skip this 'before' section if you're busy!
  // We don't need to airdrop if we're using the local cluster
  // because the local cluster gives us 85 billion dollars worth of SOL
  before(async () => {
    const balance = await provider.connection.getBalance(user.publicKey);
    const balanceInSOL = balance / web3.LAMPORTS_PER_SOL;
    const formattedBalance = new Intl.NumberFormat().format(balanceInSOL);
    console.log(`Balance: ${formattedBalance} SOL`);
  });

  it("Saves a user's favorites to the blockchain", async () => {
    // Here's what we want to write to the blockchain
    const favoriteNumber = new anchor.BN(23);
    const favoriteColor = 'purple';
    const favoriteHobbies = ['skiing', 'skydiving', 'biking'];
    await program.methods
      .setFavorites(favoriteNumber, favoriteColor, favoriteHobbies)
      .signers([user])
      .rpc();
    // No check everything matches
    const favoritesPdaAndBump = web3.PublicKey.findProgramAddressSync(
      [Buffer.from('favorites'), user.publicKey.toBuffer()],
      program.programId,
    );
    const favoritesPda = favoritesPdaAndBump[0];
    const dataFromPda = await program.account.favorites.fetch(favoritesPda);
    assert.equal(dataFromPda.color, favoriteColor);
    assert.equal(dataFromPda.number.toString(), favoriteNumber.toString());
    assert.deepEqual(dataFromPda.hobbies, favoriteHobbies);
  });

  it("Doesn't let people write to favorites for other users", async () => {
    const someRandomGuy = anchor.web3.Keypair.generate();
    try {
      await program.methods
        .setFavorites(new anchor.BN(420), 'red', ['being a dork'])
        .signers([someRandomGuy])
        .rpc();
    } catch (error) {
      const errorMessage = (error as Error).message;
      assert.isTrue(errorMessage.includes('unknown signer'));
    }
  });

  it('saves', async () => {
    const favNr = new anchor.BN(23);
    const favColor = 'purple';
    const favHobbies = ['skiing', 'biking'];
    await program.methods
      .setFavorites(favNr, favColor, favHobbies)
      .signers([user])
      .rpc();

    const favPdaAndBump = web3.PublicKey.findProgramAddressSync(
      [Buffer.from('favorites'), user.publicKey.toBuffer()],
      program.programId,
    );
    const favPda = favPdaAndBump[0];
    const dataFromPda = await program.account.favorites.fetch(favPda);

    assert.equal(dataFromPda.color, favColor);
    assert.equal(dataFromPda.number.toString(), favNr.toString());
    assert.deepEqual(dataFromPda.hobbies, favHobbies);
  });
});
