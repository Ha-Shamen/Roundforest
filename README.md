# Project Title

Brief project description goes here

## Table of Contents

- [API Usage](#API-Usage)
- [Contributing](#contributing)

## API-Usage
Each section represents and api route
### create
create (gets the seller product structure and insert it to the DB)
requires a body as application/json content type with the following fields and types
```
{
    ASIN: string,
    locale: string,
    sellerName: string,
    availability: boolean,
    price: float,
    productName: string,
    productLink: string
}
```
### read
read (gets <ASIN, Locale> and returns the seller_product if exists)
requires a body as application/json content type with the following fields and types
```
{
    ASIN: string,
    locale: string
}
```
### update
update (updates a seller product data by the product identifiers)
requires a body as application/json content type with the following fields and types

NOTE: **All data will be updated!** 
```
{
    ASIN: string,
    locale: string,
    sellerName: string,
    availability: boolean,
    price: float,
    productName: string,
    productLink: string
}
```
### delete
delete (can delete a bulk of products by <ASIN, Locale>[])
requires a body as application/json content type with the following fields and types
multiple objects can be appended
```
[
    {
        ASIN: string,
        locale: string
    }
]
```
### readBySeller
readBySeller (gets a seller_name and returns all available products)
requires a body as application/json content type with the following fields and types
```
[
    {
        sellerName: string
    }
]
```
### getAnalysis
getAnalysis (get the amount of available products, unavailable products, average
price per each seller + locale).
No body is required
Return sample
```
[
    {
        "seller_name": string,
        "locale": string,
        "average_price": float,
        "available_products": int,
        "unavailable_products": int
    }
]
```
### Upload
Upload expects form-data with one value, namely 'file', with the csv loaded to it.
Note: in order to speed up the process in cases of large files the file is downloaded locally and confirmation is sent
to the user that the file was recieved.
Not implemented - the idea is to have another module that reports once all the data have been inserted/updated
## Contributing

Alon Fux
