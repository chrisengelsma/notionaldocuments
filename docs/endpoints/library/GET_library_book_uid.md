# Library Resources

    GET library/book/:uid
    
## Description

Gets a book by its unique ID.

***

## Requires Authentication

Active firebase login session.

***

## Parameters

- **uid** _(required)_ - The unique ID of the book to get.

***

## On Success

Status Code `200`

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
