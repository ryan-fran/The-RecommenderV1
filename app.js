const APIController = (function() {
    
    const clientId = 'b0fd0123e7d84be19b70c17431c1291d';
    const clientSecret = '66d68b60f3fc4f11bab8d1c633e6e7df';

    const _getToken = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });
        const data = await result.json();
        console.log(data.access_token);
        return data.access_token;
    }

    const _getArtist = async (token, User_input) => {

        let request = "https://api.spotify.com/v1/search?q=" + User_input + "&type=artist";

        //https://api.spotify.com/v1/search?q=pitbull&type=artist
        const result = await fetch(request, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.artists.items;
    }

    const _getRelatedArtists = async (token, artistID) => {
        // insert ID into the link
        let requestRelated = "https://api.spotify.com/v1/artists/" + artistID + "/related-artists";

        // use link to get related artists
        const result = await fetch(requestRelated, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        // console.log(data)

        // dic of related artists
        //console.log("this is the dic of related artists", data.artists);
        return data.artists;
    }
    const _getRelatedArtistInfo = async (token, link) => {

        const result = await fetch(link, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data;
    }
    //geting artist top tracks
    const _getTopTracks = async (token, selectedArtistID) => {
        let requestTopTracks = "https://api.spotify.com/v1/artists/" + selectedArtistID + "/top-tracks"

         // use link to get related artists
         const result = await fetch(requestTopTracks, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        // console.log(data)

        // dic of related tracks
        return data.tracks
    }
// incapsalation = making it harder for others to find data
    return {
        getToken() {
            return _getToken();
        },
        getArtists(token, User_input) {
            return _getArtist(token, User_input);
        },
        getRealtedArtists(token, artistID) {
            return _getRelatedArtists(token, artistID);
        },
        getRelatedArtistInfo(token, link){
            return _getRelatedArtistInfo(token, link);
        },
        getTopTracks(token, selectedArtistID){
            return _getTopTracks(token, selectedArtistID);
        },

    }
})();

// User Interface Controler / conects JS to HTML
const UIController = (function() {

    //object to hold references to html selectors
    const DOMElements = {
        buttonSubmit: '#btn_submit', 
        artistTextbox: '#User_input',
        hfToken: '#hidden_token',
        artistOutput: '.artist-list',
        artistsPictures: '#artistPictures'
    }

    return{

        //method to get input fields
        inputField() {
            return {
                submit: document.querySelector(DOMElements.buttonSubmit),
                userinput: document.querySelector(DOMElements.artistTextbox),
                relatedArtists: document.querySelector(DOMElements.artistOutput),
                artistPictures: document.querySelector(DOMElements.artistsPictures)
            }
        },

        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },

         // reterns the stored token
         getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        },

        // reseting the output so that it is clear
        resetArtistsOutput() {
            this.inputField().relatedArtists.innerHTML = '';
            this.resetArtistsPictures()
        },

        //reset pictues
        resetArtistsPictures(){
            this.inputField().artistPictures.innerHTML = '';
        },

        // create the list of related artists in the HTML
        createRelatedArtist(link, name) {
            const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${link}">${name}`;
            document.querySelector(DOMElements.artistOutput).insertAdjacentHTML('beforeend', html);
        },

        createPictires(img, name, artistLink, genres, tracks){

            const detailDiv = document.querySelector(DOMElements.artistsPictures);
            detailDiv.innerHTML = '';
            //<div class="list-group-item row col-sm-12 px-0">
            // <label for="Artist" class="form-label col-sm-12">Artist: ${name}</label>
            // </div>

            const html = 
            `
            <div class="row col-sm-12 px-0">
                <img src="${img}" alt="">        
            </div>
            <div
                <a herf="${artistLink}" class="list-group-item list-group-item-action row col-sm-12 px-0" id="${artistLink}">Artist: ${name}
            </div>
            <div class="list-group-item list-group-item-action row col-sm-12 px-0">
                <label for="Genre" class="form-label col-sm-12">Genre(s): ${genres}</label>
            </div>
            <div class="list-group-item list-group-item-action row col-sm-12 px-0">
                <label for="Genre" class="form-label col-sm-12">Top Songs: ${tracks}</label>
            </div>
            `;

            detailDiv.insertAdjacentHTML('beforeend', html);
        }
    }
}
)();

