# Library Resources

    POST library/book/:uid/update
    
## Description

Updates an existing book.

***

## Requires Authentication

Active firebase login session.

***

## Parameters

- **uid** _(required)_ - The unique ID of the book to update.

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
{
  <uid>: <Book>
}
```
***

## Errors

* `401` - No active firebase session.
* `500` - All other errors.

***

Last updated May 9, 2018.
