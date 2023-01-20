<template>
  <div>
    <div
      :style="
        showMap
          ? 'display:none'
          : 'display:inline; height:100vh; display:flex; justify-content:center; align-items:center; color:white; background-image: url(../loading.gif); background-size: cover;'
      "
    >
      <h1>Loading...</h1>
    </div>
    <b-container
      :style="showMap ? 'display: inline' : 'visibility: hidden'"
      fluid
      class="m-0 p-0"
    >
      <div id="map"></div>

      <div v-if="aduExist">
        <b-alert v-if="aduStatePosition" variant="success" show
          >ADU Feasibility approved</b-alert
        >
        <b-alert v-if="!aduStatePosition" variant="danger" show
          >Can't build the ADU. Feasibility problem</b-alert
        >
      </div>

      <div class="navigation">
        <b-button @click="moveToCurrentParcel"
          ><b-icon icon="cursor-fill"></b-icon
        ></b-button>
        <b-button @click="map.zoomIn()">+</b-button>
        <b-button @click="map.zoomOut()">-</b-button>
        <b-button @click="changeStyle"
          ><b-icon icon="globe2"></b-icon
        ></b-button>
      </div>

      <div class="bottomBarContainer">
        <b-button @click="showMenu = !showMenu" class="menuButton"
          >Menu</b-button
        >

        <div v-if="showMenu" class="menu">
          <div class="aduSettings">
            <p>ADU Elevation: {{ elevationFilter }}ft</p>
            <h3>Adu Settings</h3>
            <p>Rotation:</p>
            <b-form-input
              id="range"
              v-model="rotation"
              type="range"
              min="0"
              max="360"
              :disabled="!aduExist"
            ></b-form-input>
            <div class="elementRow">
              <p>Degrees:</p>
              <b-form-input
                v-model="rotation"
                style="width: 25%"
                :disabled="!aduExist"
              ></b-form-input>
              <b-button
                style="background-color: #4e0eaf"
                @click="add3DModel"
                :disabled="!aduExist"
                >3D view</b-button
              >
            </div>
          </div>
          <b-button @click="addAduFloorPlan" class="setButton"
            >Set Adu</b-button
          >
        </div>
      </div>
    </b-container>
  </div>
</template>

