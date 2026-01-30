# Credentials Template

> [!CAUTION]
> **This is a template file.** The original credentials.md contained actual secrets and has been archived here in sanitized form.
> **NEVER commit actual credentials to version control!**

## Supabase Configuration

**Project Name:** [Your Supabase project name]  
**Project ID:** [Your Supabase project ID]  
**Anon Public Key:** [Your anon public key]  
**Service Role Key:** [Your service role key]  

> **Note:** These should be stored in `.env` file as:
> ```
> VITE_SUPABASE_URL=https://[project-id].supabase.co
> VITE_SUPABASE_ANON_KEY=[anon-key]
> SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
> ```

## GitHub Credentials

**Repository:** [Your GitHub repository URL]  
**Access Token:** [Your GitHub personal access token]  

> **Note:** Store GitHub tokens in environment variables or use GitHub CLI for authentication.

## Best Practices

1. **Never commit credentials** - Use `.env` files and add them to `.gitignore`
2. **Use environment variables** - Reference them in your code as `process.env.VARIABLE_NAME`
3. **Rotate secrets regularly** - Change credentials periodically for security
4. **Use secret management** - Consider tools like AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault for production

## Migration from credentials.md

The original `credentials.md` file has been archived. All credentials should now be:
1. Moved to `.env` file (for local development)
2. Configured in your deployment platform's environment variables (for production)
3. Never committed to version control
