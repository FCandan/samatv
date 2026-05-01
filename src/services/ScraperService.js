/**
 * ScraperService.js
 * Handles fetching and parsing of movie content from external websites.
 */

const PROXY_URL = 'http://localhost:3001/proxy?url=';

const PROVIDERS = {
  HDFILM: {
    name: 'HDFilmCehennemi',
    url: 'https://www.hdfilmcehennemi.nl/',
    selectors: {
      item: 'a.poster',
      title: 'strong.poster-title',
      image: 'img',
      link: 'href'
    }
  }
};

class ScraperService {
  async fetchHTML(url) {
    try {
      const response = await fetch(`${PROXY_URL}${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error('Network response was not ok');
      // Codetabs returns the raw string directly
      return await response.text();
    } catch (error) {
      console.error('Error fetching HTML:', error);
      return null;
    }
  }

  async getTrendingMovies() {
    const html = await this.fetchHTML(PROVIDERS.HDFILM.url);
    if (!html) return this.getMockMovies(); // Fallback to mock if fetch fails

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const items = doc.querySelectorAll(PROVIDERS.HDFILM.selectors.item);

    return Array.from(items).slice(0, 12).map((item, index) => {
      const title = item.querySelector(PROVIDERS.HDFILM.selectors.title)?.textContent.trim() || item.getAttribute('title');
      const poster = item.querySelector('img')?.getAttribute('data-src') || item.querySelector('img')?.getAttribute('src');
      const href = item.getAttribute('href');
      const sourceUrl = href?.startsWith('http') ? href : `https://www.hdfilmcehennemi.nl${href}`;
      
      return {
        id: href,
        title: title,
        year: '2024', // Default or parse from meta if needed
        poster: poster?.startsWith('http') ? poster : `https://www.hdfilmcehennemi.nl${poster}`,
        streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', // Fallback, will be updated on click
        category: 'Movie',
        sourceUrl: sourceUrl
      };
    });
  }

  async getStreamUrl(sourceUrl) {
    const html = await this.fetchHTML(sourceUrl);
    if (!html) return null;

    // Try to find the rplayer iframe URL (can be in src or data-src)
    const iframeMatch = html.match(/(?:src|data-src)="(https:\/\/www\.hdfilmcehennemi\.nl\/rplayer\/[^"]+)"/);
    if (iframeMatch) {
      const iframeUrl = iframeMatch[1];
      // Wrap the iframe URL in our proxy to handle the Referer check
      return `${PROXY_URL}${encodeURIComponent(iframeUrl)}&referer=${encodeURIComponent('https://www.hdfilmcehennemi.nl/')}`;
    }
    return null;
  }

  getMockMovies() {
    return [
      {
        id: 'inception',
        title: 'Inception',
        year: '2010',
        poster: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=2070',
        streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        category: 'Sci-Fi'
      },
      {
        id: 'interstellar',
        title: 'Interstellar',
        year: '2014',
        poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=2070',
        streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        category: 'Sci-Fi'
      },
      {
        id: 'dark-knight',
        title: 'The Dark Knight',
        year: '2008',
        poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=2070',
        streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        category: 'Action'
      }
    ];
  }

  async scrapeSite(url, selectors) {
    const html = await this.fetchHTML(url);
    if (!html) return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const items = doc.querySelectorAll(selectors.item);

    return Array.from(items).map(item => ({
      title: item.querySelector(selectors.title)?.textContent.trim(),
      poster: item.querySelector(selectors.image)?.getAttribute('src'),
      id: item.querySelector(selectors.link)?.getAttribute('href'),
      streamUrl: null // Usually requires a second hop or iframe scraping
    }));
  }
}

export default new ScraperService();
