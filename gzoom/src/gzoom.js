/*
* GZoomControl Class 
*  Copyright (c) 2005-2007, Andre Lewis, andre@earthcode.com
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* 
*       http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* This class lets you add a control to the map which will let the user
*  zoom by dragging a rectangle.
*  More info on original GZoom at http://earthcode.com
*/

/**
 * Constructor for GZoomControl, which takes 3 option hashes and
 *  uses them to customize the control.
 * @param {opts_boxStyle} Named optional arguments:
 *   opts_boxStyle.opacity {Number} Opacity from 0-1
 *   opts_boxStyle.fillColor {String} Hex value of fill color
 *   opts_boxStyle.border {String} CSS-style declaration of border
 * @param {opts_other} Named optional arguments:
 *   opts_other.buttonHTML {String} The zoom button HTML in non-activated state
 *   opts_other.buttonStartingStyle {Object} A hash of css styles for the 
 *     zoom button which are common to both un-activated and activated state
 *   opts_other.buttonStyle {Object} A hash of css styles for the zoom button 
 *     which will be applied when the button is in un-activated state.
 *   opts_other.buttonZoomingHTML {String} HTML which is placed in the 
 *     zoom button when the button is activated. 
 *   opts_other.buttonZoomingStyle {Object} A hash of css styles for the 
 *    zoom button which will be applied when the button is activated.
 *   opts_other.overlayRemoveTime {Number} The number of milliseconds to wait before
 *     removing the rectangle indicating the zoomed-in area after the zoom has happened.
 *   opts_other.stickyZoomEnabled {Boolean} Whether or not the control stays in 
 *     "zoom mode" until turned off. When true, the user can zoom repeatedly, 
 *     until clicking on the zoom button again to turn zoom mode off.
 *   opts_other.forceCheckResizeEnabled {Boolean} 
 * @param {opts_callbacks} Named optional arguments:
 *   opts_callbacks.buttonclick {Function} Called when the GZoom is activated 
 *     by clicking on the "zoom" button. 
 *   opts_callbacks.dragStart {Function} Called when user starts to drag a rectangle.
 *     Callback args are x,y -- the PIXEL values, relative to the upper-left-hand 
 *     corner of the map, where the user began dragging.
 *   opts_callbacks.dragging {Function} Called repeatedly while the user is dragging.
 *     Callback args are startX,startY, currentX,currentY -- the PIXEL values of the 
 *     start of the drag, and the current drag point, respectively.
 *   opts_callbacks.dragend {Function} Called when the user releases the mouse button 
 *     after dragging the rectangle. Callback args are: NW {GLatLng}, NE {GLatLng}, 
 *     SE {GLatLng}, SW {GLatLng}, NW {GPoint}, NE {GPoint}, SE {GPoint}, SW {GPoint}.
 *     The first 4 are the latitudes/longitudes; the last 4 are the pixel coords on the map.
 */ 
function GZoomControl(opts_boxStyle, opts_other, opts_callbacks) {
  //box style options
  GZoomControl.globals.style = {
    opacity: .2,
    fillColor: "#000",
    border: "2px solid blue"
  };
  var style = GZoomControl.globals.style;
  for (var s in opts_boxStyle) {
    style[s]=opts_boxStyle[s];
  }

  var borderStyleArray = style.border.split(' ');
  style.outlineWidth = parseInt(borderStyleArray[0].replace(/\D/g,''));
  style.outlineColor = borderStyleArray[2];
  style.alphaIE = 'alpha(opacity=' + (style.opacity * 100) + ')';

  // Other options
  GZoomControl.globals.options={
    forceCheckResizeEnabled: false,
    buttonHTML: 'zoom ...',
    buttonStartingStyle: 
      {width: '52px', border: '1px solid black', padding: '0px 5px 1px 5px'},
    buttonStyle: {background: '#FFF'},
    buttonZoomingHTML: 'Drag a region on the map',
    buttonZoomingStyle: {background: '#FF0'},
    overlayRemoveTime: 6000,
    stickyZoomEnabled: false
  };
	
  for (var s in opts_other) {
    GZoomControl.globals.options[s] = opts_other[s]
  }

  // callbacks: buttonclick, dragstart, dragging, dragend
  if (opts_callbacks == null) {
    opts_callbacks = {}
  }
  GZoomControl.globals.callbacks = opts_callbacks;
}

