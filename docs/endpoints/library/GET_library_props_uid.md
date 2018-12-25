# Library Resources

    GET library/props/:uid
    
## Description

Gets the propositions for a book.

***

## Requires Authentication

Active firebase login session.

***

## On Success

Status Code `200`

Payload

```json
[
  {
    <uid>: <Proposition>
  }, ...
]
```
***

## Errors

* `401` - No active firebase session.
* `500` - All other errors.

***

Last updated May 9, 2018.
