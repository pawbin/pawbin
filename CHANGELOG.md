## Changelog

> 20.01.23 :: v0.21.0

* Fixed creature codename duplication bug
* Added Private/Public fields to users
* Added getUserPublic to get a user with only their public fields filled
* Changed api.getUser and all pageUser pages to use getUserPublic

---

> 20.01.21 :: v0.20.0

* Added 23 new creature types, from Suncoon (3) to Ool (25)
* Changed structure of creature objects to store a variety of image types
* Corrected profile and creatures pages to properly display images
* Implemented websockets to silhouettetest page
* Fixed a small potential issue with silhouette controller slot refilling

---

> 20.01.19 :: v0.19.0

* Added populate.js which can compile a mongoose populate tree (for querying) based on a few types of inputs, and also populate an existing document
* Added a `populatePath` body parameter to api.getUserCreatures(), for specifying what paths to populate on the returned creatures
* Added a `populatePath` parameter to userHelper.getCreatures()
* Removed userHelper.getCreaturesWithType() (.getCreatures() can replicate this behavior now with a populatePath)
* Added `populatePath` to userHelper.getUser()
* Added api.getUser() endpoints
* Removed preRender from request pipeline

---

> 20.01.18 :: v0.18.0

* Added catchSilhouette api endpoint, and corresponding game code.
* Added silhouetteTest page to test the endpoint
* Added error handling to catchSilhouette

---

> 20.01.17 :: v0.17.0

* Redesigned how game.js works. It no longer changes its own state after compiling, now scripts utilizing game must have it passed into them.
* Fixed scripts relying on game.js to be synchronous
* Rewrote most of gameHelper.js
* Cleaned up silhouetteController.js

---

> 20.01.16 :: v0.16.0

* Changed avatars to store on the disk rather than as a data uri on the database

---

> 20.01.09 :: v0.15.0

* Added the renderjson npm package for collapsible JSON trees
* Codedump box (used by admins) now has much prettier JSON
* Codedump box is collapsible and stores state between pages
* A user's creatures are now visible to the creature's page
* Added profile pages for other users
* Added `getUserCreature` api endpoint
* Moved all api endpoints to `/api/*`

---

> 20.01.08 :: v0.14.0

* Added significantly more page content to: profile, creatures, bestiary, inventory, messages, market, and exchanges

---

> 20.01.06 :: v0.13.0

* Started working on the nycthemericon
* Some edits to the profile page

---

> 19.12.19 :: v0.12.1

* Added nickname changing
* Improved appearance and adaptability of avatar uploading section
* Added filetype validation for avatar uploads

---

> 19.12.17 :: v0.12.0

* Added MemoryStore module
* Grouped backend files into directories/contexts
* Added game.js
* Added setup.js
* Added gameController.js
* Added biomeDefs.json and creatureTypeDefs.json for db definitions
* Added avatar uploading to settings page, with input and drag+drop functionality 

---

> 19.11.06 :: v0.11.0

* Moved `merge.js` and `fill.js` into `utility.js`
* Removed unnused `mailer.updateEmailNotification`

---

> 19.11.03 :: v0.10.0

* Added the following pages: admin
* Fixed input boxes not shrinking horizontally

---

> 19.11.02 :: v0.9.0

* Added the following pages: about, tos, support, news, creatures, worldmap, bestiary, inventory, messages, market, exchanges
* Further adjustments to general styling

---

> 19.11.01 :: v0.8.0

* Added a sitemap
* Added a style page for style testing and future reference
* Used said style page to adjust base styling for a bunch of elements
* Premium page can only be accessed if you're logged in... otherwise how would we credit the user?

---

> 19.10.30 :: v0.7.1

* Fixed links in mailer.js to direct to pawbin2.glitch.me instead of pawbin.glitch.me

---

> 19.10.30 :: v0.7.0

* Moved stuff on the profile page to the settings page
* Added an actual profile page, just listed some stuff we gotta change there
* Added the premium page, also listing page content ideas there
* Changed routes.js ever so slightly so that it also required the user to be logged in to access the settings page

---

> 19.08.19 :: v0.6.0

* Fixed overscroll on drawer causing a scroll on the main body
* Fixed drawer height snapping when mobile browser's navbar extends/retracts
* Fixed covered drawer area by adding a blank buffer div on the bottom
* Fixed overflow wrap word breaking for notification content
* Changed all instances of `creature` with `creatureType`, and all instances of `creatureInstance` with `creature`
* Added creature batches and reserve batches
* Changed `catchCreature` and its respective api endpoint to utilize the new creature batches
* Added automatic replacement of creature batches from the reserve batch
* Added automatic refilling of reserve batches when they are empty
* Added `POST renewbatch |admin|` endpoint for manually refilling batch reserves

---

> 19.08.14 :: v0.5.0

* Added globalSettings.list() to return full settings object without functions
* Fixed drawer scroll issues due to unnecessary class resets

---

> 19.07.21 :: v0.4.0

* Fixed drawer-cloak opacity
* Fixed drawer close region
* Added getSafeCodename for skipping banned words
* Changed creatureInstance pre-save hook to use getSafeCodename and calculate index based on highest index

---

> 19.07.20 :: v0.3.0

* Added globalSettings script for reading/writing game settings
* Added api endpoints for getting and setting globalSettings
* Changed documentInit to overwrite existing creatures
* Added user navigation and drawer sliding

---

> 19.07.19 :: v0.2.0

* Completed major page layout and styling
* Added game method API
* Added client REST api library
* Added catch and release endpoints

---

> 19.05.12 :: v0.1.0

* Added new changelog system
* Added session touching on request
* Added flash-based notifications
* Added clientside notification methods/ui

---

> 19.04.29 :: v0.0.0

* Recreated the pawbin project on Glitch again. Third time's a charm.
* Readded nunjucks, less
* Recreated the frontend in a much more organized fashion