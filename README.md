# MALV-API
REST API that allows to exchange data with MyAnimeList. The API returns JSON objects.

## Anime
Provide details on an anime that are not available in the animelist.

#### Syntax
```
/anime/[id]
```

#### Return
Anime object.
```json
{
  "genres": ["Genre 1", "Genre 2"],
  "popularity": 1,
  "rank": 1,
  "rating": "Rating",
  "score": 10,
  "studios": ["Studio 1", "Studio 2"],
  "synopsis": "Synopsis"
}
```