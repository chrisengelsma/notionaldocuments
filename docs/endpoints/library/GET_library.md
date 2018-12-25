# Library Resources

    GET library
    
## Description

Gets all the books in the datastore.

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
    <uid>: <Book>
  }, ...
]
```
***

## Errors

* `401` - No active firebase session.
* `500` - All other errors.

***

Last updated May 9, 2018.
