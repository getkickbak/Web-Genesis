/*
 Copyright(c) 2011 Company Name
 */
Ext.define("Sencha.Util",
{
   singleton : true,
   avatarRoot : "http://src.sencha.io/jpg100/72/",
   config :
   {
      imgPath : "js/Sencha/resources/img/",
      domain : window.location.origin
   },
   calcUtcTime : function(b)
   {
      var a = this;
      return function(f, c)
      {
         var d = c.get("session_day"), e = d + c.get(b) + a.tzOffset * 60;
         return Ext.Date.parseDate(e, "U")
      }
   },
   getNormalizedDate : function(a)
   {
      return Ext.Date.parse(a + this.tzOffset, "U")
   },
   getFormattedDate : function(a, b)
   {
   },
   getTwitter : function(a)
   {
      if(a.length)
      {
         return "@" + a
      }
      return ""
   },
   getAvatar : function(a)
   {
      if(a.length)
      {
         return this.avatarRoot + a
      }
      return "img/speaker_silhouette.png"
   },
   formatSessionStart : function(e, b)
   {
      var c = parseInt(e.session_start, 10), d = parseInt(e.session_day, 10), a = this.getNormalizedDate(c + d);
      return Ext.Date.format(a, b)
   },
   formatSessionEnd : function(e, b)
   {
      var c = parseInt(e.session_end, 10), d = parseInt(e.session_day, 10), a = this.getNormalizedDate(c + d);
      return Ext.Date.format(a, b)
   }
}, function()
{
   var a = this;
   if(!Ext.isDefined(a.tzOffset))
   {
      a.tzOffset = new Date().getTimezoneOffset() * 60
   }
});
Ext.define("Sencha.DataManager",
{
   extend : "Ext.util.Observable",
   singleton : true,
   dataLocations : [
   {
      name : "sessions",
      channel : "conference_sessions",
      orderby : "session_day",
      sort : "asc",
      limit : 100,
      fields : "|session_type|session_description|session_speakers|session_track|session_day|session_start|session_end|session_room"
   },
   {
      name : "speakers",
      channel : "conference_speakers ",
      orderby : "title",
      sort : "asc",
      limit : 100,
      fields : "|speaker_company|speaker_twitter|speaker_avatar|speaker_bio"
   },
   {
      name : "sponsors",
      channel : "conference_sponsors",
      orderby : "title",
      sort : "asc",
      limit : 100,
      fields : "|title|url_title|entry_id|entry_date|sponsor_logo_url|sponsor_level|sponsor_url|sponsor_description|sponsor_priority"
   }],
   fetchData : function()
   {
      var c = this, a = c.dataLocations, b, d;
      if(a.length > 0 && !c.halted)
      {
         d = a.shift();
         b = Ext.isDefined(localStorage[d.name]);
         if(b)
         {
            this.passiveLoad = true
         }
         if(navigator.onLine)
         {
            c.showMask(d.name + " ...");
            this.doLoad(d)
         }
         else
         {
            if(!navigator.onLine && !b)
            {
               this.fireEvent("postal")
            }
            else
            {
               this.fireEvent("loadcomplete")
            }
         }
      }
   },
   doLoad : function(b)
   {
      var a = this;
      Ext.util.JSONP.request(
      {
         url : "http://www.sencha.com/json",
         callbackKey : "callback",
         params : b,
         callback : function(c)
         {
            a.updateLocalStorage(b.name, c);
            a.fetchData();
            if(b.name == "sessions")
            {
               a.fireEvent("loadcomplete");
               if(a.mask)
               {
                  a.mask.destroy();
                  a.mask.destroyed = true
               }
            }
         }
      })
   },
   updateLocalStorage : function(c, a)
   {
      var f = Ext.isDefined(localStorage[c]), b = "sessions";
      if(!f || c != b)
      {
         this.setData(c, a)
      }
      else
      {
         if(c == b)
         {
            var d = this.getSessionFavorites(), e;
            Ext.each(a, function(g)
            {
               e = g.entry_id;
               Ext.each(d, function(i, h)
               {
                  if(i.entry_id == e)
                  {
                     g.favorite = true;
                     d.splice(h, 1);
                     return false
                  }
               })
            });
            this.setData(c, a)
         }
      }
   },
   setData : function(b, a)
   {
      var c = Ext.encode(a);
      localStorage.setItem(b, c)
   },
   getData : function(a)
   {
      return Ext.decode(localStorage.getItem(a))
   },
   showMask : function()
   {
      var b = this, a = b.mask;
      if(!a)
      {
         a = b.mask = Ext.create("Ext.LoadMask", Ext.getBody(),
         {
            msg : ""
         });
         a.show()
      }
   },
   getNumberOfSessionsForSpeaker : function(e)
   {
      var b = this, a = 0, d = this.getData("sessions"), c;
      Ext.each(d, function(f)
      {
         c = b.splitSessionSpeakers(f.session_speakers);
         Ext.each(c, function(g)
         {
            if(g == e)
            {
               a++
            }
         })
      });
      return a
   },
   getSessionsForSpeaker : function(d)
   {
      var a = this, c = [], b;
      Ext.each(a.getData("sessions"), function(e)
      {
         b = a.splitSessionSpeakers(e.session_speakers);
         Ext.each(b, function(f)
         {
            if(f == d)
            {
               c.push(Ext.clone(e))
            }
         })
      });
      return c
   },
   getSpeakersFromSession : function(d)
   {
      var b = this, a = [], c;
      c = this.splitSessionSpeakers(d.session_speakers);
      Ext.each(c, function(e)
      {
         Ext.each(b.getData("speakers"), function(f)
         {
            if(f.title == e)
            {
               a.push(Ext.clone(f))
            }
         })
      });
      return a
   },
   getSpeakers : function()
   {
      return this.getData("speakers")
   },
   splitSessionSpeakers : function(a)
   {
      return a.replace(/ *\[[0-9]+\] */g, "").split(String.fromCharCode(13))
   },
   getSessionsForDay : function(a)
   {
      var c = this.getData("sessions"), b = [];
      Ext.each(c, function(d)
      {
         if(d.session_day == a)
         {
            b.push(d)
         }
      });
      return b
   },
   getSessionFavorites : function()
   {
      var b = this.getData("sessions"), a = [];
      Ext.each(b, function(c)
      {
         if(c.favorite)
         {
            a.push(c)
         }
      });
      return a
   },
   getUniqueSessionDays : function(c)
   {
      var f = c || this.getData("sessions"), a =
      {
      }, d = [], e = true, b;
      Ext.each(f, function(g)
      {
         a[g.session_day] = e
      });
      for(b in a)
      {
         b = parseInt(b, 10);
         d.push(b)
      }
      return d.sort()
   },
   getRawSessionById : function(b)
   {
      var c = this.getData("sessions"), a;
      Ext.each(c, function(d)
      {
         if(d.entry_id == b)
         {
            a = d;
            return false
         }
      });
      return a
   },
   setFavoritesSession : function(a, e)
   {
      var g = this.getData("sessions"), c = [], f, d, b;
      d = a.get("id");
      f = parseInt(a.raw.session_start, 10) + parseInt(a.raw.session_day, 10);
      if(!e)
      {
         Ext.each(g, function(h)
         {
            b = parseInt(h.session_start, 10) + parseInt(h.session_day, 10);
            if(f == b && d != h.entry_id)
            {
               h.favorite = false;
               c.push(h)
            }
            else
            {
               if(d == h.entry_id)
               {
                  h.favorite = true;
                  c.push(h)
               }
            }
         })
      }
      else
      {
         Ext.each(g, function(h)
         {
            if(d == h.entry_id)
            {
               h.favorite = false;
               c.push(h);
               return false
            }
         })
      }
      this.setData("sessions", g);
      return c
   }
});
Ext.define("Sencha.view.Viewport",
{
   extend : "Ext.Container",
   xtype : "senchaconviewport",
   config :
   {
      fullscreen : true,
      layout :
      {
         type : "card",
         animation :
         {
            type : "slide",
            direction : "left"
         }
      }
   },
   titleBar : undefined,
   initialize : function()
   {
      var a = this;
      a.add(a.buildDockedItems());
      a.callParent()
   },
   buildDockedItems : function()
   {
      return
      {
         xtype : "navigationbar",
         itemId : "viewportToolbar",
         docked : "top",
         cls : "maintoolbar",
         title : "Schedule",
         defaults :
         {
            iconMask : true,
            hidden : true
         },
         items : [
         {
            ui : "back",
            text : "Back",
            itemId : "viewportBackButton"
         },
         {
            iconCls : "share_icon",
            ui : "plain",
            cls : "sc-nav-button",
            itemId : "viewportNavButton",
            align : "right",
            hidden : false
         }]
      }
   },
   resetToView : function(c)
   {
      var b = this, a = this.items.indexOf(c);
      b.items.each(function(f, d)
      {
         if(f.isInnerItem() && d != a)
         {
            try
            {
               b.remove(f)
            }
            catch(g)
            {
            }
         }
      })
   }
});
Ext.define("Sencha.view.About",
{
   extend : "Ext.Container",
   xtype : "about",
   config :
   {
      scrollable : true,
      cls : "about",
      items :
      {
         xtype : "component",
         html : ['<div class="info sencha">', "The SenchaCon 2011 conference app was built using Sencha Touch 2.0, Sencha.io.", "The custom theme and icons were created by David Kaneda of Sencha, and the back end is powered by Expression Engine.", "<br/><br>", " The app UX and development were done in collaboration with Modus Create, Inc.", "<br/><br>", "A tutorial will be available soon.", "</div>", '<div class="info modus">', "Modus Create, Inc. is a Sencha  Partner", "<br/><br/>", " Jay Garcia, Modus Create CTO, will be discussing the making of this app on Wednesday 10/23 at 4pm.", "<br/>", '<a href="http://www.moduscreate.com" style="-webkit-touch-callout: inherit; -webkit-user-select: all">http://moduscreate.com</a>', "</div><br />", '<img class="modus-mark" src="img/modus-grey.png" align="center"/><br /><br />'].join("")
      }
   }
});
Ext.define("Sencha.view.Apps",
{
   extend : "Ext.Container",
   xtype : "apps",
   config :
   {
      scrollable : true,
      cls : "about",
      items :
      {
         xtype : "component",
         html : ['<div class="info sencha">', "Apps go here", "</div>"].join("")
      }
   }
});
Ext.define("Sencha.view.Hackathon",
{
   extend : "Ext.Container",
   config :
   {
      scrollable : true,
      cls : "hackathon",
      items :
      {
         xtype : "component",
         html : ['<div class="info">', "Last year&#8217;s Hackathon at SenchaCon 2010 was such a huge success we&#8217;re doing it again. It&#8217;s a unique opportunity to interact and share with some of the world&#8217;s best developers. You&#8217;ll work with the Sencha experts exchanging projects and approaches. Plus you&#8217;ll experience a broad range of live demos.", "<h3>Schedule</h3>", "<table>", "<tr>", '<th scope="row">9:00am-9:15am</th>', "<td>Welcome and Introduction</td>", "</tr><tr>", '<th scope="row">9:15am-9:45am</th>', "<td>Sponsor Lightning Talks</td>", "</tr><tr> ", '<th scope="row">9:45am-10:00am</th>', "<td>Team Building</td>", "</tr><tr>  ", '<th scope="row">10:00am-4:00pm</th>', "<td>Coding</td>", "</tr><tr>  ", '<th scope="row">12:30pm-1:30pm</th>', "<td>Lunch</td>", "</tr><tr>  ", '<th scope="row">4:15pm-4:45pm</th>', "<td>Group Presentations</td>", "</tr><tr>  ", '<th scope="row">4:45pm-5:15pm</th>', "<td>Judging</td>", "</tr><tr>  ", '<th scope="row">5:15pm-5:30pm</th>', "<td>Announcements and Awards</td>", "</tr><tr>  ", '<th scope="row">5:30pm-7:00pm</th>', "<td>Closing Drinks</td></tr><tr>", "</table>", "</div>", '<img src="img/hackathon_circles.png" width="288" height="80" class="center_img" />'].join("")
      }
   }
});
Ext.define("Sencha.view.ConferenceLocation",
{
   extend : "Ext.Panel",
   config :
   {
      layout : "fit"
   },
   initialize : function()
   {
      this.setItems(this.buildMap());
      this.callParent()
   },
   buildMap : function()
   {
      var a = new google.maps.LatLng(30.2653478, -97.738613), b = new google.maps.InfoWindow(
      {
         content : '<h3>SenchaCon 2011</h3><strong>Austin Hilton</strong><br/>500 East 4th Street, <br />Austin, Texas 78701<br /><a href="tel:+15124828000" rel="external">Tel: 1-512-482-8000</a>'
      }), c = new google.maps.MarkerImage("img/point.png", new google.maps.Size(32, 31), new google.maps.Point(0, 0), new google.maps.Point(16, 31)), d = new google.maps.MarkerImage("img/shadow.png", new google.maps.Size(64, 52), new google.maps.Point(0, 0), new google.maps.Point(-5, 42));
      return Ext.create("Ext.Map",
      {
         mapOptions :
         {
            center : a,
            zoom : 12,
            mapTypeId : google.maps.MapTypeId.ROADMAP,
            navigationControl : true,
            navigationControlOptions :
            {
               style : google.maps.NavigationControlStyle.DEFAULT
            }
         },
         plugins : [new Ext.plugin.GMap.Tracker(
         {
            trackSuspended : true,
            highAccuracy : false,
            marker : new google.maps.Marker(
            {
               position : a,
               title : "My Current Location",
               shadow : d,
               icon : c
            })
         }), new Ext.plugin.GMap.Traffic(
         {
            hidden : true
         })],
         listeners :
         {
            maprender : function(f, g)
            {
               var e = new google.maps.Marker(
               {
                  position : a,
                  title : "SenchaCon 2011",
                  map : g
               });
               google.maps.event.addListener(e, "click", function()
               {
                  b.open(g, e)
               });
               setTimeout(function()
               {
                  g.panTo(a);
                  b.open(e)
               }, 1000)
            }
         }
      })
   }
});
Ext.define("Sencha.view.SchedulePanel",
{
   extend : "Ext.Panel",
   xtype : "schedulepanel",
   config :
   {
      layout : "fit",
      bottomNavBar : true
   },
   initialize : function()
   {
      var a = this;
      a.add(a.getBottomNavBar());
      a.callParent();
      a.buildDaysNavigation()
   },
   applyBottomNavBar : function(a)
   {
      if(a === true)
      {
         a =
         {
            docked : "top"
         }
      }
      return Ext.factory(a, Ext.Toolbar, this.getBottomNavBar())
   },
   buildDaysNavigation : function()
   {
      var f = this, e = Ext.Date, h = f.down("toolbar"), d = [], b =
      {
         scope : f,
         tap : f.onNavBtnTap
      }, g, c;
      if(!h)
      {
         return
      }
      Ext.each(this.uniqueDays, function(j, i)
      {
         c = Sencha.Util.getNormalizedDate(j);
         d.push(
         {
            ui : "small",
            text : e.format(c, "D n/j"),
            pressed : i == 0,
            btnType : "date",
            date : j,
            listeners : b
         })
      });
      d.push(
      {
         ui : "small",
         iconCls : "star",
         iconMask : true,
         btnType : "fav",
         date : null,
         listeners : b
      });
      g = Ext.create("Ext.SegmentedButton",
      {
         align : "center",
         items : d
      });
      var a =
      {
         xtype : "spacer"
      };
      h.add([a, g, a])
   },
   onNavBtnTap : function(a)
   {
      var b = this;
      b.fireEvent("navbtn", b, a)
   }
});
Ext.define("Sencha.model.Session",
{
   extend : "Ext.data.Model",
   requires : ["Sencha.Util"],
   reader :
   {
      type : "json"
   },
   fields : ["favorite", "title", "url_title", "session_track", "speakers", "session_speakers", "session_description",
   {
      name : "orig_session_start",
      mapping : "session_start"
   },
   {
      name : "id",
      mapping : "entry_id"
   },
   {
      name : "session_room",
      convert : function(a)
      {
         return a.replace(/\[[0-9].*\]/, "", "g")
      }
   },
   {
      name : "raw_session_start",
      mapping : "session_start",
      type : "int"
   },
   {
      name : "raw_session_end",
      mapping : "session_end",
      type : "int"
   },
   {
      name : "raw_session_day",
      mapping : "session_day",
      type : "int"
   },
   {
      name : "session_day",
      type : "date",
      dateFormat : "U"
   },
   {
      name : "session_start",
      type : "date",
      convert : function(c, b)
      {
         var a = b.data;
         return Sencha.Util.getNormalizedDate(a.raw_session_day + a.raw_session_start)
      }
   },
   {
      name : "session_end",
      type : "date",
      convert : function(c, b)
      {
         var a = b.data;
         return Sencha.Util.getNormalizedDate(a.raw_session_day + a.raw_session_end)
      }
   }]
});
Ext.define("Sencha.view.SessionDetail",
{
   extend : "Ext.Container",
   xtype : "sessiondetail",
   session :
   {
   },
   config :
   {
      layout :
      {
         type : "vbox",
         align : "stretch"
      }
   },
   sessionDetailTpl : Ext.create("Ext.XTemplate", "<div>", '<div style="padding: 10px">', '<div class="flex-horiz">', '<div class="flex1"><h3>{title}</h3></div>', '<div style="margin: -15px -25px -15px 0;" class="sc-favicon ', '<tpl if="values.favorite">scheduled</tpl>', '<tpl if="! values.favorite">unscheduled</tpl>', '">&nbsp;</div>', "</div>", "<h6>", '{[Ext.Date.format(values.session_start, "n/j g:i A")]}&ndash;', '{[Ext.Date.format(values.session_end, "g:i A")]}', "</h6>", "<h6>{session_room}</h6>", "<p>{session_description}</p>", "</div>", '<tpl if="values.speakers.length">', "<h5>Presenters</h5>", '<tpl for="values.speakers">', '<div class="x-layout-hbox session_speaker index_{[ xindex - 1 ]}" style="-webkit-box-align: stretch; padding: 10px; overflow: hidden;">', '<div <tpl if="speaker_avatar">style="background-image: url(http://src.sencha.io/jpg100/72/{speaker_avatar}); width: 72px;"</tpl> class="sc-avatar carousel"></div>', '<div class="sc-speaker-carousel-text-ct" style="-webkit-box-flex: 1;">', "<strong>{title}</strong>", "<div>{speaker_company}</div>", '<tpl if="values.speaker_twitter">', '<div class="sc-speaker-carousel-text-ct-other-text">@{speaker_twitter}</div>', "</tpl>", "</div>", '<div class="clear"></div>', "</div>", "</tpl>", "</tpl>", "</div>"),
   trackTimeTpl : Ext.create("Ext.XTemplate", "<div>", "<h5>Track</h5>", '<div class="sc-minitrack">{session_track}</div>', "</div>", "<div>", '<h5>{[Ext.Date.format(values.session_start, "m/d")]}</h5>', '<div class="sc-minitime">{[Ext.Date.format(values.session_start, "g:iA")]}</div>', "</div>"),
   initialize : function()
   {
      var a = this;
      this.setItems([a.buildDetailComponent()]);
      this.add(a.buildLocationCt());
      a.callParent()
   },
   buildDetailComponent : function()
   {
      var a = this, b = a.record.getData();
      return
      {
         xtype : "container",
         flex : 1,
         scrollable : true,
         items :
         {
            xtype : "component",
            data : b,
            tpl : a.sessionDetailTpl,
            listeners :
            {
               scope : a,
               painted : "onSessionDetailElPainted"
            }
         }
      }
   },
   onSessionDetailElPainted : function(b)
   {
      var a = this;
      b.element.on(
      {
         scope : a,
         delegate : "div.session_speaker",
         touchend : a.onSpeakerElTouchEnd,
         touchstart : a.onSpeakerElTouchStart,
         tap : a.onSpeakerElTap
      });
      b.element.on(
      {
         scope : a,
         delegate : "div.sc-favicon",
         tap : a.onFaviconTap
      })
   },
   onFaviconTap : function(a)
   {
      var b = Ext.get(a.getTarget());
      this.fireEvent("favicontap", this.record, b)
   },
   onSpeakerElTouchStart : function(a)
   {
      var b = a.getTarget();
      Ext.get(b).addCls("sc-speaker-selected")
   },
   onSpeakerElTouchEnd : function(a)
   {
      var b = a.getTarget();
      Ext.get(b).removeCls("sc-speaker-selected")
   },
   onSpeakerElTap : function(a)
   {
      var d = this, e = a.getTarget(), f = e.className.split(" "), c = f[2].split("_")[1], b = d.record.get("speakers")[c];
      d.fireEvent("speakerselect", d, b)
   },
   buildLocationCt : function()
   {
      var b = this, a = b.record;
      return
      {
         xtype : "component",
         cls : "sc-miniboxes",
         tpl : b.trackTimeTpl,
         data : a.getData()
      }
   }
});
Ext.define("Sencha.view.SessionsList",
{
   xtype : "sessionslist",
   extend : "Ext.dataview.List",
   uses : ["Ext.Toolbar", "Ext.SegmentedButton"],
   config :
   {
      locked : true,
      grouped : true,
      itemTpl : true,
      itemTplGeneric : Ext.create("Ext.XTemplate", '<div class="flex-horiz">', '<div class="flex1">{title}</div>', '<div class="sc-favicon ', '<tpl if="values.favorite">scheduled</tpl>', '<tpl if="! values.favorite">unscheduled</tpl>', '">&nbsp;</div>', "</div>"),
      itemTplFavs : Ext.create("Ext.XTemplate", '<div class="flex-horiz">', '<div class="flex1"><strong>{[ Ext.Date.format(values.session_start, "g:iA")]}</strong> {title}</div>', "</div>")
   },
   applyItemTpl : function()
   {
      return this.isFavorites ? this.getItemTplFavs() : this.getItemTplGeneric()
   },
   scrollIntoCurrent : function()
   {
      var l = this, h = l.getClosestGroup(), f = 0, n, m;
      if(!h)
      {
         return
      }
      var b = l.renderElement.query(".x-list-header"), k = b.length, j = Ext.Date.parse(h.name, "YmdHi"), c = Ext.Date.format(j, "g:ia"), g = l.getScrollable().getScroller();
      for(; f < k; f++)
      {
         n = b[f];
         if(n.innerHTML == c)
         {
            break
         }
      }
      m = Ext.get(n).getY();
      g.stopAnimation();
      var a = g.getContainerSize().y, o = g.getSize().y, d = o - a, e = ((m > d) ? d : m) - this.getEl().getY();
      g.scrollTo(0, e)
   },
   getClosestGroup : function(d)
   {
      var h = this, j = h.getStore(), c = j.getGroups(), a = Ext.Date.parse("13:22/10/24", "H:i/m/d"), b = Ext.Date.format(a, "YmdHi"), g = c.length, e = 0, k, f;
      for(; e < g; e++)
      {
         k = c[e];
         if(k.name >= b)
         {
            break
         }
         f = k
      }
      return f
   },
   onItemTouchStart : function(a)
   {
      var d = this, b = Ext.get(a.target), e = a.getTarget(), c = Ext.get(e);
      if(b && b.hasCls("sc-favicon"))
      {
         a.stopEvent()
      }
      else
      {
         d.callParent(arguments)
      }
   },
   onItemTap : function(a)
   {
      var e = this, c = Ext.get(a.target), f = a.getTarget(), b = f.getAttribute("itemIndex"), d = Ext.get(f);
      if(c && c.hasCls("sc-favicon"))
      {
         a.stopEvent();
         console.log("favicontap", c);
         e.fireAction("favicontap", [e, b, c, a], Ext.emptyFn)
      }
      else
      {
         e.fireAction("itemtap", [e, b, d, a], "doItemTap")
      }
   },
   doAddHeader : function(d, b)
   {
      var c = Ext.Date, a = c.parseDate(b, "YmdHi");
      if( a instanceof Date)
      {
         b = c.format(a, "g:ia")
      }
      Ext.get(d).insertFirst(Ext.Element.create(
      {
         cls : this.getBaseCls() + "-header",
         html : b
      }))
   }
});
Ext.define("Sencha.view.NavBar",
{
   extend : "Ext.Sheet",
   xtype : "NavBar",
   config :
   {
      cls : "sc-nav",
      hideOnMaskTap : true,
      height : 60,
      left : 0,
      right : 0,
      top : 0,
      centered : false,
      defaultType : "button",
      layout :
      {
         type : "hbox",
         pack : "center"
      },
      defaults :
      {
         iconMask : true,
         activeCls : Ext.baseCSSPrefix + "tab-active",
         iconAlign : "bottom",
         ui : "plain"
      },
      scrollable :
      {
         direction : "horizontal",
         indicators : false
      },
      items : [
      {
         text : "Schedule",
         view : "SchedulePanel",
         iconCls : "calendar2"
      },
      {
         text : "Speakers",
         view : "SpeakersList",
         iconCls : "team"
      },
      {
         text : "Sponsors",
         view : "SponsorsList",
         iconCls : "heart"
      },
      {
         text : "Hackathon",
         view : "Hackathon",
         iconCls : "settings5"
      },
      {
         text : "Location",
         view : "ConferenceLocation",
         iconCls : "locate4"
      },
      {
         text : "About",
         view : "About",
         iconCls : "info_plain"
      }]
   }
});
Ext.define("Sencha.model.Speaker",
{
   extend : "Ext.data.Model",
   fields : ["title", "url_title", "entry_date", "speaker_bio", "speaker_conference", "speaker_company", "speaker_twitter", "speaker_avatar", "speaker_sessions",
   {
      name : "id",
      mapping : "entry_id"
   }]
});
Ext.define("Sencha.view.SpeakerDetail",
{
   extend : "Ext.Container",
   xtype : "speakerdetail",
   record : undefined,
   config :
   {
      scrollable : true,
      speakerDetailTpl : Ext.create("Ext.XTemplate", "<div>", '<div style="padding: 10px;">', '<div style="<tpl if="speaker_avatar">background-image: url(http://src.sencha.io/jpg100/72/{speaker_avatar}); </tpl>float: left;"class="sc-avatar carousel"></div>', "<h3>{title}</h3>", "<h6>{speaker_company} &#9733; {[Sencha.Util.getTwitter(values.speaker_twitter)]}</h6>", '<p style="clear: left; margin-top: 10px">', "{speaker_bio}", "</p>", "</div>", "<div>", '<tpl if="values.speaker_sessions.length &gt; 0">', "<h5>Sessions</h5>", '<tpl for="values.speaker_sessions">', '<div class="session_speaker index_{[ xindex - 1 ]}" style="padding: 10px;">', "<strong>{title}</strong>", '<div class="session-carousel-time">', '{[ Sencha.Util.formatSessionStart(values, "n/j g:ia") ]}&ndash;{[ Sencha.Util.formatSessionEnd(values, "g:ia") ]}', "<br />Track: {session_track} ", "</div>", "</div>", "</tpl>", "</tpl>", "</div>", "</div>")
   },
   initialize : function()
   {
      var a = this;
      a.setItems([a.buildDetailContainer()]);
      a.callParent();
      a.renderElement.on(
      {
         delegate : ".sc-speaker-carousel-image",
         scope : a,
         tap : a.onPictureTap,
         click : a.onPictureTap
      })
   },
   buildDetailContainer : function()
   {
      var a = this;
      return
      {
         xtype : "component",
         data : a.record.getData(),
         tpl : a.getSpeakerDetailTpl(),
         listeners :
         {
            scope : a,
            painted : "onSpeakerDetailPainted"
         }
      }
   },
   onSpeakerDetailPainted : function(a)
   {
      a.element.on(
      {
         scope : this,
         delegate : "div.session_speaker",
         touchend : this.onSessionElTouchEnd,
         touchstart : this.onSessionElTouchStart,
         tap : this.onSessionElTap
      })
   },
   onSessionElTouchStart : function(a)
   {
      var b = a.getTarget();
      Ext.get(b).addCls("sc-speaker-selected")
   },
   onSessionElTouchEnd : function(a)
   {
      var b = a.getTarget();
      Ext.get(b).removeCls("sc-speaker-selected")
   },
   onSessionElTap : function(a)
   {
      var d = a.getTarget(), e = d.className.split(" "), c = e[1].split("_")[1], b = this.record.get("speaker_sessions")[c];
      this.fireEvent("sessionselect", this, b)
   },
   onPictureTap : function()
   {
      var a = this;
      a.fireEvent("imagetap", a, a.record.get("speaker_avatar"))
   }
});
Ext.define("Sencha.view.SpeakersList",
{
   extend : "Ext.dataview.List",
   xtype : "speakerslist",
   config :
   {
      indexBar : true,
      grouped : true,
      locked : true,
      itemTpl : '<div <tpl if="speaker_avatar">style="background: url(http://src.sencha.io/jpg100/72/{speaker_avatar});"</tpl> class="sc-avatar"></div><div class="speaker-name">{title}</div><div class="speaker-company speaker-tagline">{speaker_company}</div><tpl if="speaker_twitter"><div class="speaker-tagline speaker-tagline">@{speaker_twitter}</div></tpl>'
   }
});
Ext.define("Sencha.store.Speakers",
{
   extend : "Ext.data.Store",
   model : "Sencha.model.Speaker",
   proxy :
   {
      type : "memory"
   },
   getGroupString : function(a)
   {
      return a.get("title").match(/\s\w/)[0][1]
   },
   sorters : new Ext.util.Sorter(
   {
      sorterFn : function(d, c)
      {
         var f = d.get("title").match(/\s.*/)[0], e = c.get("title").match(/\s.*/)[0];
         if(f == e)
         {
            return 0
         }
         if(f < e)
         {
            return -1
         }
         else
         {
            return 1
         }
      }
   })
}); (function()
{
   var a =
   {
      platinum : 0,
      hackathon : 1,
      gold : 2,
      bronze : 3
   };
   Ext.define("Sencha.model.Sponsor",
   {
      extend : "Ext.data.Model",
      fields : ["entry_date", "sponsor_level", "sponsor_logo_url", "sponsor_description", "sponsor_url", "sponsor_priority", "title", "url_title",
      {
         name : "id",
         mapping : "entry_id"
      },
      {
         name : "sponsor_level_int",
         mapping : "sponsor_level",
         convert : function(b)
         {
            return a[b]
         }
      }]
   })
})();
Ext.define("Sencha.view.SponsorDetail",
{
   extend : "Ext.Component",
   record : undefined,
   config :
   {
      style : "padding: 5px;",
      scrollable : true,
      tpl : ["<div>", "<h3>{title}</h3>", '<span style="font-weight: bold;">Sponsorship Level :</span> {sponsor_level}', '<p class="sponsor-details-url"><a href="{sponsor_url}">{sponsor_url}</a></p>', '<p style="padding:  5px;">{sponsor_description}</p>', "</div>"].join("")
   }
});
Ext.define("Sencha.view.SponsorsList",
{
   extend : "Ext.List",
   xtype : "sponsorslist",
   config :
   {
      grouped : true,
      locked : true,
      itemTpl : ['<div  class="sponsors-list-logo" style="height: 60px; background-image: url(http://src.sencha.io/200/60/{sponsor_logo_url}); background-repeat: no-repeat;">', "</div>"].concat("")
   }
});
Ext.define("Sencha.store.Sponsors",
{
   extend : "Ext.data.Store",
   model : "Sencha.model.Sponsor",
   sorters : [
   {
      property : "sponsor_level_int",
      direction : "ASC"
   },
   {
      property : "sponsor_priority",
      direction : "ASC"
   }],
   getGroupString : function(a)
   {
      var b = a.get("sponsor_level");
      return b.charAt(0).toUpperCase() + b.slice(1)
   },
   proxy :
   {
      type : "memory"
   }
});
Ext.define("Sencha.model.History",
{
   extend : "Ext.data.Model",
   fields : ["view", "prevTitle"]
});
Ext.define("Sencha.store.History",
{
   extend : "Ext.data.Store",
   model : "Sencha.model.History"
});
Ext.define("Sencha.controller.About",
{
   extend : "Ext.app.Controller",
   views : ["About"],
   getNewView : function()
   {
      return this.getView("About").create(
      {
         title : "About"
      })
   }
});
Ext.define("Sencha.controller.Apps",
{
   extend : "Ext.app.Controller",
   views : ["Apps"],
   getNewView : function()
   {
      return this.getView("Apps").create(
      {
         title : "Apps"
      })
   }
});
Ext.define("Sencha.controller.Hackathon",
{
   extend : "Ext.app.Controller",
   views : ["Hackathon"],
   getNewView : function()
   {
      return this.getView("Hackathon").create(
      {
         title : "Hackathon"
      })
   }
});
Ext.define("Sencha.controller.ConferenceLocation",
{
   extend : "Ext.app.Controller",
   views : ["ConferenceLocation"],
   getNewView : function()
   {
      return this.getView("ConferenceLocation").create(
      {
         title : "Location"
      })
   }
});
Ext.define("Sencha.controller.NavBar",
{
   extend : "Ext.app.Controller",
   views : ["NavBar"],
   init : function()
   {
      this.control(
      {
         NavBar :
         {
            hide : this.onNavHide
         },
         "NavBar > button" :
         {
            tap : this.onButtonTap
         }
      });
      this.application.on(
      {
         scope : this,
         shownav : this.onAppShowNav
      })
   },
   onButtonTap : function(a)
   {
      this.destroyView();
      this.application.fireEvent("navigate", a, true)
   },
   destroyView : function()
   {
      if(this.view && this.view.element)
      {
         this.view.hide();
         Ext.Function.defer(this.view.destroy, 500, this.view);
         delete this.view
      }
   },
   getNewView : function()
   {
      return this.view ? this.view : this.view = this.getView("NavBar").create()
   },
   onAppShowNav : function()
   {
      if(this.view)
      {
         this.destroyView()
      }
      return this.getNewView().show()
   },
   onNavHide : function()
   {
      this.destroyView()
   }
});
Ext.define("Sencha.controller.SpeakerDetail",
{
   extend : "Ext.app.Controller",
   views : ["SpeakerDetail"],
   models : ["Speaker"],
   init : function()
   {
      this.control(
      {
         speakerdetail :
         {
            imagetap : this.onSpeakerDetailImageTap,
            sessionselect : this.onViewSessionSelect
         }
      })
   },
   onSpeakerDetailImageTap : function(a, b)
   {
   },
   onViewSessionSelect : function(a, b)
   {
      this.application.fireEvent("navigate",
      {
         view : "SessionDetail",
         title : "Session",
         record : b.getData ? b.getData() : b
      })
   },
   getNewView : function(b)
   {
      var e = this.getModel("Speaker"), g, f; b = ( b instanceof e) ? b : e.create(b), g = b.get("title"), f = Sencha.DataManager.getSessionsForSpeaker(g);
      var a = b.data, d = a.speaker_bio, c = f.length;
      if(!d)
      {
         d = "Currently employed by  " + a.speaker_company + ", " + a.title + " has consistently demonstrated expertise in various Sencha products. " + a.title + " is a community leader, assisting hundreds of peer developers on the online forums, and will be speaking at " + c + " session" + (c > 1 ? "s." : ".");
         b.set("speaker_bio", d)
      }
      b.set("speaker_sessions", f);
      return this.getView("SpeakerDetail").create(
      {
         title : "Speaker",
         record : b
      })
   },
   getModelsFromData : function(c)
   {
      var b = [], a = this.getModel("Speaker");
      Ext.each(c, function(e, d)
      {
         b[d] = a.create(c[d])
      });
      return b
   }
});
Ext.define("Sencha.controller.SpeakersList",
{
   extend : "Ext.app.Controller",
   views : ["SpeakersList"],
   stores : ["Speakers"],
   init : function()
   {
      this.control(
      {
         speakerslist :
         {
            itemtap : this.onViewItemTap
         }
      })
   },
   getNewView : function()
   {
      var c = Sencha.DataManager.getSpeakers(), b = this.getStore("Speakers"), a = b.proxy.reader.extractData(c);
      b.loadRecords(a);
      return this.getView("SpeakersList").create(
      {
         title : "Speakers",
         store : b
      })
   },
   onViewItemTap : function(c, b)
   {
      var a = c.getStore().getAt(b);
      this.application.fireEvent("navigate",
      {
         view : "SpeakerDetail",
         record : a
      })
   }
});
Ext.define("Sencha.controller.SponsorDetail",
{
   extend : "Ext.app.Controller",
   views : ["SponsorDetail"],
   models : ["Sponsor"],
   getNewView : function(a)
   {
      var b = this.getModel("Sponsor");
      a = ( a instanceof b) ? a : b.create(a);
      return this.getView("SponsorDetail").create(
      {
         title : "Sponsor",
         data : a.getData()
      })
   }
});
Ext.define("Sencha.controller.SponsorsList",
{
   extend : "Ext.app.Controller",
   views : ["SponsorsList"],
   stores : ["Sponsors"],
   init : function()
   {
      this.control(
      {
         sponsorslist :
         {
            itemtap : this.onViewItemTap
         }
      })
   },
   getNewView : function()
   {
      var c = Sencha.DataManager.getData("sponsors"), b = this.getStore("Sponsors"), a = b.proxy.reader.extractData(c);
      b.loadRecords(a);
      return this.getView("SponsorsList").create(
      {
         title : "Sponsors",
         store : b
      })
   },
   onViewItemTap : function(c, b)
   {
      var a = c.getStore().getAt(b);
      this.application.fireEvent("navigate",
      {
         view : "SponsorDetail",
         record : a
      })
   }
});
Ext.define("Sencha.controller.Viewport",
{
   extend : "Ext.app.Controller",
   models : ["History"],
   stores : ["History"],
   refs : [
   {
      ref : "main",
      selector : '[xtype="senchaconviewport"]'
   },
   {
      ref : "backButton",
      selector : '[itemId="viewportBackButton"]'
   },
   {
      ref : "navButton",
      selector : '[itemId="viewportNavButton"]'
   },
   {
      ref : "viewportToolbar",
      selector : '[itemId="viewportToolbar"]'
   }],
   init : function()
   {
      this.control(
      {
         '[itemId="viewportBackButton"]' :
         {
            tap : this.onBackButton
         },
         '[itemId="viewportNavButton"]' :
         {
            tap : this.onNavBtn
         }
      });
      Sencha.DataManager.on(
      {
         scope : this,
         loadcomplete : this.onDataManagerLoadComplete
      });
      Sencha.DataManager.fetchData();
      this.application.on(
      {
         scope : this,
         navigate : this.onNavigate,
         updatetitle : this.onUpdateTitle
      });
      this.callParent()
   },
   onDataManagerLoadComplete : function()
   {
      var a = this.getController("SchedulePanel").getNewView();
      this.getMain().setItems(a)
   },
   onNavBtn : function()
   {
      this.application.fireEvent("shownav")
   },
   onBackButton : function()
   {
      this.doNavigation()
   },
   doNavigation : function(b, g)
   {
      var e = this, d = this.getMain(), i = d.items, h = i.indexOf(b), c = d.getActiveItem(), f = this.getHistoryStore(), a;
      if(b && h == -1)
      {
         d.getLayout().getAnimation().setReverse(false);
         d.add(b);
         d.setActiveItem(b);
         if(g === true)
         {
            f.removeAll();
            Ext.Function.defer(function()
            {
               if(c.xtype == "schedulepanel")
               {
                  e.getController("SchedulePanel").onViewDestroy();
                  e.getController("SessionsList").onViewDestroy()
               }
               d.resetToView(b)
            }, 500);
            e.hideBackButton()
         }
         else
         {
            e.showBackButton();
            a = this.getHistoryModel().create(
            {
               view : c
            });
            f.add(a)
         }
         this.updateToolbarTitle(b.title)
      }
      else
      {
         a = f.last();
         f.remove(a);
         b = a.get("view");
         d.getLayout().getAnimation().setReverse(true);
         d.setActiveItem(b);
         if(f.getCount() < 1)
         {
            this.hideBackButton();
            this.updateToolbarTitle(b.title)
         }
         else
         {
            this.updateToolbarTitle(b.title)
         }
         Ext.Function.defer(function()
         {
            d.remove(c, true)
         }, 500)
      }
   },
   onNavigate : function(d, b)
   {
      var e = this;
      if(e.locked)
      {
         return
      }
      var a = d.view, c = this.getController(a), f;
      e.locked = true;
      Ext.Function.defer(function()
      {
         e.locked = false
      }, 500);
      if(Ext.isFunction(c.getNewView))
      {
         f = c.getNewView(d.record)
      }
      else
      {
         f = c.getView(a).create()
      }
      this.doNavigation(f, b)
   },
   onUpdateTitle : function(a)
   {
      this.updateToolbarTitle(a)
   },
   updateToolbarTitle : function(a)
   {
      this.getViewportToolbar().setTitle(a)
   },
   showBackButton : function()
   {
      this.getBackButton().show()
   },
   hideBackButton : function()
   {
      this.getBackButton().hide()
   },
   goPostal : function()
   {
      Ext.create("Ext.Panel",
      {
         style : "color: #f25a34; background-color: #333;",
         modal : true,
         hideOnMaskTap : false,
         floating : true,
         centered : true,
         height : 180,
         width : 300,
         html : '<h3 class="" style="font-family: Ultra, serif; margin: 5px;">Error!</h3><p style="padding: 10px; font-size: 1.2em; color: #FFF;">This application must be online. Please connect your device to the internet and try again.</p>'
      }).show()
   }
});
Ext.define("Sencha.store.Sessions",
{
   extend : "Ext.data.Store",
   model : "Sencha.model.Session",
   sorters : [
   {
      property : "session_start",
      direction : "ASC"
   },
   {
      property : "session_track",
      direction : "ASC"
   }],
   proxy :
   {
      type : "memory"
   },
   getGroupString : function(a)
   {
      return Ext.Date.format(a.get("session_start"), "YmdHi")
   }
});
Ext.define("Sencha.controller.SchedulePanel",
{
   extend : "Ext.app.Controller",
   views : ["SchedulePanel"],
   stores : ["Sessions"],
   init : function()
   {
      var a = this;
      a.control(
      {
         schedulepanel :
         {
            navbtn : a.onNavBtn,
            destroy : a.onViewDestroy
         }
      });
      this.application.on(
      {
         scope : this,
         newschedulepanel : this.getNewView
      })
   },
   onViewDestroy : function()
   {
      delete this.view
   },
   onNavBtn : function(a, b)
   {
      var c = this;
      if(b.btnType == "date")
      {
         c.filterByDate(a, b.date)
      }
      else
      {
         c.filterByFavorites(a)
      }
   },
   filterByFavorites : function(a)
   {
      var c = a;
      a = this.view || c;
      var b = this, d = a.child("sessionslist");
      try
      {
         a.remove(d)
      }
      catch(f)
      {
      }
      d = b.getController("SessionsList").getNewViewFromFavorites();
      a.add(d);
      if(c)
      {
         this.application.fireEvent("updatetitle", "My Schedule")
      }
   },
   filterByDate : function(a, b)
   {
      var c = this, d = a.child("sessionslist");
      try
      {
         a.remove(d)
      }
      catch(f)
      {
      }
      d = c.getController("SessionsList").getNewViewFromDate(
      {
         date : b
      });
      a.add(d);
      this.application.fireEvent("updatetitle", "Schedule")
   },
   getNewView : function(d)
   {
      d = d ||
      {
      };
      var g = this, b = Sencha.DataManager, c = b.getUniqueSessionDays(), j = Sencha.Util.tzOffset, h = parseInt(Ext.Date.format(new Date("10/25/2011"), "U"), 10) - j, a = c[0], i = c[2], f = (h >= a && h <= i), e;
      e = f ? h : a;
      d.title = "Sessions";
      d.uniqueDays = c;
      d.items = g.getController("SessionsList").getNewViewFromDate(
      {
         date : c[0],
         scrollToTime : f
      });
      return this.view = g.getView("SchedulePanel").create(d)
   }
});
Ext.define("Sencha.controller.SessionDetail",
{
   extend : "Ext.app.Controller",
   views : ["SessionDetail"],
   stores : ["Sessions"],
   models : ["Session"],
   init : function()
   {
      this.control(
      {
         sessiondetail :
         {
            speakerselect : this.onViewSpeakerSelect,
            favicontap : this.onViewFaviconTap
         }
      })
   },
   onSpeakerDetailImageTap : function(a, b)
   {
   },
   onViewSpeakerSelect : function(a, b)
   {
      this.application.fireEvent("navigate",
      {
         view : "SpeakerDetail",
         title : "Speaker",
         record : b
      })
   },
   onViewFaviconTap : function(g, f)
   {
      var e = this, d = g.data, c = !!d.favorite, a = "scheduled", b = "unscheduled", h = this.getController("SessionsList");
      if(!c)
      {
         f.replaceCls(b, a)
      }
      else
      {
         f.replaceCls(a, b)
      }
      if(h.view)
      {
         h.findAndUpdateFavicon(g)
      }
      else
      {
         g.data.favorite = !c;
         Sencha.DataManager.setFavoritesSession(g, !g.data.favorite)
      }
   },
   getNewView : function(e)
   {
      var f = this, a = Sencha.DataManager, c = f.getStore("Sessions"), g = f.getModel("Session"), d, b;
      if( e instanceof g)
      {
         b = e
      }
      else
      {
         b = c.proxy.reader.extractData(e)[0];
         c.destroy()
      }
      d = a.getSpeakersFromSession(b.getData());
      Ext.each(d, function(h)
      {
         h.num_sessions = a.getNumberOfSessionsForSpeaker(h.title)
      });
      b.set("speakers", d);
      return f.getView("SessionDetail").create(
      {
         title : "Session",
         record : b
      })
   }
});
Ext.define("Sencha.controller.SessionsList",
{
   extend : "Ext.app.Controller",
   views : ["SessionsList"],
   stores : ["Sessions"],
   init : function()
   {
      this.control(
      {
         sessionslist :
         {
            itemtap : this.onItemTap,
            favicontap : this.onFaviconTap,
            destroy : this.onViewDestroy
         }
      })
   },
   getNewViewFromDate : function(b)
   {
      b = b ||
      {
      };
      var a = Sencha.DataManager, e = a.getSessionsForDay(b.date), d = this.getStore("Sessions"), c = d.proxy.reader.extractData(e);
      d.loadRecords(c);
      b.store = d;
      this.viewMode = "date";
      return this.view = this.getView("SessionsList").create(b)
   },
   getNewViewFromFavorites : function()
   {
      var b = Sencha.DataManager, a = b.getSessionFavorites(), d = this.getStore("Favorites"), c = d.proxy.reader.extractData(a);
      d.loadRecords(c);
      this.viewMode = "fav";
      return this.view = this.getView("SessionsList").create(
      {
         store : d,
         isFavorites : true
      })
   },
   onViewDestroy : function()
   {
      delete this.view
   },
   onFaviconTap : function(k, j, e)
   {
      var g = Sencha.DataManager, o = k.getStore(), p = "favorite", n = o.getAt(j), q = g.setFavoritesSession(n, n.get(p)), m = '.x-list-item[itemindex="', c = '"] div div.sc-favicon', b = "scheduled", a = "unscheduled", l, h, i, f, d;
      if(q.length > 0)
      {
         Ext.Function.defer(function()
         {
            Ext.each(q, function(r)
            {
               f = r.favorite;
               if(e != false)
               {
                  h = o.find("id", r.entry_id);
                  i = o.getAt(h);
                  i.data.favorite = f;
                  l = Ext.query(m+h+c)[0];
                  d = Ext.get(l);
                  if(!f)
                  {
                     d.replaceCls(b, a)
                  }
                  else
                  {
                     d.replaceCls(a, b)
                  }
               }
            })
         }, 10)
      }
   },
   onItemTap : function(c, b)
   {
      var a = c.getStore().getAt(b);
      this.application.fireEvent("navigate",
      {
         view : "SessionDetail",
         record : a
      })
   },
   getCurrentView : function()
   {
      return this.view
   },
   findAndUpdateFavicon : function(c)
   {
      var b = this.view, a;
      if(!b)
      {
         Sencha.DataManager.setFavoritesSession(c, c.get("favorite"));
         return
      }
      a = b.getStore().indexOf(c);
      if(this.viewMode == "date" && a > -1)
      {
         this.onFaviconTap(b, a)
      }
      else
      {
         Sencha.DataManager.setFavoritesSession(c, c.get("favorite"));
         this.getController("SchedulePanel").filterByFavorites()
      }
   }
});
Ext.Loader.setConfig(
{
   enabled : true,
   paths :
   {
      //Sencha : "js/Sencha/app"
      Sencha : "javascripts/mobile/src/Sencha/app"
   }
});
Ext.require("Ext.DateExtras");
Ext.require(["Sencha.Util", "Sencha.DataManager"]);
Ext.regApplication(
{
   name : "Sencha",
   //appFolder : "js/Sencha/app",
   appFolder : "javascripts/mobile/src/Sencha/app",
   autoCreateViewport : true,
   controllers : ["About", "Apps", "Hackathon", "ConferenceLocation", "SchedulePanel", "SessionDetail", "SessionsList", "NavBar", "SpeakerDetail", "SpeakersList", "SponsorDetail", "SponsorsList", "Viewport"],
   launch : function()
   {
      this.launched = true;
      this.mainLaunch();
   },
   mainLaunch : function()
   {
      if(!device || !this.launched)
      {
         return;
      }
      var a = this;
      Sencha.DataManager.on(
      {
         scope : a,
         postal : function()
         {
            this.fireEvent("postal")
         }
      })
      console.log('mainLaunch');
   }
});
});