// Conects the User interdace and API to make the program work
const APPController = (function(UICtrl, APICtrl) {

    const DOMInputs = UICtrl.inputField();

    // get token on page load
    const lodeToken = async () => {
        //get the token
        const token = await APICtrl.getToken();
        //saving the token to the HTML page
        UICtrl.storeToken(token);
    }    

    DOMInputs.submit.addEventListener('click', async (e) => {

        // preventing page relod after submit button pressed
        e.preventDefault();

        //clear / reset the related artist HTML page
        UICtrl.resetArtistsOutput();

        let User_input = DOMInputs.userinput.value;
        // get token
        const token = UICtrl.getStoredToken().token;


        // use the input to retreve id of the artist that user inputed
        let artists = await APICtrl.getArtists(token, User_input);
        //get first artist ID from a list of artists
        let artistID = await artists[0]["id"];


        // loding related artests
        let relatedArtists = await APICtrl.getRealtedArtists(token, artistID);
        // add the original artist in frount
        relatedArtists.unshift(artists[0])
        // get links / name / artist for each artist
        for(let i = 0; i <= 5; i++){

            let herf = await relatedArtists[i]["href"];
            let name = await relatedArtists[i]["name"];
            UICtrl.createRelatedArtist(herf, name);

        }
    });

    DOMInputs.relatedArtists.addEventListener('click', async (e) => {
        e.preventDefault();
        // get token
        const token = UICtrl.getStoredToken().token;
        // clear pictures
        UICtrl.resetArtistsPictures();
        //get URL Link of selected artist 
        let selectedArtistLink = e.target.id;
        //go through the artist and get immage name 
        let selectedArtestInfo = await APICtrl.getRelatedArtistInfo(token, selectedArtistLink);
        console.log(selectedArtestInfo);


        //GETTING NAMES AND PICTURES ON THE HTML PAGE

        //lode the pictue and name
        let image = selectedArtestInfo.images[2].url;
        let name = selectedArtestInfo.name;
        let artistLink = selectedArtestInfo.external_urls.spotify;
        let genre = selectedArtestInfo.genres;

        //go through each lie of genre array and capitalize leters
        for (let i = 0; i < genre.length; i++) {

            let firstLetter = genre[i].charAt(0).toUpperCase();
            let otherLetters = genre[i].substring(1, genre[i].length);
            let combined = firstLetter + otherLetters;

            let finalCombined = combined[0];

            //capitalize the letters in other words
            for (let j = 1; j < combined.length; j++) {
                if (combined[j-1] == " ") {
                    let upperCaseLetter = combined[j].toUpperCase();
                    finalCombined += upperCaseLetter;
                }

                else{
                    finalCombined += combined[j];
                }
            }

            genre[i] = finalCombined;
        };

        let genres = genre.join(", ");  


        //GRT TOP TRACKS OF THE ARTIST
        //selected artist ID
        let selectedArtistID = selectedArtestInfo.id;
        //lode link for artist top track and name of track
        let artistTracks = await APICtrl.getTopTracks(token, selectedArtistID);
        console.log(artistTracks)
        // getting top 3 songs
        let track = [];
        for(let i = 0; i <= 2; i++){
            
            track.push(artistTracks[i].name);

        }

        let tracks = track.join(", ");
        //add everything to HTML page
        UICtrl.createPictires(image, name, artistLink, genres, tracks);

    });

    return {
        init() {
            console.log("App is starting");
            lodeToken();
        }
    }

})(UIController, APIController);

APPController.init();
