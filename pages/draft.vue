<template>
    <b-container fluid class="py-3">
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
                      v-model="form.address"
                    ></b-form-input>
                  </b-nav-form>
                </form>
              </b-navbar-nav>
              <b-navbar-nav class="ml-auto">
                <b-button style="background-color: #4e0eaf">Login</b-button>
              </b-navbar-nav>
            </b-navbar>
          </div>
        </b-col>
      </b-row>
      <hr />
     
      <b-row>
        <b-col cols="4" class="py-2">
          <b-row>
            <b-col>
              <div class="py-2">
                <b-card>
                  <h4>{{ form.address }}</h4>
                </b-card>
              </div>
              <div>
                <b-card>
                  <b-tabs content-class="mt-3">
                    <b-tab title="Details" active>
                      <div class="details">
                        <b-row>
                          <b-col cols="6">
                            <p>
                              LAND USE <br />
                              <span>Residential</span>
                            </p>
                            <p>
                              CITY<br />
                              <span>{{ form.city }}</span>
                            </p>
                            <p>
                              STATE<br />
                              <span>{{ form.state }}</span>
                            </p>
                            <p>
                              LOT AREA<br />
                              <span>0.82</span>
                            </p>
                            <p>
                              YEAR BUILT<br />
                              <span>2000</span>
                            </p>
                          </b-col>
                          <b-col cols="6">
                            <p>
                              COUNTY<br />
                              <span>{{ form.county }}</span>
                            </p>
                            <p>
                              ZIP CODE<br />
                              <span>{{ form.zip }}</span>
                            </p>
                            <p>
                              PROPERTY ID<br />
                              <span>{{ form.id }}</span>
                            </p>
                          </b-col>
                        </b-row>
                      </div>
                    </b-tab>
                    <b-tab title="Projects"><p>I'm the second tab</p></b-tab>
                    <b-tab title="Documents"><p>I'm a disabled tab!</p></b-tab>
                  </b-tabs>
                </b-card>
              </div>
              <div class="py-2">
                <b-card>
                  <div>
                    <b-button v-b-toggle.collapse-1 variant="dark"
                      >Zonning and general plan</b-button
                    >
                    <b-collapse id="collapse-1" class="mt-2">
                      <p id="collapse-1"></p>
                      <b-card>
                        <b-button
                          variant="success"
                          style="background-color: #4e0eaf"
                          onclick=" window.open('https://www.codepublishing.com/CA/Greenfield','_blank')"
                          >Municipal code</b-button
                        >
                      </b-card>
                    </b-collapse>
                  </div>
                </b-card>
              </div>
            </b-col>
          </b-row>
        </b-col>
  
        <b-col cols="8" class="pl-2 py-3 rounded">
          <b-row>
            <div id="map" style="width: 100%; height: 100vh"></div>
          </b-row>
        </b-col>
      </b-row>
    </b-container>
  </template>
  
  <!-- <script>
  import axios from "axios";

  import { debounce } from "lodash";
  import { mapGetters } from "vuex";
  export default {
    async fetch({ store, route }) {
      await store.dispatch("polygons/get", route.query);
    },
    data() {
      return {
        access_token:
          "pk.eyJ1IjoiZWxnZXJhcmRvIiwiYSI6ImNsOG90NjFtMzFucG0zeWw1YWRheTV5ZmYifQ.87BCgCSXpjLIHkqGsWUW7g",
        map: {},
        config: {
          zoom: 17,
        },
        jsonCoords: {
          lng: null,
          lat: null,
        },
        draw: {},
        features: {},
        popup: {},
        geo: {},
        easeTo: {},
        marker: {},
        search: {},
        bounds: [
          [-116.98129, 32.564745], // Southwest coordinates
          [-117.082894, 33.076116], // Northeast coordinates
        ],
        coords: {
          lng: this.$route.query.lng,
          lat: this.$route.query.lat,
        },
        form: {
          address: null,
          apartment: null,
          city: null,
          state: null,
          country: null,
          id: null,
          zip: null,
          county: null,
        },
        polygonId: 0,
        hoveredStateId: null,
        geojsonArrays: [],
        popup: {},
        params: null,
        polygon: null,
        geojsonArrays: [],
        tileset: {
          url: "mapbox://martoast.citysandiego",
          sourceId: "citysandiego",
        },
      };
    },
    mounted() {
      this.createMap();
      this.onSetMarker();
      this.onSearch();
      this.onAddressChange();
      this.onDrawingTools();
    },
    computed: {
      ...mapGetters({
        places: "places/places",
        locations: "locations/locations",
        geojson: "geojson/geojson",
        parcel: "encode/parcel",
        polygons: "polygons/polygons",
      }),
    },
    methods: {
      createMap() {
        this.$mapboxgl.accessToken = this.access_token;
        this.map = new this.$mapboxgl.Map({
          container: "map",
          style: "mapbox://styles/soloskilos/cl9d4dush000214s2ave7hbqq",
          zoom: 15,
          pitch: 45,
          bearing: -17.6,
          antialias: true,
          center: this.coords,
          // maxBounds: this.bounds,
        });
        this.map.on("load", () => {
          this.popup = new this.$mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
          });
          this.map.addSource(this.tileset.sourceId, {
            type: "vector",
            url: this.tileset.url,
            generateId: true,
          });
          this.map.addLayer({
            id: this.tileset.sourceId,
            generateId: true,
            source: this.tileset.sourceId,
            "source-layer": this.tileset.sourceId,
            type: "fill",
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
            id: "parceline",
            "source-layer": this.tileset.sourceId,
            type: "line",
            source: this.tileset.sourceId,
            layout: {},
            paint: {
              "line-dasharray": [4, 4],
              "line-color": "#4D04AE",
              "line-width": 2,
            },
          });
          this.map.moveLayer(this.tileset.sourceId, "building-extrusion");
          this.map.on("mousemove", this.tileset.sourceId, (e) => {
            this.map.getCanvas().style.cursor = "pointer";
            let content = this.map.queryRenderedFeatures(e.point, {
              layers: [this.tileset.sourceId],
            });
            let id = content[0].id;
            if (this.mouseHover != id) {
              this.mouseHover = content[0].id;
              //this.showPopup(e.lngLat);
              this.params = e.lngLat;
              if (e.features.length > 0) {
                if (this.hoveredStateId !== null) {
                  this.map.setFeatureState(
                    {
                      source: this.tileset.sourceId,
                      sourceLayer: this.tileset.sourceId,
                      id: this.hoveredStateId,
                    },
                    { hover: false }
                  );
                }
                this.hoveredStateId = e.features[0].id;
                this.map.setFeatureState(
                  {
                    source: this.tileset.sourceId,
                    sourceLayer: this.tileset.sourceId,
                    id: this.hoveredStateId,
                  },
                  { hover: true }
                );
              }
            }
          });
          this.map.on("mouseleave", this.tileset.sourceId, () => {
            this.map.getCanvas().style.cursor = "";
            this.popup.remove();
            this.mouseHover = null;
            if (this.hoveredStateId !== null) {
              this.map.setFeatureState(
                {
                  source: this.tileset.sourceId,
                  sourceLayer: this.tileset.sourceId,
                  id: this.hoveredStateId,
                },
                { hover: false }
              );
            }
            this.hoveredStateId = null;
          });
          this.map.on("click", this.tileset.sourceId, (e) => {
            this.getAddressOnClick();
            this.coords = e.lngLat;
          });
        });
      },
      onDrawingTools() {
        this.area = new this.$MapboxDraw();
        this.map.addControl(this.draw, "top-right");
      },
      onSetMarker() {
        this.marker = new this.$mapboxgl.Marker({
          color: "blue",
          draggable: true,
        })
          .setLngLat(this.coords)
          .addTo(this.map);
        this.marker.on("dragend", (event) => {
          this.getAddress();
          this.coords = this.marker.getLngLat();
        });
      },
      onSearch() {
        this.search = this.$search.autofill({
          accessToken: this.access_token,
          options: { country: "us" },
        });
      },
      onAddressChange() {
        this.search.addEventListener("retrieve", (event) => {
          this.coords = event.detail.features[0].geometry.coordinates;
        });
      },
      onFitBounds() {
        this.map.fitBounds(this.geojsonArrays, {
          zoom: 18,
          speed: 3,
          duration: 2000,
        });
      },
      async getAddress() {
        let params = {
          lat: this.coords.lat,
          lng: this.coords.lng,
          access_token: this.access_token,
        };
        await this.$store.dispatch("places/get", params);
        this.form.address = this.places[0].place_name;
        this.form.id = this.places[0].id;
        this.form.zip = this.places[0].context[1].text;
        this.form.county = this.places[0].context[3].text; //p
        this.form.city = this.places[0].context[2].text; //p
        this.form.city = this.places[0].context[2].text; //p
        this.form.state = this.places[0].context[4].text; //p
      },
      async getAddressOnClick() {
        let params = {
          lat: this.coords.lat,
          lng: this.coords.lng,
          access_token: this.access_token,
        };
        await this.$store.dispatch("locations/get", params);
        this.form.address = this.locations[0].place_name;
        this.form.id = this.locations[0].id;
        this.form.zip = this.locations[0].context[1].text;
        this.form.county = this.locations[0].context[3].text; //p
        this.form.city = this.locations[0].context[2].text; //p
        this.form.city = this.locations[0].context[2].text; //p
        this.form.state = this.locations[0].context[4].text; //p
      },
    },
    watch: {
      coords: {
        deep: true,
        handler(value, old) {
          this.$router.push({
            query: this.coords,
          });
          this.marker.setLngLat(this.coords);
          this.map.easeTo({
            center: this.coords,
            zoom: 18,
            speed: 3,
            duration: 2500,
            curve: 2,
          });
        },
      },
      search: {
        deep: true,
        handler(value, old) {
          this.onAddressChange();
        },
      },
      params: debounce(async function (value) {
        console.log(value);
        await this.$store.dispatch("polygons/get", this.params);
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
        this.popup.setLngLat(center.getCenter()).setHTML(value).addTo(this.map);
      }, 500),
    },
  };
  </script> -->
  <style>
  .multitaskr {
    background-color: #4e0eaf;
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
  .details span {
    color: #4e0eaf;
  }
  .mapboxgl-popup {
    max-width: 400px;
    font: 15px/20px "Helvetica Neue", Arial, Helvetica, sans-serif;
  }
  </style>