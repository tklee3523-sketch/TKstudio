# Security Specification for Portfolio Gallery

## Data Invariants
1. A project must have a valid ID, title, description, category, and image.
2. Only authorized admins can create, update, or delete projects.
3. Projects are publicly readable.
4. The bootstrap admin (tklee3523@gmail.com) has full access even if the database is empty.
5. Administrative status is verified against the `admins` collection OR the bootstrap email.

## The Dirty Dozen Payloads
1. **Unauthenticated Write**: Attempt to create a project without signing in. (Expected: DENIED)
2. **Identity Spoofing**: Attempt to create a project with a different user's UID in a field (if we had one). (Expected: DENIED)
3. **Malicious ID**: Attempt to create a project with a document ID containing path injection characters. (Expected: DENIED)
4. **Invalid Category**: Attempt to create/update a project with category "hacker". (Expected: DENIED)
5. **Jumbo Title**: Attempt to update a project title with 1MB of text. (Expected: DENIED)
6. **Orphaned Write**: Attempt to update a non-existent project (though update usually handles this, we check isValidProject). (Expected: DENIED)
7. **Bypassing Admin Check**: Non-admin user trying to create a project. (Expected: DENIED)
8. **Admin Self-Elevation**: User trying to write to `admins` collection for their own UID without being an admin. (Expected: DENIED)
9. **Tampering with Immutables**: Attempt to change a project's `id` field during update. (Expected: DENIED)
10. **Shadow Fields**: Adding an `isVerified: true` field to a project that isn't in the schema. (Expected: DENIED)
11. **PII Leak**: Attempt to list the `admins` collection (should be restricted to get-only for oneself). (Expected: DENIED)
12. **Terminal State Break**: (Not applicable yet as we don't have terminal states, but we check valid status).

## Test Runner
A `firestore.rules.test.ts` would verify these if the environment supports it.
