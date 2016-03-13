# MALV-API
Node.js REST API that allows to interact with MyAnimeList.

## Configuration
A JSON file named config.json located at the API root is used to configure it.

### Options
Here are the possible options:
- **encryptionAlgorithm** *string*
  - **Description:** OpenSSL algorithm used to encrypt the passwords.
  - **Default value:** aes256

- **encryptionKey** *string* **Required**
  - **Description:** Key used to encrypt passwords.

- **logging** *boolean*
  - **Description:** If true, write the logs in a file named logs.txt located in the API root.
  - **Default value:** true

- **myAnimeList** *object* Configuration relative to MyAnimeList.
  - **maxSockets** {integer}
    - **Description:** Max number of requests simultaneous sent to MyAnimeList.
    - **Default value:** 3

  - **retries** {integer}
    - **Description:** Number of retries to make when MyAnimeList returns a *Too Many Requests* error.
    - **Default value:** 3

  - **retryDelay** {integer}
    - **Description:** Delay between 2 retries in milliseconds.
    - **Default value:** 500

  - **timeout** {integer}
    - **Description:** Timeout in milliseconds for MyAnimeList requests.
    - **Default value:** 10000

- **originsAllowed** {string}
  - **Description:** Hosts authorized to communicate with the API. Should be defined.
  - **Default value:** *

- **port** {integer}
  - **Description:** Port used to run the API.
  - **Default value:** 8080

- **stackTraceLimit** {integer}
  - **Description:** Number of lines to display in the stack when an error occurs.
  - **Default value:** 5

### Example

```json
{
  "encryptionKey": "Snorlax",
  "myAnimeList": {
    "timeout": 5000
  },
  "port": 9000,
  "stackTraceLimit": 10
}
```

## Get anime lists and details

### Anime
Provide details on an anime that are not available in the animelist.

#### URL

`/anime/:id`

#### Method

`GET`

#### URL params

- **id** *integer*

#### Response

JSON object containing the following fields:
- **endDate** *timestamp*
- **episodes** *timestamp*
- **genres** *Array of string*
- **imageUrl** *string*
- **membersScore** *float*
- **popularity** *integer*
- **rank** *integer*
- **rating** *string*
- **startDate** *timestamp*
- **status** *string*
- **studios** *Array of string*
- **synonyms** *Array of string*
- **synopsis** *string*
- **title** *string*
- **type** *string*

#### Example

`/anime/1`

```json
{
  "endDate": 924904800000,
  "episodes": "26",
  "genres": [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Sci-Fi",
    "Space"
  ],
  "imageUrl": "http://cdn.myanimelist.net/images/anime/4/19644.jpg",
  "membersScore": 8.83,
  "popularity": 29,
  "rank": 23,
  "rating": "R - 17+ (violence &amp; profanity)",
  "startDate": 891554400000,
  "status": "Finished Airing",
  "studios": [
    "Sunrise"
  ],
  "synonyms": [
    "Cowboy Bebop"
  ],
  "synopsis": "In the year 2071, humanity has colonized several of the planets [...]",
  "title": "Cowboy Bebop",
  "type": "TV"
}
```

### Anime list
Provide the anime list of a user.

#### URL

`/animelist/:user`

#### Method

`GET`

#### URL params

   - **user** *string*

#### Response

Array of JSON objects containing the following fields:
- **endDate** *timestamp*
- **episodes** *integer*
- **id** *integer*
- **imageUrl** *string*
- **myFinishDate** *timestamp*
- **myScore** *integer*
- **myStartDate** *timestamp*
- **myStatus** *string*
  - completed
  - dropped
  - onHold
  - planToWatch
  - watching
- **myWatchedEpisodes** *integer*
- **startDate** *timestamp*
- **status** *string*
  - Currently Airing
  - Finished Airing
  - Not yet aired
- **synonyms** *Array of string*
- **title** *string*
- **type** *string*
  - Movie
  - Music
  - ONA
  - OVA
  - Special
  - TV

#### Example

`/animelist/youbi325`

