* rename bridges to be more specific
* make it work with japanese characters! and try others as well
* models shouldn't show model name twice, show a good human friendly description. Groq is fast!

* electron: generate
* electron: wormhole
* electron: scraping -> proxy api key?

* Add tooltips to icons/buttons
* add cac.app feedback widget

**Common**

* Shared README
* Can we create a package.json in common and not have it mess up?
  * If so, create shared scripts, npm run desktop, npm run web
* click should depend on what mode you are in. add, generate or search
* Amplitude Analytics
* remember inputMode choice, default to it (unless Search)



**Electron**

* license
* Update README



**Web Version**

* rate limit (based on guid & ip)
* premium version
  - paddle SaaS integration
  - redo pricing page to show all options (open source, desktop, web, saas)
  - unlimited generations
  - customize prompt
  - more LLMs
  - private knowledge graphs
* different keyboard shortucts, should desktop change too?
* Update README



**Deploy**

* Update github repos
* Update Open-Source links on website
* Deploy website
* Copy over release from thinkmachine to thinkmachine-web before you rename back to thinkmachine
* Release update
* update ads



**Website**

 - Landing Page
   - Should app.thinkmachine.com become thinkmachine.com? and just move the marketing site to /about? /desktop
   - have a bunch of examples on home page, let people click and see what's interesting..maybe don't make the default generate?
    - full screen mode
    - embed think machine above the fold in thinkmachine.com?





**Near-future**

* URL scraping should be very accurate. we don't want to generate too much, just take from what's there. needs new prompt
  * PDFs extraction -> scraping web
* obsidian / json canvas
* notes, add text to a node. what about a hyperedge?
* Improve Onboarding
  * Onboarding video linked
* Simplify chrome UX...lots of buttons/icons and not clear what they do
* easy to to render an image from CSV...people just want to do cool visualization pictures

* QUESTION: should adding data should really add a filter..otherwise you can't see what you just added
* ask before quitting if unsaved changes



**Future**

* If you could update/reload/filter the Graph without reloading it all, that would be phenomenal
* What kinds of tests could we add? Integration tests kinda suck, but app is getting complex
 * inline browser? could be useful for quickly seeing references
 * Chat integration, chat with your knowledge graph

- Google Extension...right-click any word and get a knowledge graph?
- VR/AR would be super dope
- collaboration, make actions async 
- Add different graph layouts
- let users change colors
- Visually connect two links
- Label a hyperedge
- Delete individual nodes, not just a hyperedge
- Copy & paste nodes
- App Stores
  - Publish to Mac App Store
  - Publish to Windows App Store



**Super Future**


- what would HTML -> Think Machine look like? browsing the web with think machine? 2-way links like ted nelson intended?

- Background sync UI
- linux
- Pagerank UI
- Embeddings / Vector Search
- AI Autocomplete in text input
- multiple tabs/windows
- fix zoom and rotate axis bugs
- Distribution
  - ChatGPT plugin
  - Pinokio Store
  - iOS App
  - Obsidian Plugin

