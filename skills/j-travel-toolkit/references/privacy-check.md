# Privacy Check

Run this check before publishing to GitHub Pages.

## Scan For Sensitive Data

Search generated JSON and source files for:

- Passport or ID number patterns
- Phone numbers
- Email addresses
- Long numeric order identifiers
- Payment or booking confirmation numbers
- Room numbers
- Emergency contacts

## Agent Behavior

- If obvious sensitive data exists, stop and summarize the risky fields.
- Ask the user to remove or mask sensitive data before publishing.
- If only ordinary flight numbers, train numbers, hotel names, or public attraction links appear, publishing can proceed.

