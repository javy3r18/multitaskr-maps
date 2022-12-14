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
      <b-row>
        <b-col class="sideBar" cols="2">
          <div>
            <b-tabs content-class="mt-3">
              <b-tab class="details" title="Details" active>
                <div>
                  <b-row>
                    <b-col cols="6">
                      <p>
                        CITY<br />
                        <span id="underline">{{}}</span>
                      </p>
                      <p>
                        STATE<br />
                        <span id="underline">{{}}</span>
                      </p>
                      <p>
                        PARCEL ID<br />
                        <span id="underline">{{ parcelId }}</span>
                      </p>
                      <p>
                        <b-icon
                          id="infoicon"
                          icon="info-circle"
                          font-scale="0.8"
                        ></b-icon>
                        LOT AREA<br />
                        <span>0.82</span>
                      </p>
                      <p>
                        <b-icon
                          id="infoicon"
                          icon="info-circle"
                          font-scale="0.8"
                        ></b-icon>
                        YEAR BUILT<br />
                        <span>2000</span>
                      </p>
                    </b-col>
                    <b-col cols="6">
                      <p>
                        COUNTY<br />
                        <span id="underline">{{}}</span>
                      </p>
                      <p>
                        ZIP CODE<br />
                        <span>{{}}</span>
                      </p>
                      <p>
                        <b-icon
                          id="infoicon"
                          icon="info-circle"
                          font-scale="0.8"
                        ></b-icon>

                        PROPERTY ID<br />
                        <span>{{}}</span>
                      </p>
                    </b-col>
                  </b-row>
                </div>
              </b-tab>
              <b-tab class="details" title="ADU">
                <b-button @click="addFloor" variant="secondary"
                  >Set adu</b-button
                >
                <div v-if="aduExist">
                  <p>Rotation:</p>
                  <b-form-input
                    id="range"
                    v-model="rotation"
                    type="range"
                    min="0"
                    max="360"
                  ></b-form-input>
                  <p>Degrees:</p>
                  <b-form-input
                    v-model="rotation"
                    style="width: 25%"
                  ></b-form-input>
                  <b-button
                    style="background-color: #4e0eaf"
                    v-if="aduExist"
                    @click="add3DModel"
                    >3D view</b-button
                  >
                </div>
              </b-tab>
              <b-tab title="Disabled" disabled
                ><p>I'm a disabled tab!</p></b-tab
              >
            </b-tabs>
          </div>
        </b-col>
        <b-col>
          <div id="map"></div>
          <div v-if="aduExist">
            <b-alert
              v-if="aduStatePosition"
              class="alert"
              show
              variant="success"
              >ADU Feasibility approved</b-alert
            >
            <b-alert
              v-if="!aduStatePosition"
              class="alert"
              show
              variant="danger"
              >Can't build the ADU here. Feasibility problem.</b-alert
            >
          </div>
          <div class="BoundIcon">
            <div
              title="Reset parcel view"
              @click="currentParcel"
              id="toggleicon"
              class="location-icon"
            >
              <b-icon icon="cursor"></b-icon>
            </div>
          </div>
          <div class="PlusMinusIcons">
            <b-button-group vertical>
              <b-button @click="setZoomIn" style="background-color: #4d04ae"
                >+</b-button
              >
              <b-button @click="setZoomOut" variant="secondary">-</b-button>
            </b-button-group>
          </div>

          <div class="barContainer">
            <div class="setButton">
              <b-button @click="addFloor" variant="secondary">Set adu</b-button>
            </div>

            <div v-if="aduExist" class="bottomBar">
              <div v-if="showMenu">
                <div class="elementRow">
                  <h2>ADU Settings</h2>
                  <b-button class="closeButton" @click="showMenu = false"
                    >x</b-button
                  >
                </div>
                <p>Rotation:</p>
                <b-form-input
                  id="range"
                  v-model="rotation"
                  type="range"
                  min="0"
                  max="360"
                ></b-form-input>
                <div class="elementRow">
                  <p>Degrees:</p>
                  <b-form-input
                    v-model="rotation"
                    style="width: 25%"
                  ></b-form-input>
                  <b-button
                    style="background-color: #4e0eaf"
                    v-if="aduExist"
                    @click="add3DModel"
                    >3D view</b-button
                  >
                </div>
              </div>
            </div>
          </div>
        </b-col>
      </b-row>
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
      // this.aduRotation();
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
              obj: "./model/example.fbx",
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

    // aduRotation() {
    //   console.log(this.firstPolygon);
    //   let center = this.firstPolygon.geometry.coordinates[0]
    //   const geojson = {
    //     type: "FeatureCollection",
    //     features: [
    //       {
    //         type: "Feature",
    //         geometry: {
    //           type: "Point",
    //           coordinates: center[0],
    //         },
    //       },
    //     ],
    //   };

    //   this.map.addSource("point", {
    //     type: "geojson",
    //     data: geojson,
    //   });

    //   this.map.addLayer({
    //     id: "point",
    //     type: "circle",
    //     source: "point",
    //     paint: {
    //       "circle-radius": 10,
    //       "circle-color": "orange", 
    //     },
    //   });

    //   this.map.on('mousedown', 'point', (e)=>{
    //     e.preventDefault()
    //     this.map.on('mousemove', this.rotate)
    //     this.map.once('mouseup', ()=>{
    //       this.map.off('mousemove', this.rotate)
    //     })
    //   })
    // },

    // rotate(e){
    //   let x = e.originalEvent.layerX
    //   let y = e.originalEvent.layerY
    //   let angle = Math.atan2(y, x) * 180 / Math.PI;
    //   console.log(angle);
    // },

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
          this.map.off("touchmove", this.move);
        });
      });
    },

    move(e) {
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
      let rotatePoint = this.firstPolygon.geometry.coordinates[0]
      // this.map.getSource('point').setData({
      //   type: "FeatureCollection",
      //   features: [
      //     {
      //       type: "Feature",
      //       geometry: {
      //         type: "Point",
      //         coordinates: rotatePoint[0],
      //       },
      //     },
      //   ],
      // })
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
      this.map.on("zoom", () => {
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

    async getAddress() {
      let params = {
        lat: this.coordinates.lat,
        lng: this.coordinates.lng,
      };
      await this.$store.dispatch("locations/get", params);
      this.inputs.address = this.items.features[0].place_name;
    },

    currentParcel() {
      this.map.easeTo({
        center: this.coordinates,
        zoom: 19,
        speed: 3,
        duration: 1500,
      });
    },

    setZoomIn() {
      this.map.zoomIn();
    },

    setZoomOut() {
      this.map.zoomOut();
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
body {
  overflow-x: hidden;
}

#map {
  width: 100%;
  height: 100vh;
}

.sideBar {
  display: block;
}

.details{
  margin-inline: 20px;
}

.alert {
  position: absolute;
  top: 10px;
}

.barContainer {
  display: none;
}

.setButton {
  position: absolute;
  bottom: 10px;
}

.bottomBar {
  z-index: 10;
  border-top: 1px solid gray;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  background-color: white;
  bottom: 0;
}

.bottomBar div {
  margin-top: 10px;
  margin-inline: 40px;
}

.elementRow {
  display: flex;
  justify-content: space-between;
  justify-items: center;
}

.closeButton {
  background-color: rgba(0, 0, 0, 0);
  border: none;
  color: black;
  font-size: large;
}

.text-address {
  font-weight: bold;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 16px;
}
.input-class {
  height: 30px;
  font-size: 14px;
  background-image: url(https://cdn2.hubspot.net/hubfs/4004166/bioticresearch_website_assets/images/search_icon.png);
  background-repeat: no-repeat;
  background-position: left center;
  padding-left: 40px;
  background-color: #fff;
  border: 1px solid #4e0eaf;
  box-shadow: none;
  -webkit-appearance: none;
}
.toggleTitle {
  font-size: 15px;
  font-weight: bold;
}
.details {
  color: #575758;
  font-size: 15px;
}
.details span {
  color: #67676b;
}
.collapsable-text {
  font-weight: bold;
  font-family: Arial, Helvetica, sans-serif;
}
#underline {
  color: #4e0eaf;
  text-decoration: underline;
}
#toggleicon {
  display: inline-block;
  float: right;
}
#infoicon {
  display: inline-block;
  position: relative;
  cursor: pointer;
}
#infoicon:hover {
  color: #4e0eaf;
}
.PlusMinusIcons {
  position: absolute;
  right: 0;
  top: 80px;
  right: 30px;
}
.BoundIcon {
  position: absolute;
  right: 0;
  top: 20px;
  right: 30px;
  cursor: pointer;
  display: flex;
  flex-direction: initial;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border: 1px solid #d7dbdd;
  font-size: 20px;
  width: 40px;
  height: 40px;
  border-radius: 100%;
}
.location-icon {
  display: flex;
  justify-content: center;
}
.mapboxgl-popup {
  max-width: 400px;
  font: 15px/20px "Helvetica Neue", Arial, Helvetica, sans-serif;
}

@media only screen and (max-width: 960px) {
  .sideBar {
    display: none;
  }

  .barContainer {
    display: block;
    width: 100%;
    display: flex;
    justify-content: center;
  }
}
</style>
