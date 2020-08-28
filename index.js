var currentNominees = new Map;
var nomineeCount = 0;

const autoCompleteConfig = {
    renderOption(movie) {
        const imgSrc = movie.Poster === 'N/A' ? '' : movie.Poster;
        // disable button if movie is already on nominations list
        if (currentNominees.has(movie.Title.concat(movie.Year))) {
            return `
                <img src="${imgSrc}"/>
                <div class="details">${movie.Title} (${movie.Year})</div>
                <button disabled="disabled">Nominate</button>
                `;
        }

        // disable button if user already has 5 nominations
        if (nomineeCount >= 5) {
            return `
                <img src="${imgSrc}"/>
                <div class="details">${movie.Title} (${movie.Year})</div>
                <button disabled="disabled">Nominate</button>
            `;
        }

        let filterTitle = movie.Title.replace(/'/g, '');

        return `
            <img src="${imgSrc}"/>
            <div class="details">${movie.Title} (${movie.Year})</div>
            <button onClick="addNominee('${filterTitle}', '${movie.Year}')">Nominate</button>
        `;

    },
    inputValue(movie) {
        return movie.Title;
    },
    async fetchData(searchTerm) {
        const response = await axios.get('https://www.omdbapi.com/', {
            params: {
                apikey: 'cb525a8b',
                s: searchTerm
            }
        });
        if (response.data.Error) {
            document.querySelector('#left-summary').innerHTML = `No results for "${searchTerm}"`;
            return [];
        }
        // get array of different movies fetched
        return response.data.Search;
    }
};

createAutoComplete({
    ...autoCompleteConfig,
    root: document.querySelector('#left-autocomplete'),
    onOptionSelect(movie) {
        //document.querySelector('.tutorial').classList.add('is-hidden');
        onMovieSelect(movie, document.querySelector('#left-summary'), 'left');
    }
});

// increment to create unique ids
let idCount = 0;

// add movie to nominations list (if it is not already added) if user clicks nominate button
const addNominee = (title, year) => {
    const selection = document.querySelector('.empty');
    const details = document.getElementById(title.concat(year));

    //disable nominate button that appears when user clicks on movie details
    if (details !== null) {
        details.setAttribute("disabled", "disabled");
    }

    // remove message telling user to add 5 nominations 
    let banner = document.getElementById("banner");
    if (banner !== null) {
        banner.innerHTML = ``;
        banner.removeAttribute("style");
    }

    // set unique id for each nominee
    selection.setAttribute("id", title.concat(idCount));
    selection.setAttribute("style", "background-color: #efece3");
    selection.setAttribute("class", "filled panel-block");
    selection.innerHTML = `
        <div class="details">${title} (${year})</div>
        <button onClick="removeNominee('${title}', '${year}')">Remove</button>
    `;
      
    // keep track of movies already nominated (many duplicate movie names so concat the year to avoid being overridden)
    // store id as the value 
    currentNominees.set(title.concat(year), title.concat(idCount));
    idCount++;

    // keep track of number of movies added to nominations list
    nomineeCount++;

    // display banner after five nominees have been added
    if (nomineeCount === 5) {
        let banner = document.getElementById("banner");
        banner.innerHTML = `
        <article class="message">
            <div class="message-header">
                <p>Thank you for your nominations!</p>
            </div>
            <div class="message-body">
                <p>You may now submit your selections.</p>
                <p>Changed your mind about a movie? No problem. Remove any selection and search for a better fit!</p>
            </div>
        </article>`;

        banner.setAttribute("style", "margin-bottom: 15px");
    }
};

// remove movie from nominations list
const removeNominee = (title, year) => {
    // get id of movie to remove
    const id = currentNominees.get(title.concat(year));
    let nominee = document.getElementById(id);

    //enable nominate button that appears when user clicks on movie details
    const details = document.getElementById(title.concat(year));

    if (details !== null) {
        details.removeAttribute("disabled");
    }

    nomineeCount--;

    if (nomineeCount < 5) {
        document.getElementById("banner").innerHTML = ``;
        document.getElementById("banner").removeAttribute("style");
    }

    nominee.remove();

    //remove movie from map
    currentNominees.delete(title.concat(year));

    const option = document.createElement('li');
    option.classList.add('panel-block');
    option.classList.add('empty');
    option.innerHTML = `<p><span>Choose a Film</span></p>`;

    document.getElementById("nominee-list").appendChild(option);
};

let leftMovie;

const onMovieSelect = async (movie, summaryElement, side) => {
    const response = await axios.get('https://www.omdbapi.com/', {
        params: {
            apikey: 'cb525a8b',
            i: movie.imdbID
        }
    });

    summaryElement.innerHTML = movieTemplate(response.data);

    leftMovie = response.data;

};


// display movie statistics if movie result is selected
const movieTemplate = movieDetail => {
    const dollars = parseInt(
        movieDetail.BoxOffice
    );

    const imdbRating = parseFloat(movieDetail.imdbRating);
    const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ''));

    const awards = movieDetail.Awards.split(' ').reduce((prev, word) => {
        const value = parseInt(word);

        if (isNaN(value)) {
            return prev;
        } else {
            return prev + value;
        }
    }, 0);

    // create unique id for nominate button that is inside movie details (make this different than the id assigned to the list elements)
    const buttonId = movieDetail.Title.concat(movieDetail.Year);
    let nominateButton;
    if (currentNominees.has(buttonId)) {
        nominateButton = `<button id="${buttonId}" onClick="addNominee('${movieDetail.Title}', '${movieDetail.Year}')" disabled="disabled">Nominate</button>`;
    } else {
        nominateButton = `<button id="${buttonId}" onClick="addNominee('${movieDetail.Title}', '${movieDetail.Year}')">Nominate</button>`;
    }

    return `
    <article class="media">
      <figure class="media-left">
        <p class="image">
          <img src="${movieDetail.Poster}" />
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <h1>${movieDetail.Title}</h1>
          ${nominateButton}
          <h4>${movieDetail.Genre}</h4>
          <p>${movieDetail.Plot}</p>
        </div>
      </div>
    </article>
    <article data-value=${awards} class="notification">
        <p class="title">${movieDetail.Awards}</p>
        <p class="subtitle">Awards</p>
    </article>
    <article data-value=${dollars} class="notification">
        <p class="title">${movieDetail.BoxOffice}</p>
        <p class="subtitle">Box Office</p>
    </article>
    <article data-value=${imdbRating} class="notification">
        <p class="title">${movieDetail.imdbRating}</p>
        <p class="subtitle">IMDB Rating</p>
    </article>
    <article data-value=${imdbVotes} class="notification">
        <p class="title">${movieDetail.imdbVotes}</p>
        <p class="subtitle">IMDB Votes</p>
    </article>
  `;

};

