use anchor_lang::prelude::*;

declare_id!("7Y61CkRJ8GvsNAiQHvereZoozpwYtNKzfDRZTFWZPLMq");

#[program]
pub mod sandbox {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Hello from {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