<script>
import { Threebox } from "threebox-plugin";
import Vue from "vue";
import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue";
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      access_token:
        "pk.eyJ1IjoiZWxnZXJhcmRvIiwiYSI6ImNsOG90NjFtMzFucG0zeWw1YWRheTV5ZmYifQ.87BCgCSXpjLIHkqGsWUW7g",
      map: {},
      coordinates: {
        lng: this.$route.query.lng,
        lat: this.$route.query.lat,
      },
      topoLines: [],
      hoveredStateId: null,
      mouseHover: null,
      popup: null,
      marker: null,
      currentModel: null,
      showMap: false,
      parcelFeatures: null,
      buildingFeatures: null,
      buildingMidPoint: null,
      filterBuildingFeatures: [],
      filterTopoFeatures: [],
      filterAduIntersectsTopo: [],
      parcelId: null,
      aduExist: false,
      showMenu: false,
      firstPolygon: null,
      aduPosition: null,
      aduLineCoordinates: null,
      newPolyCenter: null,
      rotation: 0,
      aduStatePosition: false,
      is3D: null,
      switch3D: true,
      currentParcelId: null,
      elevation: [],
      elevationFilter: 0,
      salliteView: false,
    };
  },
  computed: {
    ...mapGetters({
      items: "locations/items",
      polygons: "polygons/polygons",
    }),
  },
  mounted() {
    this.createMap();
    this.isMapLoaded();
  },
  methods: {
    createMap() {
      this.$mapboxgl.accessToken = this.access_token;
      this.map = new this.$mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/javy3r18/cl9fvwqli000p15qskifof42o",
        zoom: 17,
        pitch: 45, //inclination
        bearing: -17, // rotation
        center: [-117.157268, 32.713888],
        antialias: true,
      });
    },
    isMapLoaded() {
      this.map.on("load", () => {
        this.map.setCenter(this.coordinates);
        this.initTilesets();
        this.initParcelTileset();
        this.getParcelFeatures();
        this.initZoomLevel();

        this.popup = new this.$mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
        });
        this.map.moveLayer("citysandiego", "building-extrusion");
        this.map.moveLayer("parcelLine", "building-extrusion");
        this.map.on("mousemove", "citysandiego", (e) => {
          let content = this.map.queryRenderedFeatures(e.point, {
            layers: ["citysandiego"],
          });
          this.map.getCanvas().style.cursor = "pointer";
          let id = content[0].id;
          if (this.mouseHover != id) {
            this.mouseHover = content[0].id;
            this.showPopup(content);
            if (e.features.length > 0) {
              if (this.hoveredStateId !== null) {
                this.map.setFeatureState(
                  {
                    source: "parcelsTileset",
                    sourceLayer: "citysandiego",
                    id: this.hoveredStateId,
                  },
                  { hover: false }
                );
              }
              this.hoveredStateId = e.features[0].id;
              this.map.setFeatureState(
                {
                  source: "parcelsTileset",
                  sourceLayer: "citysandiego",
                  id: this.hoveredStateId,
                },
                { hover: true }
              );
            }
          }
        });
        this.map.on("click", "citysandiego", (e) => {
          this.coordinates = e.lngLat;
          let content = this.map.queryRenderedFeatures(e.point, {
            layers: ["citysandiego"],
          });
          this.parcelFeatures = content[0];
          if (this.currentParcelId != content[0].id) {
            this.currentParcelId = content[0].id;
            this.findSelectedParcel();
          }
        });
        this.map.on("mouseleave", "citysandiego", () => {
          this.map.getCanvas().style.cursor = "";
          this.popup.remove();
          this.mouseHover = null;
          if (this.hoveredStateId !== null) {
            this.map.setFeatureState(
              {
                source: "parcelsTileset",
                sourceLayer: "citysandiego",
                id: this.hoveredStateId,
              },
              { hover: false }
            );
          }
          this.hoveredStateId = null;
        });
      });
    },
    getParcelFeatures() {
      let point = this.map.project(this.coordinates);
      this.map.once("idle", () => {
        let parcel = this.map.queryRenderedFeatures(point, {
          layers: ["citysandiego"],
        });
        this.parcelFeatures = parcel[0];
        this.currentParcelId = parcel[0].id;
        this.findSelectedParcel();
        this.showMap = true;
      });
    },
    getBuildingFeatures({ parcelCoordinates }) {
      let features = this.map.queryRenderedFeatures({
        layers: ["building-extrusion"],
      });
      let poly = this.$turf.polygon([parcelCoordinates]);
      this.filterBuildingFeatures = [];
      let topoIntersection;
      features.forEach((element) => {
        topoIntersection = this.$turf.booleanIntersects(poly, element);
        if (topoIntersection) {
          this.filterBuildingFeatures.push(element);
        }
      });
      let buildingsArea = [];
      let maxArray = [];
      this.filterBuildingFeatures.forEach((element) => {
        let areaIntersects = this.$turf.intersect(poly, element);
        let area = this.$turf.area(areaIntersects);
        buildingsArea.push({ polygon: areaIntersects, area: area });
        maxArray.push(area);
      });
      let max = Math.max(...maxArray);
      const index = maxArray.indexOf(max);
      this.buildingMidPoint = this.$turf.centroid(buildingsArea[index].polygon);
    },
    getElevationFeatures(parcelCoordinates) {
      this.filterTopoFeatures = [];
      let poly = this.$turf.polygon([parcelCoordinates]);
      let bbox = this.$turf.bbox(poly);
      let sw = [bbox[0], bbox[1]];
      let ne = [bbox[2], bbox[3]];
      let swPoint = this.map.project(sw);
      let nePoint = this.map.project(ne);
      let features = this.map.queryRenderedFeatures([swPoint, nePoint], {
        layers: ["topo2ft"],
      });
      features.forEach((element) => {
        let intersection = this.$turf.booleanIntersects(poly, element);
        if (intersection) {
          this.filterTopoFeatures.push(element);
        }
      });
    },
    findSelectedParcel() {
      let parcelCoordinates = this.parcelFeatures.geometry.coordinates[0];
      if (this.map.getSource("mainAddress")) {
        this.map.removeLayer("parcel");
        this.map.removeSource("mainAddress");
      }
      this.map.addSource("mainAddress", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [parcelCoordinates],
          },
        },
      });
      this.map.addLayer({
        id: "parcel",
        generateId: true,
        source: "mainAddress",
        type: "fill",
        paint: {
          "fill-color": "#4D04AE",
          "fill-outline-color": "rgba(66,100,251, 1)",
        },
        minzoom: 15,
      });
      this.parcelId = this.parcelFeatures.properties.parcel_id;
      this.map.moveLayer("parcel", "building-extrusion");
      let bbox = this.$turf.bbox(this.parcelFeatures);
      this.map.fitBounds(bbox, {
        padding: 120,
      });
      let lngLat = {
        lng: this.coordinates.lng,
        lat: this.coordinates.lat,
      };
      this.map.once("moveend", () => {
        this.getBuildingFeatures({ parcelCoordinates: parcelCoordinates });
        let pitch = this.map.getPitch();
        this.map.setPitch(0);
        this.getElevationFeatures(parcelCoordinates);
        this.map.setPitch(pitch);
      });

      this.getOrientation();
    },
    initTilesets() {
      let sources = {
        // key = Source name, value = layer fill id, layer line id, minzoom, maxzoon
        jurisdictionTileset: [
          "sdcountyjurisdictions",
          "jurisdictionLine",
          10,
          13,
        ],
        chulaVistaTileset: ["chulavistazoning", "chulaVistaLine", 13, 16.5],
        sanDiegoTileset: ["city_sandiego_zoning", "sanDiegoLine", 13, 16.5],
      };
      for (const [key, value] of Object.entries(sources)) {
        this.map.addSource(key, {
          type: "vector",
          url: "mapbox://multitaskr." + value[0],
          generateId: true,
        });
        this.map.addLayer({
          id: value[0],
          generateId: true,
          source: key,
          "source-layer": value[0],
          type: "fill",
          minzoom: value[2],
          maxzoom: value[3],
          paint: {
            "fill-color": "#B591F9",
            "fill-outline-color": "rgba(66,100,251, 1)",
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              1,
              0.5,
            ],
          },
        });
        this.map.addLayer({
          id: value[1],
          "source-layer": value[0],
          type: "line",
          source: key,
          layout: {},
          minzoom: value[2],
          maxzoom: value[3],
          paint: {
            "line-dasharray": [4, 4],
            "line-color": "#4D04AE",
            "line-width": 2,
          },
        });
      }
    },
    initParcelTileset() {
      this.map.addSource("parcelsTileset", {
        type: "vector",
        url: "mapbox://multitaskr.citysandiego",
        generateId: true,
      });
      this.map.addLayer({
        id: "citysandiego",
        generateId: true,
        source: "parcelsTileset",
        "source-layer": "citysandiego",
        type: "fill",
        minzoom: 16.5,
        paint: {
          "fill-color": "#B591F9",
          "fill-outline-color": "rgba(66,100,251, 1)",
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.8,
            0.2,
          ],
        },
      });
      this.map.addLayer({
        id: "parcelLine",
        "source-layer": "citysandiego",
        type: "line",
        source: "parcelsTileset",
        layout: {},
        minzoom: 16.5,
        paint: {
          "line-dasharray": [4, 4],
          "line-color": "#4D04AE",
          "line-width": 2,
        },
      });
    },
    drawSlopeLine() {
      let center = [
        parseFloat(this.newPolyCenter.geometry.coordinates[0]),
        parseFloat(this.newPolyCenter.geometry.coordinates[1]),
      ];
      let coordinates = [
        [
          this.buildingMidPoint.geometry.coordinates[0],
          this.buildingMidPoint.geometry.coordinates[1],
        ],
        center,
      ];
      this.aduLineCoordinates = this.$turf.lineString(coordinates);

      if (this.map.getSource("lineSource")) {
        this.map.removeLayer("lineTo");
        this.map.removeSource("lineSource");
      }
      this.map.addSource("lineSource", {
        type: "geojson",
        data: this.aduLineCoordinates,
      });
      this.map.addLayer({
        id: "lineTo",
        type: "line",
        source: "lineSource",
        layout: {},
        minzoom: 16.5,
        paint: {
          "line-color": "black",
          "line-width": 4,
        },
      });
    },
    addAduFloorPlan() {
      if (this.map.getSource("floor")) {
        this.map.removeLayer("floorLayer");
        this.map.removeSource("floor");
      }
      if (this.map.getLayer("custom_layer"))
        this.map.removeLayer("custom_layer");
      var poly = this.$turf.polygon([
        [
          [-117.04397491402744, 32.54900563224241],
          [-117.04397491402744, 32.5489504192723],
          [-117.04390584476576, 32.5489504192723],
          [-117.04390584476576, 32.54900563224241],
          [-117.04397491402744, 32.54900563224241],
        ],
      ]);
      var center = this.$turf.centroid(poly);
      var from = this.$turf.point([
        center.geometry.coordinates[0],
        center.geometry.coordinates[1],
      ]);
      this.newPolyCenter = this.$turf.point([
        this.coordinates.lng,
        this.coordinates.lat,
      ]);
      var bearing = this.$turf.rhumbBearing(from, this.newPolyCenter);
      var distance = this.$turf.rhumbDistance(from, this.newPolyCenter);
      this.firstPolygon = this.$turf.transformTranslate(
        poly,
        distance,
        bearing
      );
      this.map.addSource("floor", {
        type: "geojson",
        data: this.firstPolygon,
      });
      this.map.addLayer({
        id: "floorLayer",
        type: "fill",
        source: "floor",
        paint: {
          "fill-color": "grey",
        },
        layout: {},
      });
      this.aduExist = true;
      this.showMenu = true;
      this.drawSlopeLine();
      this.verifyAduLineBetween();
      this.initDragInteraction();
      this.verifyAduSpace(this.firstPolygon);
    },
    add3DModel() {
      if (this.switch3D) {
        let r = this.rotation;
        this.switch3D = false;
        this.is3D = true;
        this.map.addLayer({
          id: "custom_layer",
          type: "custom",
          renderingMode: "3d",
          onAdd: (map, gl) => {
            window.tb = new Threebox(map, gl, { defaultLights: true });
            let options = {
              obj: "../model/example.fbx",
              type: "fbx",
              scale: 0.02,
              units: "meters",
              anchor: "center",
              rotation: { x: 90, y: 0, z: 0 }, //default rotation
            };
            tb.loadObj(options, (model) => {
              this.currentModel = model;
              let adu = this.currentModel.setCoords(
                this.newPolyCenter.geometry.coordinates
              );
              tb.add(adu);
              console.log(this.currentModel);
              this.currentModel.setRotation({ x: 0, y: 0, z: -this.rotation });
            });
          },
          render: function (gl, matrix) {
            tb.update();
          },
        });
      } else {
        this.map.removeLayer("custom_layer");
        this.is3D = false;
        this.switch3D = true;
      }
    },
    initDragInteraction() {
      this.map.on("mousedown", "floorLayer", (e) => {
        e.preventDefault();
        this.map.on("mousemove", "parcel", this.moveAduFloorPlan);
        this.map.once("mouseup", () => {
          this.map.off("mousemove", "parcel", this.moveAduFloorPlan);
          this.verifyAduSpace(this.firstPolygon);
        });
      });
      this.map.on("touchstart", "floorLayer", (e) => {
        e.preventDefault();
        this.map.on("touchmove", "parcel", this.moveAduFloorPlan);
        this.map.once("touchend", () => {
          this.map.off("touchmove", "parcel", this.moveAduFloorPlan);
        });
      });
    },
    moveAduFloorPlan(e) {
      var center = this.$turf.centroid(this.firstPolygon);
      var from = this.$turf.point([
        center.geometry.coordinates[0],
        center.geometry.coordinates[1],
      ]);
      this.newPolyCenter = this.$turf.point([e.lngLat.lng, e.lngLat.lat]);
      var bearing = this.$turf.rhumbBearing(from, this.newPolyCenter);
      var distance = this.$turf.rhumbDistance(from, this.newPolyCenter);
      this.firstPolygon = this.$turf.transformTranslate(
        this.firstPolygon,
        distance,
        bearing
      );
      this.map.getSource("floor").setData(this.firstPolygon);
      let rotatePoint = this.firstPolygon.geometry.coordinates[0];
      this.aduPosition = this.firstPolygon;
      if (this.is3D) this.currentModel.setCoords([e.lngLat.lng, e.lngLat.lat]);
    },
    verifyAduSpace(currentPolygon) {
      let poly2 = this.$turf.polygon([currentPolygon.geometry.coordinates[0]]);
      let poly3 = this.$turf.polygon([
        this.parcelFeatures.geometry.coordinates[0],
      ]);
      let difference = this.$turf.difference(poly2, poly3);
      let finishLoop = false;
      this.filterBuildingFeatures.forEach((element) => {
        if (!finishLoop) {
          let intersection = this.$turf.intersect(element, poly2);
          if (intersection != null || difference != null) {
            this.map.setPaintProperty("floorLayer", "fill-color", "red");
            this.aduStatePosition = false;
            finishLoop = true;
            return;
          } else {
            this.map.setPaintProperty("floorLayer", "fill-color", "green");
            this.aduStatePosition = true;
          }
        }
      });
    },
    verifyAduLineBetween() {
      let topoIntersection; //to catch every topo line that is inside the parcel and if intersects with the adu line
      let intersect = []; //catch every topo line that intersects with the adu line
      let pointOnFeatureCollention = [];
      this.filterTopoFeatures.forEach((element) => {
        topoIntersection = this.$turf.lineIntersect(
          element,
          this.aduLineCoordinates
        );

        if (topoIntersection.features.length > 0) {
          intersect.push(topoIntersection);
        }
      });
      if (intersect.length == 1) {
        let nearestPointAdu = this.$turf.nearestPoint(
          this.newPolyCenter,
          intersect[0]
        );
        let point = this.map.project(nearestPointAdu.geometry.coordinates);
        let topoFeatureAduElevation = this.map.queryRenderedFeatures(point, {
          layers: ["topo2ft"],
        });
        this.elevationFilter = 0;
      } else if (intersect.length > 1) {
        intersect.forEach((element) => {
          let lineOnPoint = this.$turf.point(
            element.features[0].geometry.coordinates
          );
          pointOnFeatureCollention.push(lineOnPoint);
        });
        let featureCollection = this.$turf.featureCollection(
          pointOnFeatureCollention
        );
        let nearestPointAdu = this.$turf.nearestPoint(
          this.newPolyCenter,
          featureCollection
        );
        let nearestPointBuilding = this.$turf.nearestPoint(
          this.buildingMidPoint,
          featureCollection
        );
        let point1 = this.map.project(nearestPointAdu.geometry.coordinates);
        let point2 = this.map.project(
          nearestPointBuilding.geometry.coordinates
        );
        let topoFeatureAduElevation = this.map.queryRenderedFeatures(point1, {
          layers: ["topo2ft"],
        });
        let topoFeatureBuildingElevation = this.map.queryRenderedFeatures(
          point2,
          {
            layers: ["topo2ft"],
          }
        );
        let aduNearestELevation =
          topoFeatureAduElevation[0].properties.ELEVATION;
        let buildingNearestELevation =
          topoFeatureBuildingElevation[0].properties.ELEVATION;
        this.elevationFilter = aduNearestELevation - buildingNearestELevation;
      }
    },
    initZoomLevel() {
      this.map.on("zoomend", () => {
        let currentZoom = this.map.getZoom();
        if (!this.marker && currentZoom < 15) {
          this.popup.remove();
          this.marker = new this.$mapboxgl.Marker({
            color: "black",
            draggable: false,
          })
            .setLngLat(this.coordinates)
            .addTo(this.map);
        }
        if (this.marker && currentZoom > 15) {
          this.marker.remove();
          this.marker = null;
        }
      });
    },
    changeStyle() {
      this.salliteView = !this.salliteView;
      if (this.salliteView) {
        this.map.setPaintProperty("mapbox-satellite", "raster-opacity", 1);
      } else {
        this.map.setPaintProperty("mapbox-satellite", "raster-opacity", 0);
      }
    },
    moveToCurrentParcel() {
      this.map.easeTo({
        center: this.coordinates,
        zoom: 19,
        speed: 3,
        duration: 1500,
      });
    },
    showPopup(features) {
      var centroid = this.$turf.centroid(features[0]);
      this.popup
        .setLngLat(centroid.geometry.coordinates)
        .setHTML(features[0].properties.parcel_id)
        .addTo(this.map);
    },
    getOrientation() {
      //get parcel polygon
      let parcelPolygon = this.$turf.polygon([
        this.parcelFeatures.geometry.coordinates[0],
      ]);

      //get the center from parcel
      let centerFeature = this.$turf.center(parcelPolygon);

      //store object with center coordinates from centerFeature
      let centerBound = {
        lng: centerFeature.geometry.coordinates[0],
        lat: centerFeature.geometry.coordinates[1],
      };

      //create parcel bbox
      let bbox = this.$turf.bbox(parcelPolygon);

      //create polygon bbox
      let bboxPolygon = this.$turf.bboxPolygon(bbox);

      //get centroid from parcel polygon
      //let parcelCentroid = this.$turf.centroid(parcelPolygon);

      //get centroid from bbox polygon
      //let bboxCentroid = this.$turf.centroid(bboxPolygon);

      //scale bbox polygon
      let scaledBbox = this.$turf.transformScale(bboxPolygon, 1.05, {
        options: "meters",
      });

      //those conditionals are used in case the user do click to another parcel
      //if the layer exist, remove the layer to create the new layer and don't repeat it on the map
      //same process to the source
      if (this.map.getLayer("bbox-layer")) this.map.removeLayer("bbox-layer");
      if (this.map.getSource("bbox-source"))
        this.map.removeSource("bbox-source");

      //create source
      this.map.addSource(`bbox-source`, {
        type: "geojson",
        data: scaledBbox,
      });

      //create layer
      this.map.addLayer({
        id: `bbox-layer`,
        type: "fill",
        source: `bbox-source`,
        paint: {
          "fill-color": "rgb(125, 116, 116)",
          "fill-opacity": 0,
        },
      });

      //store the bbox geometry
      let geometry = bboxPolygon.geometry.coordinates[0];

      //get midpoints of each vertex

      //the higherDistance is setted with 0
      //to later compared with the first distance
      let higherDistance = 0;
      
      let center = 0;
      let dataDistances = [];

      //this 'for' will get the midpoints of the borders
      for (let index = 0; index < geometry.length; index++) {

        //if the next is undefined take center of current and first
        if (geometry[index + 1] !== undefined) {
          
          //center of current and next
          let features = this.$turf.points([
            geometry[index],
            geometry[index + 1],
          ]);

          //store the midpoint of the current line
          center = this.$turf.center(features);

          //
          let lineString = this.$turf.lineString([
            [centerBound.lng, centerBound.lat],
            center.geometry.coordinates,
          ]);

          let scaledLineString = this.$turf.transformScale(lineString, 1.05);

          //store the midpoint from the current line
          let from = center.geometry.coordinates; //lng, lat

          //store the center from the parcel
          let to = [centerBound.lng, centerBound.lat]; //lng, lat

          //store the distance between the midpoint current line and center parcel
          let distance = this.$turf.distance(to, from, {
            units: "meters",
          });

          //store distance like floatDistance
          let floatDistance = distance;

          //store distance parsed like integerDistance
          let integerDistance = parseInt(distance);

          //evaluate if the integer distance is the higher or equal
          //if does, do a push of an object 
          if (integerDistance >= higherDistance) {
            higherDistance = integerDistance;
            dataDistances.push({
              //center of the current line
              midpoints: scaledLineString.geometry.coordinates[1],
              //current higher distance
              higherDistance: higherDistance,
              //higher distance but float
              floatDistance: floatDistance,
              //line geometry, between the vertex of the parcel
              line: [geometry[index], geometry[index + 1]],
            });
          }

          //create line that cross between parcel midpoints
          if (this.map.getLayer(`line-layer-${index}`))
            this.map.removeLayer(`line-layer-${index}`);
          if (this.map.getSource(`line-source-${index}`))
            this.map.removeSource(`line-source-${index}`);

          this.map.addSource(`line-source-${index}`, {
            type: "geojson",
            data: scaledLineString,
          });

          this.map.addLayer({
            id: `line-layer-${index}`,
            type: "line",
            source: `line-source-${index}`,
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#888",
              "line-opacity": 0,//to see the line, change the opacity
              "line-width": 8,
            },
          });
        }
      }

      //create a variable that will store the maximum distance 
      let maximumDistance;

      //store the maximun higher distance
      //from the center to the midpoint
      maximumDistance = Math.max.apply(
        Math,
        dataDistances.map((item) => item.higherDistance)
      );

      let marker;
      let color = "blue";

      //foreach that evaluate if one of the items has the 
      //maximun distance
      dataDistances.forEach((item) => {

        //evaluate if the current item has the integer maximun distance
        if (item.higherDistance == maximumDistance) {

          //if does, create the marker
          marker = new this.$mapboxgl.Marker({
            color: color,
            draggable: true,
          })
            .setLngLat(item.midpoints)
            .addTo(this.map);

          //with the marker, take the features
          let features = this.map.queryRenderedFeatures(marker._pos, {});

          color = "red";

          //if there is not features, that means the current item is the front line
          if (features.length == 0) {

            //create the line that shows the front line
            let lineString = this.$turf.lineString(item.line);

            //if exist, droped to later create the new line
            if (this.map.getLayer("line-layer-front"))
              this.map.removeLayer("line-layer-front");
            if (this.map.getSource("line-source-front"))
              this.map.removeSource("line-source-front");

            this.map.addSource(`line-source-front`, {
              type: "geojson",
              data: lineString,
            });

            this.map.addLayer({
              id: `line-layer-front`,
              type: "line",
              source: `line-source-front`,
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "green",
                "line-width": 5,
              },
            });
          }
          marker.remove();
        }
      });
    },
  },
  watch: {
    coordinates: {
      deep: true,
      handler(value, old) {
        this.$router.push({
        query: value,
      });
      },
    },
    aduPosition: function (value) {
      this.verifyAduSpace(this.firstPolygon);
    },
    newPolyCenter: function (value) {
      let center = [
        parseFloat(value.geometry.coordinates[0]),
        parseFloat(value.geometry.coordinates[1]),
      ];
      let coordinates = [
        [
          this.buildingMidPoint.geometry.coordinates[0],
          this.buildingMidPoint.geometry.coordinates[1],
        ],
        center,
      ];

      this.aduLineCoordinates = this.$turf.lineString(coordinates);
      this.map.getSource("lineSource").setData(this.aduLineCoordinates);
      this.verifyAduLineBetween();
    },
    rotation: function (value) {
      let degrees = +value;
      var center = this.$turf.centroid(this.firstPolygon);
      var options = {
        pivot: [center.geometry.coordinates[0], center.geometry.coordinates[1]],
      };
      let rotatedPoly = this.$turf.transformRotate(
        this.firstPolygon,
        degrees,
        options
      );
      this.map.getSource("floor").setData(rotatedPoly);
      if (this.is3D) this.currentModel.setRotation({ x: 0, y: 0, z: -degrees });
      this.verifyAduSpace(rotatedPoly);
    },
    search: {
      deep: true,
      handler(value, old) {
        this.onAddressChange();
      },
    },
  },
};
</script>

<style>
#map {
  width: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
}

.navigation {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 10px;
  right: 10px;
  top: 10px;
}

.bottomBarContainer {
  z-index: 10;
  position: absolute;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  bottom: 0;
}

.menu {
  background-color: white;
}

.menuButton {
  border-radius: 0;
}

.aduSettings {
  margin: 10px;
}

.elementRow {
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}

.setButton {
  background-color: green;
  border-radius: 0;
  width: 100%;
}
</style>
