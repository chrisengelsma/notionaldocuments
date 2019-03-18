# User Resources

    POST user/books
    
## Description

Sets the book list for the user.

***

## Requires Authentication

Active firebase login session.

***

## Payload

```json
{
  books: [ Book ]
}
```

***

## On Success

Status Code `200`

***

## Errors

* `401` - No active firebase session.
* `500` - All other errors.

***

Last updated May 9, 2018.
