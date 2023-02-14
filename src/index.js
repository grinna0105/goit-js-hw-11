import './css/styles.css';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";


import { refs } from './js/refs';
import { API } from './js/API';
import { newMarkup } from './js/markup';
import { spinnerPlay, spinnerStop } from './js/spinner';


const simpleLightboxGallery = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
});

spinnerPlay();

window.addEventListener('load', () => {
  Notiflix.Notify.success('All resources finished loading!');
  spinnerStop();
});

refs.loadMoreBtn.classList.add('is-hidden');

const pixaby = new API();

const options = {
    root: null,
    rootMargin: '100px',
    threshold: 1.0,
};

const loadingImages = async function(entries, observer) {
    entries.forEach(async entry => {
        if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            pixaby.incrementPage();
            spinnerPlay();
            // entry.target.classList.add('active');
        
            try {
                spinnerPlay();
                const { hits } = await pixaby.getImages();
                const markup = createMarkup(hits);
                refs.gallery.insertAdjacentHTML('beforeend', markup);
                
                // Remove 'active' class otherwise
                // entry.target.classList.remove('active');
           
                if (pixaby.hasMorePhotos) {
                    const lastItem = document.querySelector('.gallery a:last-child');
                    observer.observe(lastItem);
                } else
                    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
                    simpleLightboxGallery.refresh();
                    scrollPage();
            } catch (err) {
                Notiflix.Notify.failure('Something went wrong!');
                clearPage();
            } finally {
                spinnerStop();
            }
        }
    });
};


const observer = new IntersectionObserver(loadingImages, options);

const onSubmit = async e => {
    e.preventDefault();

    const {
        elements: { searchQuery },
    } = e.target;

    const search_query = searchQuery.value.trim().toLowerCase();

    if (!search_query) {
            clearPage();
            Notiflix.Notify.info('Enter data to search!');
            return;
        }
        
    pixaby.query = search_query;
    clearPage();
    
    try {
        spinnerPlay();
        const { hits, total } = await pixaby.getImages();
        console.log({ hits, total });

        if (hits.length === 0) {
            Notiflix.Notify.failure(`Sorry, there are no images matching your ${search_query}. Please try again.`);
          return;
        }

        const markup = newMarkup(hits);
        refs.gallery.insertAdjacentHTML('beforeend', markup);

        pixaby.setTotal(total);
        Notiflix.Notify.success(`Hooray! We found ${total} images.`);

        if (pixaby.hasMorePhotos) {
        //refs.btnLoadMore.classList.remove('is-hidden');

        const lastItemGallery = document.querySelector('.gallery a:last-child');
        observer.observe(lastItemGallery);
        }
        simpleLightboxGallery.refresh();
    }  
    catch (error) {
        Notiflix.Notify.failure('Something went wrong!');
        clearPage();
    } finally {
        spinnerStop();
    }    
}
    
const onLoadMore = async () => {
    pixaby.incrementPage();
  
    if (!pixaby.hasMorePhotos) {
        refs.loadMoreBtn.classList.add('is-hidden');
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    }
    try {
        const { hits } = await pixaby.getImages();
        const markup = newMarkup(hits);
        refs.gallery.insertAdjacentHTML('beforeend', markup);
        simpleLightboxGallery.refresh();
    } catch (error) {
      Notiflix.Notify.failure('Something went wrong!');
      clearPage();
    }
};

function clearPage() {
    pixaby.resetPage();
    refs.gallery.innerHTML = '';
    refs.loadMoreBtn.classList.add('is-hidden');
}

refs.searchBtn.addEventListener('submit', onSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

function scrollPage() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

window.addEventListener('scroll', () => {
    scrollFunction();
  });
  
  function scrollFunction() {
    if (document.body.scrollTop > 30 || document.documentElement.scrollTop > 30) {
      refs.upBtnWrapper.style.display = 'flex';
    } else {
      refs.upBtnWrapper.style.display = 'none';
    }
  }
  refs.upBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  