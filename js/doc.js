/**
 * Populates the playlist selector dropdown with playlists. If the user isn't
 * connected to Spotify, the dropdown is disabled.
 */
async function populatePlaylistSelector() {
    // Find and clear the selector
    var selector = $('select#playlists');
    selector.empty();

    // Disable if not signed in
    var hasAuth = await hasAuthenticated();
    if (!hasAuth) {
        selector.attr('disabled', 'true');
        selector.append($('<option></option>')
            .text('You must connect Spotify first'));
    }

    // Add the user's library as the first option
    selector.append($('<option></option>')
        .attr('value', 'library')
        .text('Your library'));

    // Insert each playlist as an option
    var playlists = await getPlaylists()
    playlists.forEach(p => {
        selector.append($('<option></option>')
            .attr('value', p.id)
            .text(p.name));
    });
}

/**
 * Calculates the number of times each artist in an array of songs occurs.
 * @param {*} songs An array of Spotify song objects.
 */
function calculateArtistCounts(songs) {
    // List like [['Paramore'], ['CHVRCHES', 'Eric Prydz']]
    var artists = songs.map(x => x.artists.map(a => a.name))

    // Flattens list to ['Paramore', 'CHVRCHES', 'Eric Prydz']
    var flatArtists = []
    artists.forEach(x => {
        x.forEach(a => {
            flatArtists.push(a)
        })
    })

    // Object like {'Paramore': 1, 'CHVRCHES': 1, 'Eric Prydz': 1}
    var counts = {}
    flatArtists.forEach(x => {
        counts[x] |= 0
        counts[x]++
    })

    return counts;
}

/**
 * Prepares Google Charts for use, waiting for it to be ready.
 */
async function chartInit() {
    google.charts.load('current', {'packages': ['corechart']})
    return new Promise(google.charts.setOnLoadCallback);
}

/**
 * Plots an object of song counts, like that returned by calculateArtistCounts,
 * onto the document's pie chart.
 * @param {*} counts The artist counts. 
 */
function plotCountsToChart(counts) {
    // List like [['Paramore', 1], ['CHVRCHES', 1], ['Eric Prydz', 1]]
    var convertedObject = $.map(counts, (v, k) => [[k, v]]);

    // Create a new data table containing our data
    var data = google.visualization.arrayToDataTable([
        ['Artist', 'Number of songs']
    ].concat(convertedObject));

    // Plot the data table as a pie chart
    var chart = new google.visualization.PieChart(
        document.getElementById('pie-chart'))
    chart.draw(data, { 
        chartArea: {
            width: '100%',
            height: '100%'
        },
        width: '95%',
        height: '95%',
        legend: 'none',
        pieSliceText: 'label',
        backgroundColor: '#333333',
    });
}

/**
 * Updates the pie chart based on the currently selected playlist.
 */
async function refreshChart() {
    var playlistId = $("#playlists").val();
    if (playlistId == "library") {
        var songs = await getLibrarySongs();
    } else {
        var songs = await getPlaylistSongs(playlistId);
    }

    var counts = calculateArtistCounts(songs);
    plotCountsToChart(counts);
}