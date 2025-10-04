# Classic Cut The Rope: Clean HTML5 version

## About

This project attempts to revive the classic HTML5 version of Cut the Rope.  

- The source code was recovered from mozilla.cuttherope.net (dead link), which hosted clean/unminified game files per Firefox Marketplace policy.  
- This same codebase was the one used in the Microsoft Store release (with Xbox achievements) and on sites like cuttherope.ie / cuttherope.net.  
- Content includes levels up to the DJ Box update in 2012.  

Unfortunately, newer level packs were never added here. Famobi provides a complete but *minified* HTML5 port in 2024.  
With this source, however, we can modernize and expand the game's functionality.

## To-dos

- [x] **Codebase refactor**: Decouple monolithic scripts (done in [PR #1](https://github.com/yell0wsuit/cuttherope-cleanhtml5/pull/1))
- [ ] **Module conversion**: Convert from AMD to ES modules and use a bundler (Vite)
- [ ] **Level data separation**: Extract JSON configs into structured folders instead of embedding in the JS
- [ ] **HD support**: Upgrade rendering from 480p → 1080p
- [ ] **Level expansion**: Add levels up to the DJ Box
- [ ] **Asset additions**: Improve sprites, audio, and UI scaling
