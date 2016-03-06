# MALV-API
REST API that allows to exchange data with MyAnimeList. The API returns JSON objects.

## Anime
Provide details on an anime that are not available in the animelist.

- **URL**

  `/anime/:id`

- **Method**

  `GET`

-  **URL Params**

   - **id** *integer*

- **Response**

  JSON object containing the following fields:
  - **genres** *array of string*
  - **popularity** *integer*
  - **rank** *integer*
  - **rating** *string*
  - **score** *float*
  - **studios** *array of string*
  - **synopsis** *string*