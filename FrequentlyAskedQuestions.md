### What's the purpose of this project? ###

We've realized that there are many possibly useful extensions of the Google Maps API for adventurous developers, but that the common user needs a reliable and quick-loading API.
Adding custom controls/functionality to the core API adds to the file size and forces developers wanting to tweak the code to overwrite obfuscated JS functions.
With the open source project, a developer can include the javascript file for the particular library they're interested or even download it to their server and tweak it for their use.

Additionally, skilled developers can join the project and we can harness the combined skills of the developer community in creating and improving API extensions.


### I want to use a library here in my maps mashup. What do I link to in my script include? ###

If you want to use a stable release, you should link to the code in the release project here:
http://gmaps-utility-library.googlecode.com/svn/trunk/

Links to the release versions of each library are listed on the [Libraries](http://code.google.com/p/gmaps-utility-library-dev/wiki/Libraries) page.


### How do I contribute? ###

We welcome developers with previous experience programming with the Maps API to join the project, and we especially love for developers who have already written API extensions to open-source them in our project.

To join the project, follow these steps:
  1. Sign the [Google CLA](http://code.google.com/legal/individual-cla-v1.0.html) -  scroll down for the easy to sign digital version, no faxing necessary.
  1. Email Maps API support ([maps-api-support@google.com](mailto:maps-api-support@google.com)) with links to code you've developed, and a brief paragraph about why you'd like to contribute to the library.
  1. Wait for someone to respond that you have been the project (or to indicate that something is missing).
  1. If you haven't used SVN or a versioning system in the past, read up on SVN (check [SVNQuickTips](http://code.google.com/p/gmaps-utility-library-dev/wiki/SVNQuickTips) page here).
  1. Start contributing!


### Why must I sign a CLA to start contributing? ###

We want to guarantee we have the right to use the code you contribute, and that we can release it under the same license (Apache 2) as the existing code. This protects us, and others who then use the code, from claims of copyright or patent infringement. It's important to note that our CLA does **not** assign copyright, or take away any of your rights to the code you contribute.  You are free to sell or license it to others differently than the license we use for the project. The Google CLA simply says that you give us the right to use your code as well. If you do have particular concerns about the CLA or Apache License, please contact us for further clarification.


### Why are there 2 separate projects (gmaps-utility-library-dev, gmaps-utility-library)? ###

Since our project is currently all javascript code, we'd like to have an online link to the latest stable release of the code for each library that API users can reliably include in their Maps mashups.

Google project hosting offers an online version of each project repository's latest version that can be linked to, but we need a way of guaranteeing that the "release" folder in a project won't be accidentally overwritten with non stable code.
The googlecode implementation of SVN gives all members the same permissions to change every directory/file, which means we can't just restrict the permissions so that only Google employees can modify the release directory.

We decided the best solution was to have a separate project that will only hold release versions (and previous release versions) of each library.  New versions will be released only when the developer community has decided that it's bug-free, and a Google employee will commit the new versions to the release project.


### Where can project contributors discuss code revisions/project ideas? ###

Though many developers are active in the Google Maps API forum, we want to keep that as a forum primarily focused on using the core API. We've created another [Google Group](http://groups.google.com/group/google-maps-utility-library) to be solely for contributors to this open-source project, so that we can have an active, focused discussion there. If you're a contributor, **please** join this group so that everyone can keep abreast of what everyone else is working on. There will likely be some individual javascript files that multiple people want to work on. Though it is possible to merge changes in SVN, it may also be best in some cases to create different versions for each contributor. Such discussions should take place in the forum.

Also, developers that aren't formal members of this project are welcome to contribute to the discussion in the forum. We welcome your participation.