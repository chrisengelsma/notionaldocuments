# User Resources

    GET user/books
    
## Description

Gets the book list for the user.

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
  books: [ Book ]
}
```

***

## Errors

* `401` - No active firebase session.
* `500` - All other errors.

***

Last updated May 9, 2018.
