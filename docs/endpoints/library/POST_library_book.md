# Library Resources

    POST library/book
    
## Description

Adds a new book to the datastore.

***

## Requires Authentication

Active firebase login session.

***

## Payload

```json
{
  book: Book
}
```

***

## On Success

Status Code `201`

Payload

```json
key: <string>
```
***

## Errors

* `401` - No active firebase session.
* `500` - All other errors.

***

Last updated May 9, 2018.
