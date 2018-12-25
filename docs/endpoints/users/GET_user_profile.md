# User Resources

    GET user/profile
    
## Description

Gets the profile for the user.

***

## Requires Authentication

Active firebase login session.

***

## Parameters

    None

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
