use anchor_lang::prelude::*;

// Our program's address! You don't need to change it.
// This matches the private key in the target/deploy directory
declare_id!("4MZbo8yThHErLwUpeGs1tkDGbsJr9Np91zsRSsazYhbt");

// Anchor accounts use 8 bytes to determine their type
pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

// A 'mod' is a Rust module. But the #[program] makes it into a Solana program!
#[program]
pub mod favorites {
    use super::*;
    // Our instruction handler! It sets the user's favorite number and color
    pub fn set_favorites(
        context: Context<SetFavorites>,
        number: u64,
        color: String,
        hobbies: Vec<String>,
    ) -> Result<()> {
        let user_public_key = context.accounts.user.key();
        msg!("Greetings from {}", context.program_id);
        msg!("User {user_public_key}'s favorite number is {number}, favorite color is: {color}",);
        msg!("User's hobbies are: {:?}", hobbies);
        context.accounts.favorites.set_inner(Favorites {
            number,
            color,
            hobbies,
        });
        Ok(())
    }
    // We can also add a get_favorites instruction handler to return the user's favorite number and color
}

#[derive(Accounts)]
pub struct Initialize {}

// What we will put inside the Favorites PDA
#[account]
#[derive(InitSpace)]
pub struct Favorites {
    pub number: u64,
    #[max_len(50)]
    pub color: String,
    #[max_len(5, 50)]
    pub hobbies: Vec<String>,
}

// When people call the set_favorites instruction, they will need to provide the
// accounts that will be modifed. This keeps Solana fast!
#[derive(Accounts)]
pub struct SetFavorites<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
init_if_needed,
payer = user,
space = ANCHOR_DISCRIMINATOR_SIZE + Favorites::INIT_SPACE,
seeds=[b"favorites", user.key().as_ref()],
bump)]
    pub favorites: Account<'info, Favorites>,
    pub system_program: Program<'info, System>,
}
