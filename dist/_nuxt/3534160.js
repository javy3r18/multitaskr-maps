(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{415:function(e,t,o){var content=o(442);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,o(120).default)("ec2b57c6",content,!0,{sourceMap:!1})},441:function(e,t,o){"use strict";o(415)},442:function(e,t,o){var n=o(119)(!1);n.push([e.i,'#map{width:100%;height:100vh}.multitaskr{background-color:#4e0eaf}.text-address{font-weight:700;font-family:Arial,Helvetica,sans-serif;font-size:16px}.input-class{height:30px;font-size:14px;background-image:url(https://cdn2.hubspot.net/hubfs/4004166/bioticresearch_website_assets/images/search_icon.png);background-repeat:no-repeat;background-position:0;padding-left:40px;background-color:#fff;border:1px solid #4e0eaf;box-shadow:none;-webkit-appearance:none}.toggleTitle{font-size:15px;font-weight:700}.details{color:#575758;font-size:15px}.details span{color:#67676b}.collapsable-text{font-weight:700;font-family:Arial,Helvetica,sans-serif}#underline{color:#4e0eaf;text-decoration:underline}#toggleicon{display:inline-block;float:right}#infoicon{display:inline-block;position:relative;cursor:pointer}#infoicon:hover{color:#4e0eaf}.mapboxgl-popup{max-width:400px;font:15px/20px "Helvetica Neue",Arial,Helvetica,sans-serif}',""]),e.exports=n},451:function(e,t,o){"use strict";o.r(t);o(16),o(15),o(11),o(17),o(18),o(34),o(42),o(81),o(70),o(82),o(92),o(75);var n=o(41),r=o(3),main=(o(83),o(31),o(26),o(175),o(9),o(13),o(421)),l=o(22),c=o(212),d=o(97),m=o(138),f=o(412);function v(e,t){var o="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!o){if(Array.isArray(e)||(o=function(e,t){if(!e)return;if("string"==typeof e)return h(e,t);var o=Object.prototype.toString.call(e).slice(8,-1);"Object"===o&&e.constructor&&(o=e.constructor.name);if("Map"===o||"Set"===o)return Array.from(e);if("Arguments"===o||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o))return h(e,t)}(e))||t&&e&&"number"==typeof e.length){o&&(e=o);var i=0,n=function(){};return{s:n,n:function(){return i>=e.length?{done:!0}:{done:!1,value:e[i++]}},e:function(e){throw e},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var r,l=!0,c=!1;return{s:function(){o=o.call(e)},n:function(){var e=o.next();return l=e.done,e},e:function(e){c=!0,r=e},f:function(){try{l||null==o.return||o.return()}finally{if(c)throw r}}}}function h(e,t){(null==t||t>e.length)&&(t=e.length);for(var i=0,o=new Array(t);i<t;i++)o[i]=e[i];return o}function y(object,e){var t=Object.keys(object);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(object);e&&(o=o.filter((function(e){return Object.getOwnPropertyDescriptor(object,e).enumerable}))),t.push.apply(t,o)}return t}l.default.use(c.a),l.default.use(d.a);var _={data:function(){return{access_token:"pk.eyJ1IjoiZWxnZXJhcmRvIiwiYSI6ImNsOG90NjFtMzFucG0zeWw1YWRheTV5ZmYifQ.87BCgCSXpjLIHkqGsWUW7g",map:{},search:{},inputs:{address:null},coordinates:{lng:this.$route.query.lng,lat:this.$route.query.lat},params:null,geojsonArrays:[],hoveredStateId:null,mouseHover:null,popup:null,marker:null,currentModel:null,showMap:!1,boundsZoom:null}},computed:function(e){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?y(Object(source),!0).forEach((function(t){Object(r.a)(e,t,source[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(source)):y(Object(source)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(source,t))}))}return e}({},Object(m.b)({items:"locations/items",polygons:"polygons/polygons"})),mounted:function(){this.createMap(),this.isMapLoaded(),this.setAutoFill(),this.initMarker()},methods:{createMap:function(){this.$mapboxgl.accessToken=this.access_token,this.map=new this.$mapboxgl.Map({container:"map",style:"mapbox://styles/javy3r18/cl9fvwqli000p15qskifof42o",zoom:19,pitch:45,bearing:-17,center:[-117.157268,32.713888],antialias:!0})},isMapLoaded:function(){var e=this;this.map.on("load",(function(){e.getSelectedAddress(),e.initJurisdictionTileset(),e.initChulaVistaTileset(),e.initSanDiegoTileset(),e.initParcelTileset(),e.add3DModel(),e.getParcelId(),e.popup=new e.$mapboxgl.Popup({closeButton:!1,closeOnClick:!1}),e.map.moveLayer("citysandiego","building-extrusion"),e.map.moveLayer("parcelLine","building-extrusion"),e.map.on("mousemove","citysandiego",(function(t){e.map.getCanvas().style.cursor="pointer";var content=e.map.queryRenderedFeatures(t.point,{layers:["citysandiego"]}),o=content[0].id;e.mouseHover!=o&&(e.mouseHover=content[0].id,e.params=t.lngLat,t.features.length>0&&(null!==e.hoveredStateId&&e.map.setFeatureState({source:"parcelsTileset",sourceLayer:"citysandiego",id:e.hoveredStateId},{hover:!1}),e.hoveredStateId=t.features[0].id,e.map.setFeatureState({source:"parcelsTileset",sourceLayer:"citysandiego",id:e.hoveredStateId},{hover:!0})))})),e.map.on("click","citysandiego",(function(t){e.coordinates=t.lngLat,e.getSelectedAddress()})),e.map.on("mouseleave","citysandiego",(function(){e.params=null,e.map.getCanvas().style.cursor="",e.popup.remove(),e.mouseHover=null,null!==e.hoveredStateId&&e.map.setFeatureState({source:"parcelsTileset",sourceLayer:"citysandiego",id:e.hoveredStateId},{hover:!1}),e.hoveredStateId=null}))}))},setAutoFill:function(){this.search=this.$search.autofill({accessToken:this.access_token,options:{country:"us"}})},locationCenter:function(){this.map.easeTo({center:this.coordinates,zoom:15,speed:3,duration:2500,curve:2})},getParcelId:function(){var e=this;this.map.once("idle",(function(){var content=e.map.queryRenderedFeatures(e.marker._pos,{layers:["citysandiego"]});console.log(content),!1,e.showMap=!0}))},getSelectedAddress:function(){var e=this;return Object(n.a)(regeneratorRuntime.mark((function t(){var o,n,r,l,c,d,m;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return e.map.getSource("mainAddress")&&(e.map.removeLayer("polygon"),e.map.removeSource("mainAddress")),o={lat:e.coordinates.lat,lng:e.coordinates.lng},t.next=4,e.$store.dispatch("polygons/get",o);case 4:n=JSON.parse(e.polygons.geojson),r=n.coordinates[0],e.geojsonArrays=[],r.forEach((function(t){var o=[t[1],t[0]];e.geojsonArrays.push(o)})),e.map.addSource("mainAddress",{type:"geojson",data:{type:"Feature",geometry:{type:"Polygon",coordinates:[e.geojsonArrays]}}}),e.map.addLayer({id:"polygon",generateId:!0,source:"mainAddress",type:"fill",paint:{"fill-color":"#4D04AE","fill-outline-color":"rgba(66,100,251, 1)"}}),e.map.moveLayer("polygon","building-extrusion"),l=new e.$mapboxgl.LngLatBounds(e.geojsonArrays[0],e.geojsonArrays[0]),c=v(e.geojsonArrays);try{for(c.s();!(d=c.n()).done;)m=d.value,l.extend(m)}catch(e){c.e(e)}finally{c.f()}e.boundsZoom=l,e.map.fitBounds(l,{padding:20,zoom:20});case 16:case"end":return t.stop()}}),t)})))()},onAddressChange:function(){var e=this;this.search.addEventListener("retrieve",(function(t){console.log(t),e.coordinates.lat=t.detail.features[0].geometry.coordinates[1],e.coordinates.lng=t.detail.features[0].geometry.coordinates[0],e.getSelectedAddress()}))},initJurisdictionTileset:function(){this.map.addSource("jurisdictionTileset",{type:"vector",url:"mapbox://multitaskr.sdcountyjurisdictions",generateId:!0}),this.map.addLayer({id:"sdcountyjurisdictions",generateId:!0,source:"jurisdictionTileset","source-layer":"sdcountyjurisdictions",type:"fill",minzoom:10,maxzoom:12,paint:{"fill-color":"#B591F9","fill-outline-color":"rgba(66,100,251, 1)","fill-opacity":["case",["boolean",["feature-state","hover"],!1],1,.5]}}),this.map.addLayer({id:"jurisdictionLine","source-layer":"sdcountyjurisdictions",type:"line",source:"jurisdictionTileset",layout:{},minzoom:10,maxzoom:12,paint:{"line-dasharray":[4,4],"line-color":"#4D04AE","line-width":2}})},initChulaVistaTileset:function(){this.map.addSource("chulaVistaTileset",{type:"vector",url:"mapbox://multitaskr.chulavistazoning",generateId:!0}),this.map.addLayer({id:"chulavistazoning",generateId:!0,source:"chulaVistaTileset","source-layer":"chulavistazoning",type:"fill",minzoom:12.5,maxzoom:14,paint:{"fill-color":"#B591F9","fill-outline-color":"rgba(66,100,251, 1)","fill-opacity":["case",["boolean",["feature-state","hover"],!1],1,.5]}}),this.map.addLayer({id:"ChilaVistaLine","source-layer":"chulavistazoning",type:"line",source:"chulaVistaTileset",layout:{},minzoom:12.5,maxzoom:14,paint:{"line-dasharray":[4,4],"line-color":"#4D04AE","line-width":2}})},initSanDiegoTileset:function(){this.map.addSource("SanDiegoTileset",{type:"vector",url:"mapbox://multitaskr.city_sandiego_zoning",generateId:!0}),this.map.addLayer({id:"city_sandiego_zoning",generateId:!0,source:"SanDiegoTileset","source-layer":"city_sandiego_zoning",type:"fill",minzoom:12.5,maxzoom:14,paint:{"fill-color":"#B591F9","fill-outline-color":"rgba(66,100,251, 1)","fill-opacity":["case",["boolean",["feature-state","hover"],!1],1,.5]}}),this.map.addLayer({id:"SanDiegoLine","source-layer":"city_sandiego_zoning",type:"line",source:"SanDiegoTileset",layout:{},minzoom:12.5,maxzoom:14,paint:{"line-dasharray":[4,4],"line-color":"#4D04AE","line-width":2}})},initParcelTileset:function(){this.map.addSource("parcelsTileset",{type:"vector",url:"mapbox://multitaskr.citysandiego",generateId:!0}),this.map.addLayer({id:"citysandiego",generateId:!0,source:"parcelsTileset","source-layer":"citysandiego",type:"fill",minzoom:15,paint:{"fill-color":"#B591F9","fill-outline-color":"rgba(66,100,251, 1)","fill-opacity":["case",["boolean",["feature-state","hover"],!1],1,.5]}}),this.map.addLayer({id:"parcelLine","source-layer":"citysandiego",type:"line",source:"parcelsTileset",layout:{},minzoom:15,paint:{"line-dasharray":[4,4],"line-color":"#4D04AE","line-width":2}})},add3DModel:function(){var e=this,t=this.coordinates;this.map.addLayer({id:"custom_layer",type:"custom",renderingMode:"3d",onAdd:function(map,o){window.tb=new main.Threebox(map,o,{defaultLights:!0,enableSelectingObjects:!0,enableDraggingObjects:!0,enableRotatingObjects:!0,enableTooltips:!0});tb.loadObj({obj:"./model/example.fbx",type:"fbx",scale:.03,units:"meters",rotation:{x:90,y:0,z:0}},(function(o){e.currentModel=o,console.log(o);var n=e.currentModel.setCoords([t.lng,t.lat]);tb.add(n)}))},render:function(e,t){tb.update()}})},setAdu:function(){var e=this,a=!0;this.map.on("mousemove","polygon",(function(t){a&&e.currentModel.setCoords([t.lngLat.lng,t.lngLat.lat])})),this.map.on("click",(function(){a=!1}))},initMarker:function(){this.marker=new this.$mapboxgl.Marker({color:"black",draggable:!1}).setLngLat(this.coordinates).addTo(this.map)},getAddress:function(){var e=this;return Object(n.a)(regeneratorRuntime.mark((function t(){var o;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return o={lat:e.coordinates.lat,lng:e.coordinates.lng},t.next=3,e.$store.dispatch("locations/get",o);case 3:e.inputs.address=e.items.features[0].place_name;case 4:case"end":return t.stop()}}),t)})))()}},watch:{coordinates:{deep:!0,handler:function(e,t){this.getAddress()}},search:{deep:!0,handler:function(e,t){this.onAddressChange()}},params:Object(f.debounce)(function(){var e=Object(n.a)(regeneratorRuntime.mark((function e(t){var o,n,r,l,c,d,m,f=this;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(!this.params){e.next=4;break}return e.next=3,this.$store.dispatch("polygons/get",this.params);case 3:try{o=JSON.parse(this.polygons.geojson),n=o.coordinates[0],this.geojsonArrays=[],n.forEach((function(e){var t=[e[1],e[0]];f.geojsonArrays.push(t)})),r=new this.$mapboxgl.LngLatBounds(this.geojsonArrays[0],this.geojsonArrays[0]),l=v(this.geojsonArrays);try{for(l.s();!(c=l.n()).done;)d=c.value,r.extend(d)}catch(e){l.e(e)}finally{l.f()}m=r,this.popup.setLngLat(m.getCenter()).setHTML("Example Address").addTo(this.map)}catch(e){console.log(e)}case 4:case"end":return e.stop()}}),e,this)})));return function(t){return e.apply(this,arguments)}}(),500)}},x=_,w=(o(441),o(99)),component=Object(w.a)(x,(function(){var e=this,t=e._self._c;return t("div",[t("div",{style:e.showMap?"display:none":"display:inline"},[t("h1",[e._v("Cargando...")])]),e._v(" "),t("b-container",{staticClass:"m-0 p-0",style:e.showMap?"display:inline":"visibility: hidden",attrs:{fluid:""}},[t("b-row",[t("b-col",{attrs:{cols:"12"}},[t("div",[t("b-navbar",{attrs:{toggleable:"lg",type:"dark"}},[t("div",[t("a",{attrs:{href:"/"}},[t("img",{attrs:{src:"https://gomultitaskr.com/wp-content/uploads/brizy/imgs/multitaskr-logo-png-202x30x0x0x202x30x1664907017.png",href:"/"}})])]),e._v(" "),t("b-navbar-nav",{staticClass:"ml-auto"},[t("b-nav-form",[t("b-form-input",{staticClass:"input-class",attrs:{name:"address",placeholder:"Enter a California location",autocomplete:"shipping address-line1"}})],1)],1),e._v(" "),t("b-navbar-nav",{staticClass:"ml-auto"},[t("b-button",{staticStyle:{"background-color":"#4e0eaf"}},[e._v("Login")])],1)],1)],1)])],1),e._v(" "),t("b-row",[t("b-col",{attrs:{cols:"3"}},[t("div",{staticClass:"m-3"},[t("hr"),e._v(" "),t("div",[t("b-card-text",{staticClass:"text-address"},[e._v(e._s(e.inputs.address))])],1),e._v(" "),t("hr"),e._v(" "),t("b-tabs",{attrs:{"content-class":"mt-3"}},[t("b-tab",{attrs:{title:"Details",active:""}},[t("div",{staticClass:"details"},[t("b-row",[t("b-col",{attrs:{cols:"6"}},[t("p",[e._v("\n                    CITY"),t("br"),e._v(" "),t("span",{attrs:{id:"underline"}},[e._v("{{}}")])]),e._v(" "),t("p",[e._v("\n                    STATE"),t("br"),e._v(" "),t("span",{attrs:{id:"underline"}},[e._v("{{}}")])]),e._v(" "),t("p",[t("b-icon",{attrs:{id:"infoicon",icon:"info-circle","font-scale":"0.8"}}),e._v("\n                    LOT AREA"),t("br"),e._v(" "),t("span",[e._v("0.82")])],1),e._v(" "),t("p",[t("b-icon",{attrs:{id:"infoicon",icon:"info-circle","font-scale":"0.8"}}),e._v("\n                    YEAR BUILT"),t("br"),e._v(" "),t("span",[e._v("2000")])],1)]),e._v(" "),t("b-col",{attrs:{cols:"6"}},[t("p",[e._v("\n                    COUNTY"),t("br"),e._v(" "),t("span",{attrs:{id:"underline"}},[e._v("{{}}")])]),e._v(" "),t("p",[e._v("\n                    ZIP CODE"),t("br"),e._v(" "),t("span",[e._v("{{}}")])]),e._v(" "),t("p",[t("b-icon",{attrs:{id:"infoicon",icon:"info-circle","font-scale":"0.8"}}),e._v("\n\n                    PROPERTY ID"),t("br"),e._v(" "),t("span",[e._v("{{}}")])],1)])],1)],1)]),e._v(" "),t("b-tab",{attrs:{title:"Projects"}},[t("p",[e._v("I'm the second tab")])]),e._v(" "),t("b-tab",{attrs:{title:"Documents"}},[t("p",[e._v("I'm a disabled tab!")])])],1),e._v(" "),t("hr"),e._v(" "),t("div",{staticClass:"collapsable-text"},[t("b-container",{directives:[{name:"b-toggle",rawName:"v-b-toggle.collapse-1",modifiers:{"collapse-1":!0}}]},[t("b-button",{on:{click:e.setAdu}},[e._v("Set ADU")])],1),e._v(" "),t("hr"),e._v(" "),t("b-container",{directives:[{name:"b-toggle",rawName:"v-b-toggle.collapse-1",modifiers:{"collapse-1":!0}}]},[t("span",[e._v("Assesed Values")]),e._v(" "),t("b-icon",{attrs:{id:"toggleicon",icon:"chevron-down"}})],1),e._v(" "),t("hr"),e._v(" "),t("b-container",{directives:[{name:"b-toggle",rawName:"v-b-toggle.collapse-1",modifiers:{"collapse-1":!0}}]},[t("span",[e._v("Property details")]),e._v(" "),t("b-icon",{attrs:{id:"toggleicon",icon:"chevron-down"}})],1),e._v(" "),t("hr"),e._v(" "),t("b-container",{directives:[{name:"b-toggle",rawName:"v-b-toggle.collapse-1",modifiers:{"collapse-1":!0}}]},[t("span",[e._v("Environmental Hazards & Concerns")]),e._v(" "),t("b-icon",{attrs:{id:"toggleicon",icon:"chevron-down"}})],1),e._v(" "),t("hr"),e._v(" "),t("b-container",{directives:[{name:"b-toggle",rawName:"v-b-toggle.collapse-1",modifiers:{"collapse-1":!0}}]},[t("span",[e._v("Zoning & General Plan")]),e._v(" "),t("b-icon",{attrs:{id:"toggleicon",icon:"chevron-down"}})],1)],1),e._v(" "),t("hr")],1)]),e._v(" "),t("b-col",{attrs:{cols:"9"}},[t("div",{attrs:{id:"map"}})])],1)],1)],1)}),[],!1,null,null,null);t.default=component.exports}}]);