/**
 * Retrieves the Spotify access token from the user's cookies.
 */
async function getAccessToken() {
    // Credit to Mac on Stack Overflow
    var a = "spotify_access_token";
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : null;
}

/**
 * Returns a boolean indicating whether the user has signed in yet.
 */
async function hasAuthenticated() {
    var accessToken = await getAccessToken()
    return accessToken !== null;
}

/**
 * Retrieves songs from a Spotify API URL.
 * @param {string} sourceUrl The source URL.
 */
async function getSongs(sourceUrl) {
    var accessToken = await getAccessToken();
    var data = await $.ajax({
        url: sourceUrl,
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    })
    // If there are still items, get them too
    var songs = data.items.map(x => x.track)
    if (data.next == null) {
        return songs
    } else {
        nextSongs = await getSongs(data.next)
        return songs.concat(nextSongs)
    }
}

/**
 * Gets all songs in the user's Spotify library. 
 */
async function getLibrarySongs() {
    return getSongs('https://api.spotify.com/v1/me/tracks?offset=0&limit=50');
}

/**
 * Gets all songs in a Spotify playlist.
 * @param {string} playlistId The playlist's ID.
 * @param {string} userId The user ID of the user who created the playlist.
 *                        Defaults to 'me'.
 */
async function getPlaylistSongs(playlistId, userId = 'me') {
    return getSongs(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`)
}

/**
 * Gets all the user's playlists.
 * @param {string} url The URL to use. Should be left as null for external calls.
 */
async function getPlaylists(url = null) {
    var accessToken = await getAccessToken();
    var data = await $.ajax({
        url: url || 'https://api.spotify.com/v1/me/playlists?offset=0&limit=50',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    })
    // If there are still items, get them too
    var playlists = data.items
    if (data.next == null) {
        return playlists
    } else {
        nextPlaylists = await getPlaylists(data.next)
        return playlists.concat(nextSongs)
    }
}
