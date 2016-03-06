# MALV-API
REST API that allows to exchange data with MyAnimeList.

## Anime
Provide details on an anime that are not available in the animelist.

- **URL:**

  `/anime/:id`

- **Method:**

  `GET`

-  **URL params:**

   - **id** *integer*

- **Response:**

  JSON object containing the following fields:
  - **genres** *array of string*
  - **popularity** *integer*
  - **rank** *integer*
  - **rating** *string*
  - **score** *float*
  - **studios** *array of string*
  - **synopsis** *string*

- **Example:**

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
  "synopsis": "In the year 2071, humanity has colonized several of the planets and moons of the solar system leaving the now uninhabitable surface of planet Earth behind. The Inter Solar System Police attempts to keep peace in the galaxy, aided in part by outlaw bounty hunters, referred to as &quot;Cowboys&quot;. The ragtag team aboard the spaceship Bebop are two such individuals.<br /> <br />Mellow and carefree Spike Spiegel is balanced by his boisterous, pragmatic partner Jet Black as the pair makes a living chasing bounties and collecting rewards. Thrown off course by the addition of new members that they meet in their travels&mdash;Ein, a genetically engineered, highly intelligent Welsh Corgi; femme fatale Faye Valentine, an enigmatic trickster with memory loss; and the strange computer whiz kid Edward Wong&mdash;the crew embarks on thrilling adventures that unravel each member&#039;s dark and mysterious past little by little. <br /><br />Well-balanced with high density action and light-hearted comedy, <i>Cowboy Bebop</i> is a space Western classic and an homage to the smooth and improvised music it is named after.  <br /><br />[Written by MAL Rewrite]"
}
```