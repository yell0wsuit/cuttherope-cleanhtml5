# Classic Cut The Rope: Clean HTML5 version

## About

This project attempts to revive the classic HTML5 version of Cut the Rope.  

- The source code was recovered from mozilla.cuttherope.net (dead link), which hosted clean/unminified game files per Firefox Marketplace policy.  
- This same codebase was the one used in the Microsoft Store release (with Xbox achievements) and on sites like cuttherope.ie / cuttherope.net.  
- Content includes levels up to the DJ Box update in 2012.  

Unfortunately, newer level packs were never added here. Famobi provides a complete but *minified* HTML5 port in 2024.  
With this source, however, we can modernize and expand the game's functionality.

## Features

- Faster loading
- More in-game music, randomized
- HD 1080p, adapt to current screen's resolution
- Fixed some audio/music bugs -- see [PR #9](https://github.com/yell0wsuit/cuttherope-cleanhtml5/pull/9) for more information

## Goals

### Short-term goals

- [x] **Codebase decoupling**: Decouple monolithic scripts (done in [PR #1](https://github.com/yell0wsuit/cuttherope-cleanhtml5/pull/1))
- [x] **Remove outdated dependencies**: Replace jQuery with vanilla JS, remove outdated libraries (done in [PR #2](https://github.com/yell0wsuit/cuttherope-cleanhtml5/pull/2))
- [x] **Module conversion**: Convert from AMD to ES modules and use Vite bundler (done in [PR #3](https://github.com/yell0wsuit/cuttherope-cleanhtml5/pull/3))
- [x] **Level data separation**: Extract JSON levels into folders instead of embedding in the JS  (done in [PR #4](https://github.com/yell0wsuit/cuttherope-cleanhtml5/pull/4))
- [x] **Asset tweaks and additions**: Add more sprites and audio assets, tweak sprite slices for consistency with other ports (done in [PR #5](https://github.com/yell0wsuit/cuttherope-cleanhtml5/pull/5))
  - [x] **HD support**: Upgrade rendering to 1024x576 as base, then later 1920x1080 for HD 
- [x] **Level expansion**: Add levels up to the DJ Box (done in [PR #7](https://github.com/yell0wsuit/cuttherope-cleanhtml5/pull/7))
- [x] **Deployment**: Host on GitHub Pages (PR #3)

### Long-term goals
- [ ] **Bugs fixing and polish**: Fix bugs, and ensure everything works smoothly.
- [ ] **Code optimization and modernization**: Optimize performance-critical code, and modernize codebase.
- [ ] **Optional goals**: Add new features like ~~level editor~~*, custom level manager, etc.

  \* Go to https://adriandrummis.github.io/CutTheRopeEditor/ instead, level editor seems to be too complex to be added in this game engine.