GZoomControl.prototype = new GControl();

// Holds all information needed globally
// Not all globals are initialized here
GZoomControl.globals = {
  draggingOn: false,
  cornerTopDiv: null,
  cornerRightDiv: null,
  cornerBottomDiv: null,
  cornerLeftDiv: null,
  mapPosition: null,
  outlineDiv: null,
  mapWidth: 0,
  mapHeight: 0,
  mapRatio: 0,
  startX: 0,
  startY: 0,
  borderCorrection: 0
};

/**
 * Creates a new button to control gzoom and appends to map div.
 * @param {DOM Node} map The div returned by map.getContainer()
 */
GZoomControl.prototype.initButton_ = function(mapDiv) {
  var G = GZoomControl.globals;
  var buttonDiv = document.createElement('div');
  buttonDiv.innerHTML = G.options.buttonHTML;
  buttonDiv.id = 'gzoom-control';
  GZUtil.style([buttonDiv], {cursor: 'pointer', zIndex:200});
  GZUtil.style([buttonDiv], G.options.buttonStartingStyle);
  GZUtil.style([buttonDiv], G.options.buttonStyle);
  mapDiv.appendChild(buttonDiv);
  return buttonDiv;
};

/**
 * Sets button mode to zooming or otherwise, changes CSS & HTML.
 * @param {String} mode Either "zooming" or not.
 */
GZoomControl.prototype.setButtonMode_ = function(mode){
  var G = GZoomControl.globals;
  if (mode == 'zooming') {
    G.buttonDiv.innerHTML = G.options.buttonZoomingHTML;
    GZUtil.style([G.buttonDiv], G.options.buttonZoomingStyle);
  } else {
    G.buttonDiv.innerHTML = G.options.buttonHTML;
    GZUtil.style([G.buttonDiv], G.options.buttonStyle);
  }
};

/**
 * Is called by GMap2's addOverlay method. Creates the zoom control
 * divs and appends to the map div.
 * @param {GMap2} map The map that has had this GZoomControl added to it.
 * @return {DOM Object} Div that holds the gzoomcontrol button
 */ 
GZoomControl.prototype.initialize = function(map) {
  var G = GZoomControl.globals;
  var mapDiv = map.getContainer();
  //DOM:button
  var buttonDiv = this.initButton_(map);

  //DOM:map covers
  var zoomDiv = document.createElement("div");
  zoomDiv.id ='gzoom-map-cover';
  zoomDiv.innerHTML ='<div id="gzoom-outline" style="position:absolute;display:none;"></div><div id="gzoom-cornerTopDiv" style="position:absolute;display:none;"></div><div id="gzoom-cornerLeftDiv" style="position:absolute;display:none;"></div><div id="gzoom-cornerRightDiv" style="position:absolute;display:none;"></div><div id="gzoom-cornerBottomDiv" style="position:absolute;display:none;"></div>';
  GZUtil.style([zoomDiv], {position: 'absolute', display: 'none', overflow: 'hidden', cursor: 'crosshair', zIndex: 101});
  mapDiv.appendChild(zoomDiv);

  // add event listeners
  GEvent.addDomListener(buttonDiv, 'click', GZoomControl.prototype.buttonclick_);
  GEvent.addDomListener(zoomDiv, 'mousedown', GZoomControl.prototype.coverMousedown_);
  GEvent.addDomListener(document, 'mousemove', GZoomControl.prototype.drag_);
  GEvent.addDomListener(document, 'mouseup', GZoomControl.prototype.mouseup_);

  // get globals
  G.mapPosition = GZUtil.getElementPosition(mapDiv);
  G.outlineDiv = GZUtil.gE("gzoom-outline");	
  G.buttonDiv = GZUtil.gE("gzoom-control");
  G.mc = GZUtil.gE("gzoom-map-cover");
  G.cornerTopDiv = GZUtil.gE("gzoom-cornerTopDiv");
  G.cornerRightDiv = GZUtil.gE("gzoom-cornerRightDiv");
  G.cornerBottomDiv = GZUtil.gE("gzoom-cornerBottomDiv");
  G.cornerLeftDiv = GZUtil.gE("gzoom-cornerLeftDiv");
  G.map = map;

  G.borderCorrection = G.style.outlineWidth * 2;	
  this.setDimensions_();

  //styles
  this.initStyles_();

  return buttonDiv;
};

