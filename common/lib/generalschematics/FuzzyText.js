export default class FuzzyTextMatcher {
  constructor(threshold = 0.99, ngramSize = 4) {
    this.threshold = threshold;
    this.ngramSize = ngramSize;
    this.cache = new Map();
  }

  setSimilarityThreshold(threshold) {
    if (threshold < 0 || threshold > 1) {
      throw new Error("Similarity threshold must be between 0 and 1");
    }
    this.threshold = threshold;
  }

  normalizeTerm(term) {
    if (typeof term !== 'string') { throw new Error("Term must be a string") }
    return term.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  stemTerm(term) {
    // Very basic stemming (example: remove trailing 's' if more than 3 chars)
    return term.length > 3 && term.endsWith('s') ? term.slice(0, -1) : term;
  }

  getNgrams(text, n = this.ngramSize) {
    if (text.length < n) return [text];
    const ngrams = [];
    for (let i = 0; i <= text.length - n; i++) {
      ngrams.push(text.slice(i, i + n));
    }
    return ngrams;
  }

  ngramSimilarity(text1, text2) {
    const getNgramsFromCache = (text) => {
      if (!this.cache.has(text)) {
        this.cache.set(text, new Set(this.getNgrams(text)));
      }
      return this.cache.get(text);
    };

    const ngrams1 = getNgramsFromCache(text1);
    const ngrams2 = getNgramsFromCache(text2);

    const intersection = new Set([...ngrams1].filter(x => ngrams2.has(x)));
    const union = new Set([...ngrams1, ...ngrams2]);

    return intersection.size / union.size;
  }

  matches(term1, term2) {
    try {
      const norm1 = this.stemTerm(this.normalizeTerm(term1));
      const norm2 = this.stemTerm(this.normalizeTerm(term2));

      if (norm1 === norm2) return true;

      const similarity = this.ngramSimilarity(norm1, norm2);
      return similarity >= this.threshold;
    } catch (error) {
      console.error("Error comparing terms:", error.message);
      return false;
    }
  }

  reset() {
    this.cache.clear();
  }

  static matches(term1, term2, threshold = 0.99, ngramSize = 4) {
    const matcher = new FuzzyTextMatcher(threshold, ngramSize);
    return matcher.matches(term1, term2);
  }
}
