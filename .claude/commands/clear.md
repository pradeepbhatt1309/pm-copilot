# /clear

Clear the current session history.

## Usage
/clear

## Behaviour
1. Calls DELETE /api/history
2. Clears all interactions from the in-memory session store
3. Resets the input textarea
4. Returns confirmation message

## When to Use
- At the start of a new work session
- When context has become polluted with old interactions
- Before processing sensitive content you don't want in history

## Note
Session is automatically cleared after 8 hours of inactivity.
This command provides immediate manual clearing.
