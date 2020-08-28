const loadShoppies = () => {
    window.location="shoppies.html";
}

const redirect = () => {
    if (nomineeCount === 5) {
        window.location="redirect.html";
    } else {
        let banner = document.getElementById("banner");
        banner.innerHTML = `
        <article class="message">
            <div class="message-header">
                <p>Please add five nominations</p>
            </div>
        </article>`;

        banner.setAttribute("style", "margin-bottom: 15px");
    }
}
