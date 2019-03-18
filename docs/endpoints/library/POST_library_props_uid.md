# Library Resources

    POST library/props/:uid
    
## Description

Updates or creates propositions for a book

***

## Requires Authentication

Active firebase login session.

***

## Parameters

- **uid** _(required)_ - The unique ID of the book.

***

## Payload

```json
{
  propositions: <Proposition>
}
```

***

## On Success

Status Code `200`

Payload

```json
{
  <uid>: <Proposition>
}
```
***

## Errors

* `401` - No active firebase session.
* `500` - All other errors.

***

Last updated May 9, 2018.
