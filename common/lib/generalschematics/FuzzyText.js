const THRESHOLD = 0.99;
const NGRAM_SIZE = 4;

export default class FuzzyTextMatcher {

  constructor(threshold = THRESHOLD, ngramSize = NGRAM_SIZE) {
    this.threshold = threshold;
    this.ngramSize = ngramSize;
    this.cache = new Map();
    this.matchesCache = new Map();
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

  containsSymbol(paragraph, symbol) {
    const matches = this.findAllMatches(paragraph, symbol);
    return matches.length > 0
  }

  findAllMatches(paragraph, symbol, wholeToken = true) {
    if (this.matchesCache.has(paragraph + symbol)) {
      return this.matchesCache.get(paragraph + symbol);
    }

    const matches = [];
    let i = 0;

    if (!paragraph || !symbol) return matches;
    if (paragraph.length === 0) return matches;
    if (symbol.length === 0) return matches
    if (paragraph.length < symbol.length) return matches;

    // For single-character symbols, do exact matching only
    if (symbol.length === 1) {
      const regex = new RegExp(`\\b${symbol}\\b`, 'gi');
      let match;
      while ((match = regex.exec(paragraph)) !== null) {
        matches.push({ start: match.index, end: match.index + 1 });
      }
      this.matchesCache.set(paragraph + symbol, matches);
      return matches;
    }

    while (i < paragraph.length) {
      // Try to match the entire symbol first
      if (this.matches(paragraph.slice(i, i + symbol.length), symbol)) {
        matches.push({ start: i, end: i + symbol.length });
        i += symbol.length;
        continue;
      }

      // If no match, find the next word boundary
      const nextSpace = paragraph.indexOf(' ', i);
      const wordEnd = nextSpace === -1 ? paragraph.length : nextSpace;
      const word = paragraph.slice(i, wordEnd);

      // Check if the word matches the symbol
      if (this.matches(word, symbol)) {
        if (wholeToken) {
          matches.push({ start: i, end: wordEnd });
        } else {
          // Find the exact match within the word
          const matchStart = this.findMatchStart(word, symbol);
          matches.push({ start: i + matchStart, end: i + matchStart + symbol.length });
        }
        i = wordEnd;
      } else {
        // Move to the next character if no match
        i++;
      }
    }

    this.matchesCache.set(paragraph + symbol, matches);
    return matches;
  }

  findMatchStart(word, symbol) {
    for (let i = 0; i <= word.length - symbol.length; i++) {
      if (this.matches(word.slice(i, i + symbol.length), symbol)) {
        return i;
      }
    }
    return 0; // Fallback, should not happen if match was found
  }

  static matches(term1, term2, threshold = THRESHOLD, ngramSize = NGRAM_SIZE) {
    const matcher = new FuzzyTextMatcher(threshold, ngramSize);
    return matcher.matches(term1, term2);
  }


  static containsSymbol(paragraph, symbol, threshold = THRESHOLD, ngramSize = NGRAM_SIZE) {
    const matcher = new FuzzyTextMatcher(threshold, ngramSize);
    return matcher.containsSymbol(paragraph, symbol);
  }


  static findAllMatches(paragraph, symbol, threshold = THRESHOLD, ngramSize = NGRAM_SIZE) {
    const matcher = new FuzzyTextMatcher(threshold, ngramSize);
    return matcher.findAllMatches(paragraph, symbol);
  }
}
