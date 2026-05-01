/**
 * IPTVService.js
 * Handles parsing of M3U playlists and channel management.
 */

class IPTVService {
  parseM3U(content) {
    const lines = content.split('\n');
    const channels = [];
    let currentChannel = null;

    for (let line of lines) {
      line = line.trim();
      
      if (line.startsWith('#EXTINF:')) {
        // Parse metadata: #EXTINF:-1 tvg-id="" tvg-name="..." tvg-logo="..." group-title="...",Channel Name
        const info = line.split(',');
        const metaPart = info[0];
        const name = info[1] || 'Unknown Channel';
        
        const logoMatch = metaPart.match(/tvg-logo="([^"]+)"/);
        const groupMatch = metaPart.match(/group-title="([^"]+)"/);
        
        currentChannel = {
          name: name.trim(),
          logo: logoMatch ? logoMatch[1] : null,
          group: groupMatch ? groupMatch[1] : 'General',
          url: null
        };
      } else if (line.startsWith('http') && currentChannel) {
        currentChannel.url = line;
        channels.push(currentChannel);
        currentChannel = null;
      }
    }

    return channels;
  }

  async fetchPlaylist(url) {
    try {
      // Use our local proxy to fetch the playlist if it's a remote URL
      const response = await fetch(`http://localhost:3001/proxy?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error('Failed to fetch playlist');
      const content = await response.text();
      return this.parseM3U(content);
    } catch (error) {
      console.error('IPTV Fetch Error:', error);
      return [];
    }
  }
}

export default new IPTVService();
