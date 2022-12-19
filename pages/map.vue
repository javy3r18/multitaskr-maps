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
      <b-alert v-if="aduStatePosition" variant="success" show>ADU Feasibility approved</b-alert>
      <b-alert v-if="!aduStatePosition" variant="danger" show>Can't build the ADU. Feasibility problem</b-alert>
    </div>

    <div class="navigation">
      <b-button @click="currentParcel"><b-icon icon="cursor-fill"></b-icon></b-button>
      <b-button @click="map.zoomIn()">+</b-button>
      <b-button @click="map.zoomOut()">-</b-button>
    </div>

    <div class="bottomBarContainer">
          <b-button @click="showMenu = !showMenu" class="menuButton">Menu</b-button>
  
          <div v-if="showMenu" class="menu">
                  <div class="aduSettings">
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
                  <b-button @click="addFloor" class="setButton">Set Adu</b-button>
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
  import { debounce } from "lodash";
  export default {
    data() {
      return {
        access_token:
          "pk.eyJ1IjoiZWxnZXJhcmRvIiwiYSI6ImNsOG90NjFtMzFucG0zeWw1YWRheTV5ZmYifQ.87BCgCSXpjLIHkqGsWUW7g",
        map: {},
        search: {},
        inputs: {
          address: null,
        },
        coordinates: {
          lng: this.$route.query.lng,
          lat: this.$route.query.lat,
        },
        params: null,
        geojsonArrays: [],
        hoveredStateId: null,
        mouseHover: null,
        popup: null,
        marker: null,
        currentModel: null,
        showMap: false,
        parcelFeatures: null,
        buildingFeatures: null,
        filterBuildingFeatures: [],
        parcelId: null,
        aduExist: false,
        showMenu: false,
        firstPolygon: null,
        aduPosition: null,
        newPolyCenter: null,
        rotation: 0,
        aduStatePosition: false,
        is3D: null,
        switch3D: true,
        currentParcelId: null,
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
      this.setAutoFill();
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
              // this.params = e.lngLat;
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
              this.selectedParcel();
            }
          });
          this.map.on("mouseleave", "citysandiego", () => {
            this.params = null;
            this.map.getCanvas().style.cursor = "";
            this.popup.remove(); // TODO: esta madre me quitar el popup cuando aun no se a generado. Arreglar!!!
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
      setAutoFill() {
        this.search = this.$search.autofill({
          accessToken: this.access_token,
          options: { country: "us" },
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
          this.selectedParcel();
          this.showMap = true;
        });
      },
      getBuildingFeatures(parcelCoordinates) {
        let features = this.map.queryRenderedFeatures({
          layers: ["building-extrusion"],
        });
        let poly = this.$turf.polygon([parcelCoordinates]);
        this.filterBuildingFeatures = [];
        let buildingCoordinates = null;
        features.forEach((element) => {
          if (element.geometry.coordinates.length > 1) {
            //Se hace si el feature regresa un multipolygon
            element.geometry.coordinates.forEach((subelement) => {
              buildingCoordinates = subelement;
              let poly2 = this.$turf.polygon([buildingCoordinates[0]]); //Se guarda cada uno de los polygonos dentro del multipolygon
              let intersection = this.$turf.intersect(poly, poly2);
              if (intersection) {
                this.filterBuildingFeatures.push(
                  intersection.geometry.coordinates
                );
              }
            });
          } else {
            buildingCoordinates = element.geometry.coordinates;
            let poly2 = this.$turf.polygon([buildingCoordinates[0]]);
            let intersection = this.$turf.intersect(poly, poly2);
            if (intersection && intersection.geometry.coordinates.length > 1) {
              //Se hace si el intersection regresa un multipolygon
              intersection.geometry.coordinates.forEach((element) => {
                this.filterBuildingFeatures.push(element);
              });
            } else if (intersection) {
              this.filterBuildingFeatures.push(intersection.geometry.coordinates);
            }
          }
        });
        console.log(this.filterBuildingFeatures);
      },
      selectedParcel() {
        let pitch = this.map.getPitch();
        this.map.setPitch(pitch - 1);
        let parcelCoordinates = this.parcelFeatures.geometry.coordinates[0];
        if (this.map.getSource("mainAddress")) {
          this.map.removeLayer("polygon");
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
          id: "polygon",
          generateId: true,
          source: "mainAddress",
          type: "fill",
          paint: {
            "fill-color": "#4D04AE",
            "fill-outline-color": "rgba(66,100,251, 1)",
          },
        });
        this.parcelId = this.parcelFeatures.properties.parcel_id;
        this.map.moveLayer("polygon", "building-extrusion");
        let poly = this.$turf.polygon([parcelCoordinates]);
        let bbox = this.$turf.bbox(poly);
        let area = this.$turf.area(poly);
        console.log(area);
        this.map.fitBounds(bbox, {
          padding: 120,
        });
        let lngLat = {
          lng: this.coordinates.lng,
          lat: this.coordinates.lat,
        };
        let elevation = this.map.queryTerrainElevation(lngLat, {
          exaggerated: false,
        });
        console.log(elevation);
        this.map.once("moveend", () => {
          this.getBuildingFeatures(parcelCoordinates);
        });
      },
      onAddressChange() {
        this.search.addEventListener("retrieve", (event) => {
          this.coordinates.lat = event.detail.features[0].geometry.coordinates[1];
          this.coordinates.lng = event.detail.features[0].geometry.coordinates[0];
          this.getParcelFeatures;
          this.selectedParcel(); // cambiar esta opcion a recargar la pagina con nuevas coordenadas
        });
      },
      initTilesets() {
        let Sources = {
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
        for (const [key, value] of Object.entries(Sources)) {
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
      addFloor() {
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
        this.movement();
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
      movement() {
        this.map.on("mousedown", "floorLayer", (e) => {
          e.preventDefault();
          this.map.on("mousemove", "polygon", this.move);
          this.map.once("mouseup", () => {
            this.map.off("mousemove", "polygon", this.move);
            this.verifyAduSpace(this.firstPolygon);
          });
        });
        this.map.on("touchstart", "floorLayer", (e) => {
          e.preventDefault();
          this.map.on("touchmove", "polygon", this.move);
          this.map.once("touchend", () => {
            this.map.off("touchmove", "polygon", this.move);
          });
        });
      },
      move(e) {
        console.log(e);
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
        this.aduPosition = this.firstPolygon;
        if (this.is3D) this.currentModel.setCoords([e.lngLat.lng, e.lngLat.lat]);
      },
      moveFloor() {
        let stop = true;
        this.map.on("mousemove", "polygon", (e) => {
          if (stop) {
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
            if (this.is3D)
              this.currentModel.setCoords([e.lngLat.lng, e.lngLat.lat]);
          }
        });
        this.map.once("click", () => {
          stop = false;
          this.verifyAduSpace(this.firstPolygon);
        });
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
            let poly = this.$turf.polygon([element[0]]);
            let intersection = this.$turf.intersect(poly, poly2);
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
      currentParcel() {
        this.map.easeTo({
          center: this.coordinates,
          zoom: 19,
          speed: 3,
          duration: 1500,
        });
      },
      showPopup(features) {
        let coordinates = features[0].geometry.coordinates[0];
        let turfPolygon = this.$turf.polygon([coordinates]);
        var centroid = this.$turf.centroid(turfPolygon);
        this.popup
          .setLngLat(centroid.geometry.coordinates)
          .setHTML(features[0].properties.parcel_id)
          .addTo(this.map);
      },
    },
    watch: {
      coordinates: {
        deep: true,
        handler(value, old) {
          // this.getAddress();
        },
      },
      aduPosition: function (value) {
        this.verifyAduSpace(this.firstPolygon);
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
      params: debounce(async function (value) {
        if (this.params) {
          await this.$store.dispatch("polygons/get", this.params);
          try {
            let geojson = JSON.parse(this.polygons.geojson);
            let parseJson = geojson.coordinates[0];
            this.geojsonArrays = [];
            parseJson.forEach((item) => {
              let itemArray = [item[1], item[0]];
              this.geojsonArrays.push(itemArray);
            });
            const bounds = new this.$mapboxgl.LngLatBounds(
              this.geojsonArrays[0],
              this.geojsonArrays[0]
            );
            for (const coord of this.geojsonArrays) {
              bounds.extend(coord);
            }
            let center = bounds;
            this.popup
              .setLngLat(center.getCenter())
              .setHTML("Example Address")
              .addTo(this.map);
          } catch (error) {
            console.log(error);
          }
        }
      }, 500),
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

  .navigation{
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 10px;
    right: 10px;
    top: 10px;
  }
  .bottomBarContainer{
      z-index: 10;
      position: absolute;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      bottom: 0;
  }
  .menu{
      background-color: white;
  }
  .menuButton{
    border-radius: 0;
  }
  .aduSettings{
    margin: 10px;
  }
  .elementRow{
    width: 100%;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }
  .setButton{
    background-color: green;
    border-radius: 0;
    width: 100%;
  }
  </style>