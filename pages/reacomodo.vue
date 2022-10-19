<template>
  <b-container fluid class="m-0 p-0">
    <b-row>
      <b-col cols="2">
        <div class="m-3">
          <form class="d-flex flex-column">
            <input
              v-model="inputs.address"
              class="my-2"
              name="address"
              placeholder="Address"
              type="text"
              autocomplete="address-line1"
            />
          </form>
        </div>
      </b-col>
      <b-col cols="10">
        <div id="map"></div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { mapGetters } from "vuex";
import { debounce } from "lodash";
export default {
  data() {
    return {
      access_token:
        "pk.eyJ1IjoiZWxnZXJhcmRvIiwiYSI6ImNsOG90NjFtMzFucG0zeWw1YWRheTV5ZmYifQ.87BCgCSXpjLIHkqGsWUW7g",
      map: {},
      marker: {},
      search: {},
      inputs: {
        address: null,
      },
      coordinates: {
        lng: -117.04342,
        lat: 32.55252,
      },
      params:null,
      polygon: null,
      geojsonArrays: [],
      hoveredStateId: null,
      polygoncenter: null,
      mouseHover: null,
      popup: null,
    };
  },

  computed: {
    ...mapGetters({
      items: "locations/items",
      hoverlocation: "locationhover/items",
      geojson: "geojson/geojson",
      polygons: "polygons/polygons",
    }),
  },

  mounted() {
    this.createMap();
    this.setNewMarker();
    this.setAutoFill();
  },

  methods: {
    createMap() {
      this.$mapboxgl.accessToken = this.access_token;
      this.map = new this.$mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/javy3r18/cl9fvwqli000p15qskifof42o",
        zoom: 16,
        center: this.coordinates,
      });

      this.map.on("load", () => {
        this.popup = new this.$mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
        });

        this.map.addSource("parceltest2", {
          type: "vector",
          url: "mapbox://martoast.county_sandiego_city_sandiego",
          generateId: true,
        });

        this.map.addLayer({
          id: "county_sandiego_city_sandiego",
          generateId: true,
          source: "parceltest2",
          "source-layer": "county_sandiego_city_sandiego",
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
          "source-layer": "county_sandiego_city_sandiego",
          type: "line",
          source: "parceltest2",
          layout: {},
          paint: {
            "line-dasharray": [4, 4],
            "line-color": "#4D04AE",
            "line-width": 2,
          },
        });

        this.map.moveLayer("county_sandiego_city_sandiego", "building-extrusion");
        this.map.moveLayer("parceline", "building-extrusion");

        this.map.on("mousemove", "county_sandiego_city_sandiego", (e) => {
          let content = this.map.queryRenderedFeatures(e.point, {
            layers: ["county_sandiego_city_sandiego"],
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
                    source: "parceltest2",
                    sourceLayer: "county_sandiego_city_sandiego",
                    id: this.hoveredStateId,
                  },
                  { hover: false }
                );
              }
              this.hoveredStateId = e.features[0].id;
              this.map.setFeatureState(
                {
                  source: "parceltest2",
                  sourceLayer: "county_sandiego_city_sandiego",
                  id: this.hoveredStateId,
                },
                { hover: true }
              );
            }
          }
        });

        this.map.on("mouseleave", "county_sandiego_city_sandiego", () => {
          this.popup.remove();
          this.mouseHover = null;
          if (this.hoveredStateId !== null) {
            this.map.setFeatureState(
              {
                source: "parceltest2",
                sourceLayer: "county_sandiego_city_sandiego",
                id: this.hoveredStateId,
              },
              { hover: false }
            );
          }
          this.hoveredStateId = null;
        });
      });
    },

    setNewMarker() {
      this.marker = new this.$mapboxgl.Marker({
        color: "red",
        draggable: true,
      })
        .setLngLat(this.coordinates)
        .addTo(this.map);
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

    async showPopup(coordinates) {
      // let params = {
      //   lat: coordinates.lat,
      //   lng: coordinates.lng,
      // };

      // this.params = params;

      // debounce(async function () {
      //   console.log("bouncing");

      //   await this.$store.dispatch("polygons/get", params);
      //   let geojson = JSON.parse(this.polygons.geojson);

      //   let parseJson = geojson.coordinates[0];
      //   this.geojsonArrays = [];
      //   parseJson.forEach((item) => {
      //     let itemArray = [item[1], item[0]];
      //     this.geojsonArrays.push(itemArray);
      //   });
      //   const bounds = new this.$mapboxgl.LngLatBounds(
      //     this.geojsonArrays[0],
      //     this.geojsonArrays[0]
      //   );
      //   for (const coord of this.geojsonArrays) {
      //     bounds.extend(coord);
      //   }
      //   let center = bounds;

      //   this.popup
      //     .setLngLat(center.getCenter())
      //     .setHTML("Example")
      //     .addTo(this.map);
      // }, 2000);
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
  },

  watch: {
    coordinates: {
      deep: true,
      handler(value, old) {
        this.getAddress();
        this.marker.setLngLat(this.coordinates);
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
          .setHTML("Example")
          .addTo(this.map);
      }, 500),
    
  },
};
</script>

<style>
#map {
  width: 100%;
  height: 100vh;
}
</style>
