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
        <b-col cols="12">
          <div>
            <b-navbar toggleable="lg" type="dark">
              <div>
                <a href="/">
                  <img
                    src="https://gomultitaskr.com/wp-content/uploads/brizy/imgs/multitaskr-logo-png-202x30x0x0x202x30x1664907017.png"
                    href="/"
                  />
                </a>
              </div>
              <b-navbar-nav class="ml-auto">
                <b-nav-form>
                  <b-form-input
                    class="input-class"
                    name="address"
                    placeholder="Enter a California location"
                    autocomplete="shipping address-line1"
                  ></b-form-input>
                </b-nav-form>
              </b-navbar-nav>
              <b-navbar-nav class="ml-auto">
                <b-button style="background-color: #4e0eaf">Login</b-button>
              </b-navbar-nav>
            </b-navbar>
          </div>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="3">
          <div class="m-3">
            <hr />
            <div>
              <b-card-text class="text-address">{{
                inputs.address
              }}</b-card-text>
            </div>
            <hr />
            <b-tabs content-class="mt-3">
              <b-tab title="Details" active>
                <div class="details">
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
              <b-tab title="Projects"><p>I'm the second tab</p></b-tab>
              <b-tab title="Documents"><p>I'm a disabled tab!</p></b-tab>
            </b-tabs>
            <hr />
            <div class="collapsable-text">
              <b-container v-b-toggle.collapse-1>
                <b-button @click="setAdu">Set ADU</b-button>
              </b-container>
              <hr />
              <b-container v-b-toggle.collapse-1>
                <span>Assesed Values</span>
                <b-icon id="toggleicon" icon="chevron-down"></b-icon>
              </b-container>
              <hr />
              <b-container v-b-toggle.collapse-1>
                <span>Property details</span>
                <b-icon id="toggleicon" icon="chevron-down"></b-icon>
              </b-container>
              <hr />
              <b-container v-b-toggle.collapse-1>
                <span>Environmental Hazards & Concerns</span>
                <b-icon id="toggleicon" icon="chevron-down"></b-icon>
              </b-container>
              <hr />
              <b-container v-b-toggle.collapse-1>
                <span>Zoning & General Plan</span>
                <b-icon id="toggleicon" icon="chevron-down"></b-icon>
              </b-container>
            </div>
            <hr />
          </div>
        </b-col>
        <b-col cols="9">
          <div id="map"></div>
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
      boundsZoom: null,
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
    this.initMarker();
  },

  created(){
    let body = document.getElementsByTagName("body")[0];
    body.style.overflow = "hidden";
  },

  methods: {
    createMap() {
      this.$mapboxgl.accessToken = this.access_token;
      this.map = new this.$mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/javy3r18/cl9fvwqli000p15qskifof42o",
        zoom: 19,
        pitch: 45, //inclination
        bearing: -17, // rotation
        center: [-117.157268, 32.713888],
        antialias: true,
      });
    },

    isMapLoaded() {
      this.map.on("load", () => {
        this.getSelectedAddress();
        this.initJurisdictionTileset();
        this.initChulaVistaTileset();
        this.initSanDiegoTileset();
        this.initParcelTileset();
        this.add3DModel();
        this.getParcelId();
        // this.initWheel();

        this.popup = new this.$mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
        });
        this.map.moveLayer("citysandiego", "building-extrusion");
        this.map.moveLayer("parcelLine", "building-extrusion");

        this.map.on("mousemove", "citysandiego", (e) => {
          this.map.getCanvas().style.cursor = "pointer";

          let content = this.map.queryRenderedFeatures(e.point, {
            layers: ["citysandiego"],
          });
          let id = content[0].id;
          if (this.mouseHover != id) {
            this.mouseHover = content[0].id;
            this.params = e.lngLat;
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
          this.getSelectedAddress();
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

    locationCenter() {
      this.map.easeTo({
        center: this.coordinates,
        zoom: 15,
        speed: 3,
        duration: 2500,
        curve: 2,
      });
    },

    getParcelId() {
      let init = true;

      this.map.once("idle", () => {
        let content = this.map.queryRenderedFeatures(this.marker._pos, {
          layers: ["citysandiego"],
        });
        console.log(content);
        init = false;
        this.showMap = true;
        let body = document.getElementsByTagName("body")[0];
        body.style.overflow = "visible";
      });
    },

    async getSelectedAddress() {
      if (this.map.getSource("mainAddress")) {
        this.map.removeLayer("polygon");
        this.map.removeSource("mainAddress");
      }
      let params = {
        lat: this.coordinates.lat,
        lng: this.coordinates.lng,
      };

      await this.$store.dispatch("polygons/get", params);
      let geojson = JSON.parse(this.polygons.geojson);

      let parseJson = geojson.coordinates[0];
      this.geojsonArrays = [];
      parseJson.forEach((item) => {
        let itemArray = [item[1], item[0]];
        this.geojsonArrays.push(itemArray);
      });

      this.map.addSource("mainAddress", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [this.geojsonArrays],
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

      this.map.moveLayer("polygon", "building-extrusion");

      const bounds = new this.$mapboxgl.LngLatBounds(
        this.geojsonArrays[0],
        this.geojsonArrays[0]
      );
      for (const coord of this.geojsonArrays) {
        bounds.extend(coord);
      }

      this.boundsZoom = bounds;

      this.map.fitBounds(bounds, {
        padding: 20,
        zoom: 20,
      });
    },

    onAddressChange() {
      this.search.addEventListener("retrieve", (event) => {
        console.log(event);
        this.coordinates.lat = event.detail.features[0].geometry.coordinates[1];
        this.coordinates.lng = event.detail.features[0].geometry.coordinates[0];
        this.getSelectedAddress();
      });
    },

    initJurisdictionTileset() {
      this.map.addSource("jurisdictionTileset", {
        type: "vector",
        url: "mapbox://multitaskr.sdcountyjurisdictions",
        generateId: true,
      });

      this.map.addLayer({
        id: "sdcountyjurisdictions",
        generateId: true,
        source: "jurisdictionTileset",
        "source-layer": "sdcountyjurisdictions",
        type: "fill",
        minzoom: 10,
        maxzoom: 12,
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
        id: "jurisdictionLine",
        "source-layer": "sdcountyjurisdictions",
        type: "line",
        source: "jurisdictionTileset",
        layout: {},
        minzoom: 10,
        maxzoom: 12,
        paint: {
          "line-dasharray": [4, 4],
          "line-color": "#4D04AE",
          "line-width": 2,
        },
      });
    },

    initChulaVistaTileset() {
      this.map.addSource("chulaVistaTileset", {
        type: "vector",
        url: "mapbox://multitaskr.chulavistazoning",
        generateId: true,
      });

      this.map.addLayer({
        id: "chulavistazoning",
        generateId: true,
        source: "chulaVistaTileset",
        "source-layer": "chulavistazoning",
        type: "fill",
        minzoom: 12.5,
        maxzoom: 14,
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
        id: "ChilaVistaLine",
        "source-layer": "chulavistazoning",
        type: "line",
        source: "chulaVistaTileset",
        layout: {},
        minzoom: 12.5,
        maxzoom: 14,
        paint: {
          "line-dasharray": [4, 4],
          "line-color": "#4D04AE",
          "line-width": 2,
        },
      });
    },

    initSanDiegoTileset() {
      this.map.addSource("SanDiegoTileset", {
        type: "vector",
        url: "mapbox://multitaskr.city_sandiego_zoning",
        generateId: true,
      });

      this.map.addLayer({
        id: "city_sandiego_zoning",
        generateId: true,
        source: "SanDiegoTileset",
        "source-layer": "city_sandiego_zoning",
        type: "fill",
        minzoom: 12.5,
        maxzoom: 14,
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
        id: "SanDiegoLine",
        "source-layer": "city_sandiego_zoning",
        type: "line",
        source: "SanDiegoTileset",
        layout: {},
        minzoom: 12.5,
        maxzoom: 14,
        paint: {
          "line-dasharray": [4, 4],
          "line-color": "#4D04AE",
          "line-width": 2,
        },
      });
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
        minzoom: 15,
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
        id: "parcelLine",
        "source-layer": "citysandiego",
        type: "line",
        source: "parcelsTileset",
        layout: {},
        minzoom: 15,
        paint: {
          "line-dasharray": [4, 4],
          "line-color": "#4D04AE",
          "line-width": 2,
        },
      });
    },

    add3DModel() {
      let coord = this.coordinates;
      this.map.addLayer({
        id: "custom_layer",
        type: "custom",
        renderingMode: "3d",
        onAdd: (map, gl) => {
          window.tb = new Threebox(map, gl, {
            defaultLights: true,
            enableSelectingObjects: true,
            enableDraggingObjects: true,
            enableRotatingObjects: true,
            enableTooltips: true,
          });
          let options = {
            obj: "./model/example.fbx",
            type: "fbx",
            scale: 0.03,
            units: "meters",
            rotation: { x: 90, y: 0, z: 0 }, //default rotation
          };
          tb.loadObj(options, (model) => {
            this.currentModel = model;
            console.log(model);
            let adu = this.currentModel.setCoords([coord.lng, coord.lat]);
            tb.add(adu);
          });
        },
        render: function (gl, matrix) {
          tb.update();
        },
      });
    },

    setAdu() {
      let a = true;
      this.map.on("mousemove", "polygon", (e) => {
        if (a) {
          this.currentModel.setCoords([e.lngLat.lng, e.lngLat.lat]);
        }
      });

      this.map.on("click", () => {
        a = false;
      });
    },

    initMarker() {
      this.marker = new this.$mapboxgl.Marker({
        color: "black",
        draggable: false,
      })
        .setLngLat(this.coordinates)
        .addTo(this.map);
    },

    // initWheel() {
    //   this.map.on("wheel", () => {
    //     let currentZoom = this.map.getZoom();
    //     if (!this.marker && currentZoom < 12.5) {
    //       this.marker = new this.$mapboxgl.Marker({
    //         color: "black",
    //         draggable: false,
    //       })
    //         .setLngLat(this.coordinates)
    //         .addTo(this.map);
    //         console.log(this.marker);
    //     }

    //     if (this.marker && currentZoom > 12.5) {
    //       this.marker.remove();
    //       this.marker = null;
    //     }
    //   });
    // },

    async getAddress() {
      let params = {
        lat: this.coordinates.lat,
        lng: this.coordinates.lng,
      };
      await this.$store.dispatch("locations/get", params);
      this.inputs.address = this.items.features[0].place_name;
    },
  },

  watch: {
    coordinates: {
      deep: true,
      handler(value, old) {
        this.getAddress();
      },
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
  height: 100vh;
}
.multitaskr {
  background-color: #4e0eaf;
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
.mapboxgl-popup {
  max-width: 400px;
  font: 15px/20px "Helvetica Neue", Arial, Helvetica, sans-serif;
}
</style>
