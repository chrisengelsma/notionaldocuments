## Notional API

The API is REST Api and requires firebase config authentication.
Currently, return format for all endpoints is JSON.


### User resources

* [**[`POST`] register**](endpoints/users/POST_register.md) 
* [**[`POST`] login**](endpoints/users/POST_login.md)
* [**[`GET`] logout**](endpoints/users/GET_logout.md)
* [**[`GET`] user/profile**](endpoints/users/GET_user_profile.md)
* [**[`POST`] user/profile**](endpoints/users/GET_user_profile.md)
* [**[`GET`] user/books**](endpoints/library/GET_books_user.md)
* [**[`POST`] user/books**](endpoints/library/POST_books_user.md)

***

### Library Resources
* [**[`GET`] library**](endpoints/library/GET_library.md)
* [**[`GET`] library/book/:uid**](endpoints/library/GET_library_book_uid.md)
* [**[`GET`] library/props/:uid**](endpoints/library/POST_library_props_uid.md)
* [**[`POST`] library/book**](endpoints/library/POST_library_book.md)
* [**[`POST`] library/book/:uid/update**](endpoints/library/POST_library_book_uid_update.md)
* [**[`POST`] library/props/:uid**](endpoints/library/POST_library_props_uid.md)

***

Last updated May 9, 2018.
