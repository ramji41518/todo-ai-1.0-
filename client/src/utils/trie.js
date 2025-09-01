// src/utils/trie.js
// Tiny, case-insensitive Trie optimized for prefix search of collection names.

class TrieNode {
  constructor() {
    this.children = Object.create(null);
    this.items = []; // store references (or ids) to collections
  }
}

export default class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  static norm(str) {
    return (str || "").toLowerCase().trim();
  }

  insert(key, item) {
    const k = Trie.norm(key);
    if (!k) return;
    let node = this.root;
    for (let i = 0; i < k.length; i++) {
      const ch = k[i];
      node = node.children[ch] || (node.children[ch] = new TrieNode());
      // optional: don’t push duplicates
      if (!node.items.includes(item)) node.items.push(item);
    }
  }

  // Return up to `limit` results that start with prefix
  search(prefix, limit = 50) {
    const p = Trie.norm(prefix);
    if (!p) return [];
    let node = this.root;
    for (let i = 0; i < p.length; i++) {
      const ch = p[i];
      node = node.children[ch];
      if (!node) return [];
    }
    // node.items holds all items for this prefix (already aggregated on insert)
    return node.items.slice(0, limit);
  }
}