```json
[
  {
    "endDate": 924912000000,
    "episodes": 26,
    "id": 1,
    "imageUrl": "http://cdn.myanimelist.net/images/anime/4/19644.jpg",
    "myFinishDate": 1355529600000,
    "myScore": 10,
    "myStartDate": 1355097600000,
    "myStatus": "completed",
    "myWatchedEpisodes": 26,
    "startDate": 891561600000,
    "status": "Finished Airing",
    "synonyms": [],
    "title": "Cowboy Bebop",
    "type": "TV"
  },
  {
    "endDate": 907113600000,
    "episodes": 26,
    "id": 6,
    "imageUrl": "http://cdn.myanimelist.net/images/anime/7/20310.jpg",
    "myFinishDate": 1425340800000,
    "myScore": 9,
    "myStartDate": 1424131200000,
    "myStatus": "completed",
    "myWatchedEpisodes": 26,
    "startDate": 891388800000,
    "status": "Finished Airing",
    "synonyms": [],
    "title": "Trigun",
    "type": "TV"
  }
]
```

### Top list
Provide a top list.

#### URL

`/toplist/:name/:page`

#### Method

`GET`

#### URL params

- **name** *string*
  - all
  - airing
  - bypopularity
  - movie
  - ova
  - special
  - tv
  - upcoming
- **page** *integer*

#### Response

Array of JSON objects containing the following fields:
- **imageUrl** *string*
- **score** *float*
- **title** *string*
- **topRank** *integer*

#### Example

`/toplist/all/1`

```json
[
  {
    "imageUrl": "http://cdn.myanimelist.net/images/anime/5/47421.jpg",
    "score": 9.25,
    "title": "Fullmetal Alchemist: Brotherhood",
    "topRank": 1
  },
  {
    "imageUrl": "http://cdn.myanimelist.net/images/anime/5/73199.jpg",
    "score": 9.17,
    "title": "Steins;Gate",
    "topRank": 2
  }
]
```

### Verify credentials
Verify credentials of a MyAnimeList account.

#### URL

`/verifycredentials/:user/:password`

#### Method

`GET`

#### URL params

- **user** *string*
- **password** *string*

#### Response

JSON object containing the following fields:
- **authenticated** *boolean*
- **secureKey** *string* Only if authenticated is true.

#### Examples

##### Success

`/verifycredentials/youbi325/rightpassword`

```json
{
  "authenticated": true,
  "secureKey": "Hiuuh679Ygugbuv"
}
```

##### Fail

`/verifycredentials/youbi325/wrongpassword`

```json
{
  "authenticated": false
}
```

## Update user anime list

### Add anime
Add an anime in a user anime list.

#### URL

`/addanime/:user/:id/:secureKey`

#### Method

`PUT`

#### URL params

- **user** *string*
- **id** *integer*
- **secureKey** *string* (See Verify credentials)

#### Data params

JSON object that must contain the following field:
- **myStatus** *string* **Required**
  - completed
  - dropped
  - onHold
  - planToWatch
  - watching

#### Response

`HTTP 200`

#### Example

`/addanime/youbi325/1/Hiuuh679Ygugbuv`

```json
{
  "myStatus": "watching"
}
```

`HTTP 200`

### Update anime
Update an anime in a user anime list.

#### URL

`/updateanime/:user/:id/:secureKey`

#### Method

`PATCH`

#### URL params

- **user** *string*
- **id** *integer*
- **secureKey** *string* (See Verify credentials)

#### Data params

JSON object that can contain the following fields:
- **myFinishDate** *timestamp*
- **myScore** *integer*
- **myStartDate** *timestamp*
- **myStatus** *string*
  - completed
  - dropped
  - onHold
  - planToWatch
  - watching
- **myWatchedEpisodes** *integer*

All these fields are optionals. If a field is not provided, its value will not change.

#### Response

`HTTP 200`

#### Example

`/updateanime/youbi325/1/Hiuuh679Ygugbuv`

```json
{
  "myScore": 8,
  "myWatchedEpisodes": 700
}
```

`HTTP 200`