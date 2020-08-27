var currentNominees = new Map;
var nomineeCount = 0;

const autoCompleteConfig = {
    renderOption(movie) {
        const imgSrc = movie.Poster === 'N/A' ? '' : movie.Poster;
        // disable button if movie is already on nominations list
        if (currentNominees.has(movie.Title)) {
            if (currentNominees.get(movie.Title) === movie.Year) {
                return `
                <img src="${imgSrc}"/>
                ${movie.Title} (${movie.Year})
                <button disabled="disabled">Nominate</button>
                `;
            }
        }

        if (nomineeCount >= 5) {
            return `
                <img src="${imgSrc}"/>
                ${movie.Title} (${movie.Year})
                <button disabled="disabled">Nominate</button>
            `;
        }

        let filterTitle = movie.Title.replace(/'/g, '');

        return `
            <img src="${imgSrc}"/>
            ${movie.Title} (${movie.Year})
            <button onClick="addNominee('${filterTitle}', '${movie.Year}')">Nominate</button>
        `;

    },
    inputValue(movie) {
        return movie.Title;
    },
    async fetchData(searchTerm) {
        const response = await axios.get('http://www.omdbapi.com/', {
            params: {
                apikey: 'cb525a8b',
                s: searchTerm
            }
        });
        if (response.data.Error) {
            document.querySelector('#left-summary').innerHTML = `No Results Found`;
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

// add movie to nominations list (if it is not already added) if user clicks nominate button
const addNominee = (title, year) => {
    let nomList = document.querySelector('#nominee-list');
    const selection = document.createElement('li');
    // set unique id for each nominee
    selection.setAttribute("id", title);
    selection.innerHTML = `
        <div class="details">${title} (${year})</div>
        <button onClick="removeNominee('${title}', '${year}')">Remove</button>
    `;

    selection.setAttribute("class", "panel-block");
    nomList.appendChild(selection);

    // keep track of movies already nominated and disable button
    currentNominees.set(title, year);

    // keep track of number of movies added to nominations list
    nomineeCount++;
    // display banner after five nominees have been added
    if (nomineeCount === 5) {
        document.getElementById("banner").innerHTML = `
        <article class="message">
            <div class="message-header">
                <p>Thank you for your nominations!</p>
            </div>
            <div class="message-body">
                Changed your mind about a movie? No problem. Remove any selection & search for a better fit!
            </div>
        </article>`;
    }
};

// remove movie from nominations list
const removeNominee = (title, year) => {
    currentNominees.delete(title);
    let nominee = document.getElementById(title);
    nominee.remove();
    nomineeCount--;

    if (nomineeCount < 5) {
        document.getElementById("banner").innerHTML = ``;
    }
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

    const metascore = parseInt(movieDetail.Metascore);
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
          <h4>${movieDetail.Genre}</h4>
          <p>${movieDetail.Plot}</p>
        </div>
      </div>
    </article>
    <article data-value=${awards} class="notification is-primary">
        <p class="title">${movieDetail.Awards}</p>
        <p class="subtitle">Awards</p>
    </article>
    <article data-value=${dollars} class="notification is-primary">
        <p class="title">${movieDetail.BoxOffice}</p>
        <p class="subtitle">Box Office</p>
    </article>
    <article data-value=${metascore} class="notification is-primary">
        <p class="title">${movieDetail.Metascore}</p>
        <p class="subtitle">Metascore</p>
    </article>
    <article data-value=${imdbRating} class="notification is-primary">
        <p class="title">${movieDetail.imdbRating}</p>
        <p class="subtitle">IMDB Rating</p>
    </article>
    <article data-value=${imdbVotes} class="notification is-primary">
        <p class="title">${movieDetail.imdbVotes}</p>
        <p class="subtitle">IMDB Votes</p>
    </article>
  `;

};
