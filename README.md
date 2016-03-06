# MALV-API
REST API that allows to exchange data with MyAnimeList.

## Anime
Provide details on an anime that are not available in the animelist.

#### URL

  `/anime/:id`

#### Method

  `GET`

#### URL params

   - **id** *integer*

#### Response

  JSON object containing the following fields:
  - **genres** *array of string*
  - **popularity** *integer*
  - **rank** *integer*
  - **rating** *string*
  - **score** *float*
  - **studios** *array of string*
  - **synopsis** *string*

#### Example

  `/anime/1`

```json
{
  "genres": [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Sci-Fi",
    "Space"
  ],
  "popularity": 29,
  "rank": 23,
  "rating": "R - 17+ (violence &amp; profanity)",
  "score": 8.83,
  "studios": [
    "Sunrise"
  ],
  "synopsis": "In the year 2071, humanity has colonized several of the planets [...]"
}
```