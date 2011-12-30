/* An ItemsInfoBox is like an info window, but it displays
 * under the marker, opens quicker, and has flexible styling.
 * @param {GLatLng} latlng Point to place bar at
 * @param {Map} map The map on which to display this ItemsInfoBox.
 * @param {Object} opts Passes configuration options - content,
 *   offsetVertical, offsetHorizontal, className, height, width
 */
function ItemsInfoBox(opts)
{
   google.maps.OverlayView.call(this);
   this.marker_ = opts.marker
   this.map_ = opts.map;
   this.offsetVertical_ = -30;
   this.offsetHorizontal_ = -20;
   //this.height_ = 50;
   this.popup = null;
   //this.width_ = 159;

   var me = this;
   this.boundsChangedListener_ =
   google.maps.event.addListener(this.map_, "bounds_changed", function()
   {
      return me.panMap.apply(me);
   });
   // Once the properties of this OverlayView are initialized, set its map so
   // that we can display it.  This will trigger calls to panes_changed and
   // draw.
   this.setMap(this.map_);
}

/* ItemsInfoBox extends GOverlay class from the Google Maps API
 */
ItemsInfoBox.prototype = new google.maps.OverlayView();

/* Creates the DIV representing this ItemsInfoBox
 */
ItemsInfoBox.prototype.remove = function()
{
   //if (this.div_)
   {
   //this.div_.parentNode.removeChild(this.div_);
   //this.div_ = null;
   Ext.destroy(this.popup);
   delete this.popup;
   }
};
/* Redraw the Bar based on the current projection and zoom level
 */
ItemsInfoBox.prototype.draw = function()
{
   // Creates the element if it doesn't exist already.
   this.createElement();
   //if (!this.div_)
   //   return;

   // Calculate the DIV coordinates of two opposite corners of our bounds to
   // get the size and position of our Bar
   var pixPosition = this.getProjection().fromLatLngToContainerPixel(this.marker_.getPosition());
   if (!pixPosition)
      return;

   // Now position our DIV based on the DIV coordinates of our bounds
   //this.div_.style.width = this.width_ + "px";
   /*
    this.div_.style.left = (pixPosition.x + this.offsetHorizontal_) + "px";
    this.div_.style.height = this.height_ + "px";
    this.div_.style.top = (pixPosition.y + this.offsetVertical_) + "px";
    this.div_.style.display = 'block';
    */
   this.popup.items.items[0].setText(app.stores.items1.getById(0).data.desc);
   this.popup.show();
   var child = document.createElement('div');
   child.className = 'x-anchor x-anchor-bottom anchor';
   child.style.setProperty('margin-top','-1px');
   child.style.setProperty('margin-left','10px');
   this.popup.el.appendChild(child);
   this.popup.setPosition(pixPosition.x + this.offsetHorizontal_,pixPosition.y + this.offsetVertical_);
   this.width_=this.popup.getSize().width;
   this.height_=this.popup.getSize().height;

};
/* Creates the DIV representing this ItemsInfoBox in the floatPane.  If the panes
 * object, retrieved by calling getPanes, is null, remove the element from the
 * DOM.  If the div exists, but its parent is not the floatPane, move the div
 * to the new pane.
 * Called from within draw.  Alternatively, this can be called specifically on
 * a panes_changed event.
 */
