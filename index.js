const trackListContainer = document.querySelector(".feed__section-tracklist");
const searchForm = document.querySelector(".music__menu-search-form");

// feed section
const feed = document.querySelector(".feed");
const imageAlbumCover = document.querySelector(
  ".feed__section-artist-img-real"
);
const albumName = document.querySelector(".feed__section-info-title");
const albumArtist = document.querySelector(".feed__section-info-artist");
const albumReleaseDate = document.querySelector(
  ".feed__section-info-release-date"
);
const searchErrorIndicator = document.querySelector(".errorHandling");
const errorCode = {
  apiSlowingDown: "LA API ESTA TARDANDO MAS DE LO NORMAL...",
  artistUnkown: "ESTE ARTISTA NO ESTA EN LA BASE DE DATOS",
  emptySearch: "DEBES INTRODUCIR ALGO",
  ok: "",
};

const buildSearch = (artistName, dateRelease, albumTitle, albumPicSource) => {
  albumArtist.innerText = artistName;
  albumReleaseDate.innerText = `Released ${dateRelease}`;
  albumName.innerText = albumTitle;
  imageAlbumCover.src = albumPicSource.images[0].image;
  try {
    feed.style.backgroundImage = `url('${albumPicSource.images[1].image}')`;
  } catch {
    feed.style.backgroundImage = `url('${albumPicSource.images[0].image}')`;
  }
};

const startCollectingData = (localString) => {
  const collectArtistData = (artistData) => {
    console.log(artistData.artists);
    let artistId = artistData.artists[0].id;
    let artistName = artistData.artists[0].name;
    return { artistName: artistName, artistId: artistId };
  };

  const collectAlbumData = (albumData) => {
    let getRandomIndex = Math.floor(Math.random() * albumData.releases.length);
    let randomRelease = albumData.releases[getRandomIndex];
    console.log(randomRelease);
    let releaseData = randomRelease.date;
    let albumName = randomRelease.title;
    return {
      randomRelease: randomRelease,
      releaseData: releaseData,
      albumName: albumName,
    };
  };

  const data = getSearchData(localString);
  data.then((res) => {
    let { artistName, artistId } = collectArtistData(res);
    getAlbumRandom(artistId).then((res) => {
      let { randomRelease, releaseData, albumName } = collectAlbumData(res);
      getAlbumCover(randomRelease.id)
        .then((res) => {
          console.log(res);
          buildSearch(artistName, releaseData, albumName, res);
        })
        .catch(() => {
          collectAlbumData();
        });
    });
  });
};

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (validateSearch(e.target.elements[1].value) == 0) {
    showError(errorCode.ok);
    let localString = getTextFormatReady(e.target.elements[1].value);
    startCollectingData(localString);
  } else {
    showError(errorCode.emptySearch);
  }
  //   let searched = getSearch(localString);
  //   console.log(searched);
});

// FETCH API AXIOS
//API FOR MUSIC DATABASE -> https://rapidapi.com/theaudiodb/api/theaudiodb/
// API FOR LISTEN MUSIC -> https://api.deezer.com/version/service/id/method/?parameters
const instance = axios.create({
  baseURL: "https://musicbrainz.org/ws/2/",
});

const coverImageInstance = axios.create({
  baseURL: "http://coverartarchive.org/",
});

const getTextFormatReady = (formText) => {
  let newString = "";
  console.log(formText);
  newString = formText.replaceAll(" ", "%");
  return newString;
};

const validateSearch = (text) => {
  if (text == "") {
    return 1;
  }
  return 0;
};

const showError = (errorText) => {
  searchErrorIndicator.innerText = errorText;
};

const getSearchData = (searchText) => {
  const axiosProm = instance.get(`artist?query=${searchText}`);
  const axiosData = axiosProm.then((res) => res.data);
  return axiosData;
};

const getAlbumRandom = (artistId) => {
  const axiosProm = instance.get(`release?artist=${artistId}`);
  const axiosData = axiosProm.then((res) => res.data);
  return axiosData;
};

const getAlbumCover = (albumId) => {
  const axiosProm = coverImageInstance.get(`release/${albumId}`);
  const axiosData = axiosProm
    .then((res) => res.data)
    .catch((err) => {
      showError(errorCode.artistUnkown);
    });
  return axiosData;
};