/**
 * Required by GMaps API for controls. 
 * @return {GControlPosition} Default location for control
 */
GZoomControl.prototype.getDefaultPosition = function() {
  return new GControlPosition(G_ANCHOR_TOP_LEFT, new GSize(3, 120));
};

/**
 * Function called when mousedown event is captured.
 * @param {Object} e 
 */
GZoomControl.prototype.coverMousedown_ = function(e){
  var G = GZoomControl.globals;
  var pos = GZoomControl.prototype.getRelPos_(e);
  G.startX = pos.left;
  G.startY = pos.top;
  
  GZUtil.style([G.mc], {background: 'transparent', opacity: 1, filter: 'alpha(opacity=100)'});
  GZUtil.style([G.outlineDiv], {left: G.startX + 'px', top: G.startY + 'px', display: 'block', width: '1px', height: '1px'});
  G.draggingOn = true;

  G.cornerTopDiv.style.top = (G.startY - G.mapHeight) + 'px';
  G.cornerTopDiv.style.display ='block';
  G.cornerLeftDiv.style.left = (G.startX - G.mapWidth) +'px';
  G.cornerLeftDiv.style.top = G.startY + 'px';
  G.cornerLeftDiv.style.display = 'block';

  G.cornerRightDiv.style.left = G.startX + 'px';
  G.cornerRightDiv.style.top = G.startY + 'px';
  G.cornerRightDiv.style.display = 'block';
  G.cornerBottomDiv.style.left = G.startX + 'px';
  G.cornerBottomDiv.style.top = G.startY + 'px';
  G.cornerBottomDiv.style.width = '0px';
  G.cornerBottomDiv.style.display = 'block';

  // invoke the callback if provided
  if (G.callbacks.dragstart != null) {
    G.callbacks.dragstart(G.startX, G.startY);
  }

  return false;
};

/**
 * Function called when drag event is captured
 * @param {Object} e 
 */
GZoomControl.prototype.drag_ = function(e){
  var G=GZoomControl.globals;
  if(G.draggingOn) {
    var pos = GZoomControl.prototype.getRelPos_(e);
    rect = GZoomControl.prototype.getRectangle_(G.startX, G.startY, pos, G.mapRatio);

    if (rect.left) {
      addX = -rect.width;			
    } else { 
      addX = 0;
    }

    if (rect.top) {
      addY = -rect.height;
    } else {
      addY = 0;
    }

    GZUtil.style([G.outlineDiv], {left: G.startX + addX + 'px', top: G.startY + addY + 'px', display: 'block', width: '1px', height: '1px'});	
	
    G.outlineDiv.style.width = rect.width + "px";
    G.outlineDiv.style.height = rect.height + "px";

    G.cornerTopDiv.style.height = ((G.startY + addY) - (G.startY - G.mapHeight)) + 'px';
    G.cornerLeftDiv.style.top = (G.startY + addY) + 'px';
    G.cornerLeftDiv.style.width = ((G.startX + addX) - (G.startX - G.mapWidth)) + 'px';
    G.cornerRightDiv.style.top = G.cornerLeftDiv.style.top;
    G.cornerRightDiv.style.left = (G.startX + addX + rect.width + G.borderCorrection) + 'px';
    G.cornerBottomDiv.style.top = (G.startY + addY + rect.height + G.borderCorrection) + 'px';
    G.cornerBottomDiv.style.left = (G.startX - G.mapWidth + ((G.startX + addX) - (G.startX - G.mapWidth))) + 'px';
    G.cornerBottomDiv.style.width = (rect.width + G.borderCorrection) + 'px';
		
    // invoke callback if provided
    if (G.callbacks.dragging != null) {
      G.callbacks.dragging(G.startX, G.startY, rect.endX, rect.endY)
    }
		
    return false;
  }  
};

/** 
 * Function called when mouseup event is captured
 * @param {Event} e
 */
