# IPTV-feather
An application acting as a platform for IPTV streams made with Javascript to run on Samsung SmartTV with cordova

## Prepare and build on browser
This application use the TOAST plugin made by Samsung to run a cordova app on a Samsung SmartTV. In order to test the app on a browser, you'll need to prepare the environment as described in the [Getting Started](https://github.com/Samsung/cordova-plugin-toast/wiki) section of the TOAST wiki.
Instead of creating an empty project, use your local repo of IPTV-feather as a template to create a cordova project:

`cordova create FeatherTest --template=<Your IPTV-Feather local repo>`
## TODO
- Add a delete function for the playlists previously added
- Add a multiple playlists option
- Clean the DOM when a view is unused
- Change MediaView display as ergonomic carousel for TV
- Add a function to change channel from player view
- Add a function to list channels from player view
- Add a function to change language/subtitles on player view
- Add a design
- Add EPG support
- Add regular updates of the registered playlists
- Add error message when a flux cannot be loaded or read
