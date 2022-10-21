<template>
  <b-container fluid class="m-0 p-0">
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
                  v-model="inputs.address"
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
            <b-card-text class="text-address">{{ inputs.address }}</b-card-text>
          </div>
          <hr />
          <b-tabs content-class="mt-3">
            <b-tab title="Details" active>
              <div class="details">
                <b-row>
                  <b-col cols="6">
                    <p>
                      CITY<br />
                      <span id="underline">{{ inputs.city }}</span>
                    </p>
                    <p>
                      STATE<br />
                      <span id="underline">{{ inputs.state }}</span>
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
                      <span id="underline">{{ inputs.county }}</span>
                    </p>
                    <p>
                      ZIP CODE<br />
                      <span>{{ inputs.zip }}</span>
                    </p>
                    <p>
                      <b-icon
                        id="infoicon"
                        icon="info-circle"
                        font-scale="0.8"
                      ></b-icon>

                      PROPERTY ID<br />
                      <span>{{ inputs.id | capitalize }}</span>
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
</template>

<script>
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
        apartment: null,
        city: null,
        state: null,
        country: null,
        id: null,
        zip: null,
        county: null,
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
    };
  },
  filters: {
    capitalize: function (value) {
      if (!value) return "";
      value = value.toString();
      return value.slice(8);
    },
  },

  computed: {
    ...mapGetters({
      items: "locations/items",
      polygons: "polygons/polygons",
    }),
  },

  mounted() {
    this.createMap();
    this.setAutoFill();
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
      });

      this.map.on("load", () => {
        this.getSelectedAddress();

        this.popup = new this.$mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
        });

        this.map.addSource("parceltest2", {
          type: "vector",
          url: "mapbox://martoast.citysandiego",
          generateId: true,
        });

        this.map.addLayer({
          id: "citysandiego",
          generateId: true,
          source: "parceltest2",
          "source-layer": "citysandiego",
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
          "source-layer": "citysandiego",
          type: "line",
          source: "parceltest2",
          layout: {},
          paint: {
            "line-dasharray": [4, 4],
            "line-color": "#4D04AE",
            "line-width": 2,
          },
        });

        this.map.moveLayer("citysandiego", "building-extrusion");
        this.map.moveLayer("parceline", "building-extrusion");

        this.map.on("mousemove", "citysandiego", (e) => {
          this.map.getCanvas().style.cursor = "pointer";
          let content = this.map.queryRenderedFeatures(e.point, {
            layers: ["citysandiego"],
          });
          let id = content[0].id;
          if (this.mouseHover != id) {
            // console.log(content[0].properties.parcel_id);
            this.mouseHover = content[0].id;
            //this.showPopup(e.lngLat);
            this.params = e.lngLat;
            if (e.features.length > 0) {
              if (this.hoveredStateId !== null) {
                this.map.setFeatureState(
                  {
                    source: "parceltest2",
                    sourceLayer: "citysandiego",
                    id: this.hoveredStateId,
                  },
                  { hover: false }
                );
              }
              this.hoveredStateId = e.features[0].id;
              this.map.setFeatureState(
                {
                  source: "parceltest2",
                  sourceLayer: "citysandiego",
                  id: this.hoveredStateId,
                },
                { hover: true }
              );
            }
          }
        });
        this.map.on("click", "citysandiego", (e) => {
          this.onClickParcel();
          this.coordinates = e.lngLat;
        });

        this.map.on("mouseleave", "citysandiego", () => {
          this.map.getCanvas().style.cursor = "";
          this.popup.remove(); // TODO: esta madre me quitar el popup cuando aun no se a generado. Arreglar!!!
          this.mouseHover = null;
          if (this.hoveredStateId !== null) {
            this.map.setFeatureState(
              {
                source: "parceltest2",
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

    async getSelectedAddress() {
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

      this.map.addSource("mainaddress", {
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
        source: "mainaddress",
        type: "fill",
        paint: {
          "fill-color": "#3D8F00",
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

      this.map.fitBounds(bounds, {
        padding: 20,
      });
    },

    onAddressChange() {
      this.search.addEventListener("retrieve", (event) => {
        this.coordinates.lat = event.detail.features[0].geometry.coordinates[1];
        this.coordinates.lng = event.detail.features[0].geometry.coordinates[0];
        this.locationCenter();
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
    async onClickParcel() {
      let params = {
        lat: this.coordinates.lat,
        lng: this.coordinates.lng,
        access_token: this.access_token,
      };
      await this.$store.dispatch("locations/get", params);
      console.log(this.items);
      this.inputs.address = this.items.features[0].place_name;
      this.inputs.id = this.items.features[0].id;
      this.inputs.zip = this.items.features[0].context[1].text;
      this.inputs.county = this.items.features[0].context[3].text; //p
      this.inputs.city = this.items.features[0].context[2].text; //p
      this.inputs.city = this.items.features[0].context[2].text; //p
      this.inputs.state = this.items.features[0].context[4].text; //p
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
      await this.$store.dispatch("polygons/get", this.params);
      try{
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
      }catch (error){
        console.log(error);
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
  font-family:Arial, Helvetica, sans-serif ;
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