GZoomControl.prototype.mouseup_ = function(e){
  var G = GZoomControl.globals;
  if (G.draggingOn) {
    var pos = GZoomControl.prototype.getRelPos_(e);
    G.draggingOn = false;
    
    var rect = GZoomControl.prototype.getRectangle_(G.startX, G.startY, pos, G.mapRatio);

    if (rect.left) rect.endX = rect.startX - rect.width;
    if (rect.top) rect.endY = rect.startY - rect.height;
	
    GZoomControl.prototype.resetDragZoom_();

    var nwpx = new GPoint(rect.startX, rect.startY);
    var nepx = new GPoint(rect.endX, rect.startY);
    var sepx = new GPoint(rect.endX, rect.endY);
    var swpx = new GPoint(rect.startX, rect.endY);
    var nw = G.map.fromContainerPixelToLatLng(nwpx); 
    var ne = G.map.fromContainerPixelToLatLng(nepx); 
    var se = G.map.fromContainerPixelToLatLng(sepx); 
    var sw = G.map.fromContainerPixelToLatLng(swpx); 

    var zoomAreaPoly = new GPolyline([nw, ne, se, sw, nw], G.style.outlineColor, G.style.outlineWidth + 1,.4);

    try{
      G.map.addOverlay(zoomAreaPoly);
      setTimeout (function() {G.map.removeOverlay(zoomAreaPoly)}, G.options.overlayRemoveTime);  
    }catch(e) {}

    oBounds = new GLatLngBounds();
    oBounds.extend(nw);
    oBounds.extend(ne);
    oBounds.extend(se);
    oBounds.extend(sw);
    zoomLevel = G.map.getBoundsZoomLevel(oBounds);
    center = oBounds.getCenter();
    G.map.setCenter(center, zoomLevel);

    // invoke callback if provided
    if (G.callbacks.dragend != null) {
      G.callbacks.dragend(nw, ne, se, sw, nwpx, nepx, sepx, swpx);
    }
		
    //re-init if sticky
    if (G.options.stickyZoomEnabled) {
      GZoomControl.prototype.initCover_();
    }
  }
};

/**
 * Set the cover sizes according to the size of the map
 */
GZoomControl.prototype.setDimensions_ = function() {
  var G = GZoomControl.globals;
  if (G.options.forceCheckResizeEnabled) {
    G.map.checkResize();
  }
  var mapSize = G.map.getSize();
  G.mapWidth  = mapSize.width;
  G.mapHeight = mapSize.height;
  G.mapRatio  = G.mapHeight / G.mapWidth;
  GZUtil.style([G.mc, G.cornerTopDiv, G.cornerRightDiv, G.cornerBottomDiv, G.cornerLeftDiv], 
    {width: G.mapWidth + 'px', height: G.mapHeight +'px'});
};

/**
 * Initializes styles based on global parameters
 */
GZoomControl.prototype.initStyles_ = function(){
  var G = GZoomControl.globals;
  GZUtil.style([G.mc, G.cornerTopDiv, G.cornerRightDiv, G.cornerBottomDiv, G.cornerLeftDiv], 
    {filter: G.style.alphaIE, opacity: G.style.opacity, background:G.style.fillColor});
  G.outlineDiv.style.border = G.style.border;  
};

/**
 * Function called when the zoom button's click event is captured.
 */
GZoomControl.prototype.buttonclick_ = function(){
  if (GZoomControl.globals.mc.style.display == 'block') { // reset if clicked before dragging
    GZoomControl.prototype.resetDragZoom_();
  } else {
    GZoomControl.prototype.initCover_();
  }
};

/**
 * Shows the cover over the map
 */
GZoomControl.prototype.initCover_ = function(){
  var G = GZoomControl.globals;
  G.mapPosition = GZUtil.getElementPosition(G.map.getContainer());
  GZoomControl.prototype.setDimensions_();
  GZoomControl.prototype.setButtonMode_('zooming');
  GZUtil.style([G.mc], {display: 'block', background: G.style.fillColor});
  GZUtil.style([G.outlineDiv], {width: '0px', height: '0px'});

  //invoke callback if provided
  if(GZoomControl.globals.callbacks['buttonclick'] != null){
    GZoomControl.G.callbacks.buttonclick();
  }
};

