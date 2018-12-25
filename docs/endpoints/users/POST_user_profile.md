# User Resources

    POST user/profile
    
## Description

Persists the profile for the user.

***

## Requires Authentication

Active firebase login session.

***

## Payload

Optional

- **displayName** - Display name for user.
- **lastEditedBook** - id for book last edited by user.

***

## On Success

Status Code `200`

Payload:

```json
{
  emailHash: <string>,
  displayName: <string>,
  books: [ <string> ],
  dateCreated: <long>,
  lastModified: <long>
}
```

***

## Errors

* `401` - No active firebase session.
* `500` - All other errors.

***

Last updated May 9, 2018.
