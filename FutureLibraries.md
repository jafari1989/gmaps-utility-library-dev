# Process #

Follow these steps for adding a new library:
  * Decide on the name for your library, as this will determine the folder and file names. If you're not sure, email the mailing list with some ideas.
  * Do an authenticated checkout of the whole project.
  * Create the following folders: /libraryname/, /libraryname/docs/, /libraryname/src/, /libraryname/examples/
  * Put the javascript in the /src/ folder. Make sure it follows our coding style (See JavascriptCodingConventions). Generate the packed version of the javascript (See UsingUtilities).
  * Put examples in the /examples/ folder. There should be one basic example, and any other examples to show other or advanced usage of the library. Copy the API key from other libraries.
  * Following the template of other libraries, create an examples.html file in the /docs/ folder. That file is the developer's guide for the library, and should step the user through both simple and advanced integration, referencing the examples along the way.
  * Generate reference.html (See UsingUtilities).
  * Do an SVN add on the whole /libraryname/ folder. Set all the mime-types properly with propset (See SVNQuickTips).
  * Do an SVN commit. Wait to hear feedback from the developers in the project.

If at any point you have questions, email them to the mailing list.


# Pre-Release #

These are libraries that are in the development project but aren't yet ready for release.

  * ArcGISLink: Library to connect ArcGIS Server/Services with Google Maps. Nianwei developed this.
    * Code: Done.
    * Docs: Done, but awaiting a round of edits from the Maps API tech writer.
    * Examples: Done.
  * CarouselMapTypeControl: Library to switch between map types in a carousel UI.
    * Code: Done
    * Docs: Done
    * Examples: Done
  * ExtStreetviewControl: Library that creates a mini-streetview in the corner of the map, similar to the overview map. Masashi is working on this.
    * Code: Need to make sure it's not doing DOM hacking or using undocumented API functions. Need to generate packed version.
    * Docs: None. Need to auto-generate reference and have how-to page with examples.
    * Examples: There are enough examples, but the files need to be renamed to something more descriptive.
  * GeometryControl: MyMaps-like control using the poly editing classes. Chris Marx is working on it, and it's nearly ready for release.
  * MultiIconMaker: Library to make it easier to do markers with hover states. We're debating whether it's worth it to offer this as a standalone library.
  * ProjectedOverlay: Like GGroundOverlay, but assumes a pre-projected image, so it doesn't try to re-project it using CSS. John Coryat authored this.
    * Code: Needs comments, needs to pass jslint.
    * Docs: None so far. Reference needs to be auto-generated, examples page needs to be made.
    * Examples: None checked in. Several available from John, however. Need to be checked in, script tag adjusted to enable ?packed checking.
  * SlideshowControl: Control for automatically playing through all markers on a map. Pamela authored this.
    * Code: Needs comments, needs to pass jslint.
    * Docs: None so far. Reference needs to be auto-generated, examples page needs to be made.
    * Examples: 1 so far. It'd help to have one more example showing different usage.
  * SnapShotControl: Library to make it easy to create printable version of a map. Masashi is working on it.
    * Code: Needs comments, needs to pass jslint.
    * Docs: None so far. Reference needs to be auto-generated, examples page needs to be made.
    * Examples: Done
  * KeyDragZoom: Library to drag-zoom using keys. Nianwei added.
    * Code: Done.
    * Docs: Both docs just need grammar + style edits.
    * Examples: [Issue 93](https://code.google.com/p/gmaps-utility-library-dev/issues/detail?id=93) raised for multimap example. Rest are good.


# Pre-Dev #

These are libraries that are somewhere on the web/in the ether, but haven't been checked in yet to the development project. In some cases, we may need to contact the author about joining the project.

  * OverviewMapControl: Gabriel is working on open-sourcing our internal code for this.
  * ZMarker: Esa has been working on this, we should get it in here.
  * ExtPolyGraph: An abstraction for GPolyline- and GMarker-based [graphs](http://en.wikipedia.org/wiki/Graph_%28mathematics%29).  I did an undirected implementation for creating and editing [sidewalk](http://xkcd.com/85/) data.
  * OpacityControl: See [demo](http://code.google.com/apis/maps/documentation/demogallery.html).

# Ideas #

Any ideas of completely non-existent libraries can go here...