/**
 * Gets position of the mouse relative to the map
 * @param {Object} e
 */
GZoomControl.prototype.getRelPos_ = function(e) {
  var pos = GZUtil.getMousePosition(e);
  var G = GZoomControl.globals;
  return {top: (pos.top - G.mapPosition.top), 
          left: (pos.left - G.mapPosition.left)};
};

/**
 * Figures out the rectangle the user's trying to draw
 * @param {Number} startX 
 * @param {Number} startY
 * @param {Object} pos
 * @param {Number} ratio
 * @return {Object} Describes the rectangle
 */
GZoomControl.prototype.getRectangle_ = function(startX, startY, pos, ratio){
  var left = false;
  var top = false;
  var dX = pos.left - startX;
  var dY = pos.top - startY;	
  if (dX < 0) {
    dX = dX * -1;
    left = true;
  }
  if (dY < 0) {
    dY = dY * -1;
    top = true;
  }
  delta = dX > dY ? dX : dY;

  return {
    startX: startX,
    startY: startY,
    endX: startX + delta,
    endY: startY + parseInt(delta * ratio),
    width: delta,
    height: parseInt(delta * ratio),
    left:left,
    top:top
  }
};

/** 
 * Resets CSS and button display when drag zoom done
 */
GZoomControl.prototype.resetDragZoom_ = function() {
  var G = GZoomControl.globals;
  GZUtil.style([G.mc, G.cornerTopDiv, G.cornerRightDiv, G.cornerBottomDiv, G.cornerLeftDiv], 
    {display: 'none', opacity: G.style.opacity, filter: G.style.alphaIE});
  G.outlineDiv.style.display = 'none';	
  GZoomControl.prototype.setButtonMode_('normal');
};


/* utility functions in GZUtil.namespace */
var GZUtil={};

/**
 * Alias function for getting element by id
 * @param {String} sId
 * @return {Object} DOM object with sId id
 */
GZUtil.gE = function(sId) {
  return document.getElementById(sId);
}

/**
 * A general-purpose function to get the absolute position
 * of the mouse.
 * @param {Object} e  Mouse event
 * @return {Object} Describes position
 */
GZUtil.getMousePosition = function(e) {
  var posx = 0;
  var posy = 0;
  if (!e) var e = window.event;
  if (e.pageX || e.pageY) {
    posx = e.pageX;
    posy = e.pageY;
  } else if (e.clientX || e.clientY){
    posx = e.clientX + 
      (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
    posy = e.clientY + 
      (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
  }	
  return {left: posx, top: posy};  
};

/**
 * Gets position of element
 * @param {Object} eElement
 * @return {Object} Describes position
 */
GZUtil.getElementPosition = function(eElement) {
  var nLeftPos = eElement.offsetLeft;          // initialize var to store calculations
  var nTopPos = eElement.offsetTop;            // initialize var to store calculations
  var eParElement = eElement.offsetParent;     // identify first offset parent element  
  while (eParElement != null ) {                // move up through element hierarchy
    nLeftPos += eParElement.offsetLeft;      // appending left offset of each parent
    nTopPos += eParElement.offsetTop;  
    eParElement = eParElement.offsetParent;  // until no more offset parents exist
  }
  return {left: nLeftPos, top: nTopPos};
};

/**
 * Applies styles to DOM objects 
 * @param {String/Object} a Either comma-delimited list of ids 
 *   or an array of DOM objects
 * @param {Object} o Hash of styles to be applied
 */
GZUtil.style = function(a, o){
  if (typeof(a) == 'string') {
    a=GZUtil.getManyElements(a);
  }
  for (var i = 0; i < a.length; i++){
    for (var s in o) { 
      a[i].style[s] = o[s];
    }
  }
};

/**
 * Gets DOM elements array according to list of IDs
 * @param {String} s Comma-delimited list of IDs
 * @return {Array} Array of DOM elements corresponding to s
 */
GZUtil.getManyElements = function(s){		
  t = s.split(',');
  a = [];
  for (var i = 0; i < t.length; i++){
    a[a.length] = GZUtil.gE(t[i])
  };
  return a;
};
	
