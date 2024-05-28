import fetch from "node-fetch"

export default async function Media(query, searchEngineId, apiKey, numResults = 10) {
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${searchEngineId}&key=${apiKey}&searchType=image&num=${numResults}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        const results = data.items;

        if (results && results.length > 0) {
            return results.map(item => ({
                title: item.title,
                link: item.link,
                thumbnail: item.image.thumbnailLink
            }));
        } else {
            console.log(`No images found for query: ${query}`);
            return [];
        }
    } catch (error) {
        console.error('Error fetching images:', error.message);
        return [];
    }
}