ItemsInfoBox.prototype.createElement = function()
{
   function removeItemsInfoBox(ib)
   {
      return function()
      {
         Ext.destroy(ib.popup);
         delete ib.popup;
         ib.setMap(null);
      };
   }

   var panes = this.getPanes();
   var popup = this.popup;
   if (!popup)
   {
      popup = this.popup = new Ext.Panel(
      {
         floating:true,
         cls : 'nopadding',
         items:[
         {
            iconMask: true,
            ui :'light',
            xtype: 'button',
            iconAlign:'right',
            iconCls : 'disclosure-icon',
            handler : function(b,e)
            {
               Ext.Msg.alert('Tap', 'Disclose more info for "' + record.get('desc') + '"', Ext.emptyFn);
            }
         }]
         //,height:this.height_
      });
   }
   google.maps.event.addListener(this.marker_, 'mouseout', removeItemsInfoBox(this));

   /*
    var div = this.div_;
    if (!div)
    {
    // This does not handle changing panes.  You can set the map to be null and
    // then reset the map to move the div.
    div = this.div_ = document.createElement("div");
    div.className = "infobox";
    //div.style.width = this.width_ + "px";
    //div.style.height = this.height_ + "px";
    var leftDiv = document.createElement("div");
    leftDiv.className = "bubbleLeftDiv";
    var containerDiv = document.createElement("div");
    containerDiv.className = "infoboxContainer";
    var contentDiv = document.createElement("div");
    contentDiv.className = "infoboxContent";

    var title = "Much longer title than woody's"

    //var infoboxWidth = ( title.length*10 - (title.length) - 40) + "px"
    //containerDiv.style.width = infoboxWidth;
    //this.width_ = infoboxWidth + 47;
    contentDiv.innerHTML = "<h3>" + title + "</h3>";
    var rightDiv = document.createElement("div");
    rightDiv.className = "bubbleRightDiv";

    function removeItemsInfoBox(ib)
    {
    return function()
    {
    ib.setMap(null);
    };
    }

    google.maps.event.addListener(this.marker_, 'mouseout',
    removeItemsInfoBox(this));

    div.appendChild(leftDiv)
    div.appendChild(containerDiv);
    containerDiv.appendChild(contentDiv);
    div.appendChild(rightDiv);
    div.style.display = 'none';
    panes.floatPane.appendChild(div);
    this.panMap();
    }
    else
    if (div.parentNode != panes.floatPane)
    {
    // The panes have changed.  Move the div.
    div.parentNode.removeChild(div);
    panes.floatPane.appendChild(div);
    }
    else
    {
    // The panes have not changed, so no need to create or move the div.
    }
    */
}
/* Pan the map to fit the ItemsInfoBox.
 */
ItemsInfoBox.prototype.panMap = function()
{
   // if we go beyond map, pan map
   var map = this.map_;
   var bounds = map.getBounds();
   if (!bounds)
      return;

   // The position of the infowindow
   var position = this.marker_.getPosition();

   // The dimension of the infowindow
   var iwWidth = this.width_;
   var iwHeight = this.height_;

   // The offset position of the infowindow
   var iwOffsetX = this.offsetHorizontal_;
   var iwOffsetY = this.offsetVertical_;

   // Padding on the infowindow
   var padX = 40;
   var padY = 40;

   // The degrees per pixel
   var mapDiv = map.getDiv();
   var mapWidth = mapDiv.offsetWidth;
   var mapHeight = mapDiv.offsetHeight;
   var boundsSpan = bounds.toSpan();
   var longSpan = boundsSpan.lng();
   var latSpan = boundsSpan.lat();
   var degPixelX = longSpan / mapWidth;
   var degPixelY = latSpan / mapHeight;

   // The bounds of the map
   var mapWestLng = bounds.getSouthWest().lng();
   var mapEastLng = bounds.getNorthEast().lng();
   var mapNorthLat = bounds.getNorthEast().lat();
   var mapSouthLat = bounds.getSouthWest().lat();

   // The bounds of the infowindow
   var iwWestLng = position.lng() + (iwOffsetX - padX) * degPixelX;
   var iwEastLng = position.lng() + (iwOffsetX + iwWidth + padX) * degPixelX;
   var iwNorthLat = position.lat() - (iwOffsetY - padY) * degPixelY;
   var iwSouthLat = position.lat() - (iwOffsetY + iwHeight + padY) * degPixelY;

   // calculate center shift
   var shiftLng =
   (iwWestLng < mapWestLng ? mapWestLng - iwWestLng : 0) +
   (iwEastLng > mapEastLng ? mapEastLng - iwEastLng : 0);
   var shiftLat =
   (iwNorthLat > mapNorthLat ? mapNorthLat - iwNorthLat : 0) +
   (iwSouthLat < mapSouthLat ? mapSouthLat - iwSouthLat : 0);

   // The center of the map
   var center = map.getCenter();

   // The new map center
   var centerX = center.lng() - shiftLng;
   var centerY = center.lat() - shiftLat;

   // center the map to the new shifted center
   map.setCenter(new google.maps.LatLng(centerY, centerX));

   // Remove the listener after panning is complete.
   google.maps.event.removeListener(this.boundsChangedListener_);
   this.boundsChangedListener_ = null;
};