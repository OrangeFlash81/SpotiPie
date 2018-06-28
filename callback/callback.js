function handleSpotifyCallback() {
    // Get the access token from the URL
    let accessToken = window.location.href
        .match(/access_token\=(.*)&token_type/)[1]

    // Set cookie with expiry time of one year
    let date = new Date();
    date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000)
    document.cookie = "spotify_access_token=" + accessToken + ";expires=" +
        date.toUTCString() + ";path=/";

    // Redirect to homepage
    document.location.href = "/"
}
