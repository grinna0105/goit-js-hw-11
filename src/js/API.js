import axios from 'axios';

const API_URL = 'https://pixabay.com/api/';
const API_KEY = '33581420-c3bb15cb49e1c5dfaa2eeb9a8';
// axios.defaults.baseURL = API_URL;

export class API {
    #page = 1;
    #per_page = 40;
    #query = '';
    #totalPages = 0;

    async getImages() {
        const options = {
            page: this.#page,
            q: this.#query,
            per_page: this.#per_page,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: true,
        }

        const response = `${API_URL}?key=${API_KEY}`;
        const { data } = await axios.get(response, { options, });
        return data;
    }

    get query() {
        this.#query;
    }

    set query(newQuery) {
        this.#query = newQuery;
    }

    incrementPage() {
        this.#page += 1;
    }

    resetPage() {
        this.#page = 1;
    }

    setTotal(total) {
        this.#totalPages = total;
    }

    hasMorePhotos() {
        return this.#page < Math.ceil(this.#totalPages / this.#per_page);
    }
}
