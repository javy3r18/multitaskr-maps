<template>
  <b-container fluid class="m-0 p-0">
    <b-row>
      <b-col>
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
            <input
              v-model="inputs.aparment"
              class="my-2"
              name="apartment"
              placeholder="Apartment number"
              type="text"
              autocomplete="address-line2"
            />
            <input
              v-model="inputs.city"
              class="my-2"
              name="city"
              placeholder="City"
              type="text"
              autocomplete="address-level2"
            />
            <input
              v-model="inputs.state"
              class="my-2"
              name="state"
              placeholder="State"
              type="text"
              autocomplete="address-level1"
            />
            <input
              v-model="inputs.country"
              class="my-2"
              name="country"
              placeholder="Country"
              type="text"
              autocomplete="country"
            />
            <input
              v-model="inputs.postcode"
              class="my-2"
              name="postcode"
              placeholder="Postcode"
              type="text"
              autocomplete="postal-code"
            />
          </form>
        </div>
        <div class="m-3">
          <b-button
            style="background-color: #4e04af"
            @click="
              map.setStyle('mapbox://styles/javy3r18/cl8yrxo04000014py4v4pmavh')
            "
            >Multitakr Style</b-button
          >
          <b-button
            @click="
              map.setStyle(
                'mapbox://styles/elgerardo/cl8yrf6l1000e15o68btt9hgi'
              )
            "
            >Normal Style</b-button
          >
          <b-button
            @click="
              map.setStyle(
                'mapbox://styles/soloskilos/cl8ywrz0j000l14mrphfgsifg'
              )
            "
            >Satelite</b-button
          >
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
        aparment: null,
        city: null,
        state: null,
        country: null,
        postcode: null,
      },
      coordinates: {
        lng: -117.04342,
        lat: 32.55252,
      },
      polygon: null,
      geojsonArrays: [],
      hoveredStateId: null,
    };
  },

  mounted() {
    this.createMap();
    this.setNewMarker();
    this.setAutoFill();
    this.filterData();
  },

  computed: {
    ...mapGetters({
      items: "locations/items",
      geojson: "geojson/geojson",
    }),
  },

  methods: {
    // init() {
    //   let successCallback = (location) => {
    //     this.success = true;
    //     this.coordinates.lat = location.coords.latitude;
    //     this.coordinates.lng = location.coords.longitude;
    //     this.createMap();
    //   };
    //   let errorCallback = (location) => {
    //     console.log("Error Location");
    //   };
    //   navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    // },

    createMap() {
      this.$mapboxgl.accessToken = this.access_token;
      this.map = new this.$mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        zoom: 15,
        center: this.coordinates,
      });

      this.map.on("click", "building", (event) => {
        let bounds = this.polygon.getBounds();
        let center = bounds.getCenter();
        console.log(center);
        this.coordinates = center;
        console.log(this.coordinates);
      });

      this.map.on("load", () => {
        this.map.removeLayer("building");

        this.map.addSource("mapbox-streets", {
          type: "vector",
          url: "mapbox://mapbox.mapbox-streets-v8",
          generateId: true,
        });

        this.polygon = this.map.addLayer({
          id: "building",
          generateId: true,
          source: "mapbox-streets",
          "source-layer": "building",
          type: "fill",
          paint: {
            "fill-color": "rgba(66,100,251, 0.3)",
            "fill-outline-color": "rgba(66,100,251, 1)",
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              1,
              0.5,
            ],
          },
        });

        this.map.on("mousemove", "building", (e) => {
          if (e.features.length > 0) {
            if (this.hoveredStateId !== null) {
              this.map.setFeatureState(
                {
                  source: "mapbox-streets",
                  sourceLayer: "building",
                  id: this.hoveredStateId,
                },
                { hover: false }
              );
            }
            this.hoveredStateId = e.features[0].id;
            this.map.setFeatureState(
              {
                source: "mapbox-streets",
                sourceLayer: "building",
                id: this.hoveredStateId,
              },
              { hover: true }
            );
          }
        });

        this.map.on("mouseleave", "building", () => {
          if (this.hoveredStateId !== null) {
            this.map.setFeatureState(
              {
                source: "mapbox-streets",
                sourceLayer: "building",
                id: this.hoveredStateId,
              },
              { hover: false }
            );
          }
          this.hoveredStateId = null;
        });
      });
    },

    // addPolygon() {
    //   // if (this.map.getSource("maine")) {
    //   //   this.map.removeLayer("maine");
    //   //   this.map.removeLayer("outline");
    //   //   this.map.removeSource("maine");
    //   // }
    //   this.map.removeLayer("building");

    //   this.map.addSource("mapbox-streets", {
    //     type: "vector",
    //     url: "mapbox://mapbox.mapbox-streets-v8",
    //     generateId: true,
    //   });

    //   this.map.addLayer({
    //     id: "building",
    //     source: "mapbox-streets",
    //     "source-layer": "building",
    //     type: "fill",
    //     paint: {
    //       "fill-color": "rgba(66,100,251, 0.3)",
    //       "fill-outline-color": "rgba(66,100,251, 1)",
    //       "fill-opacity": [
    //         "case",
    //         ["boolean", ["feature-state", "hover"], false],
    //         1,
    //         0.5,
    //       ],
    //     },
    //   });

    //   this.map.on("mousemove", "building", (e) => {
    //     if (e.features.length > 0) {
    //       if (this.hoveredStateId !== null) {
    //         this.map.setFeatureState(
    //           {
    //             source: "mapbox-streets",
    //             sourceLayer: "building",
    //             id: this.hoveredStateId,
    //           },
    //           { hover: false }
    //         );
    //       }
    //       this.hoveredStateId = e.features[0].id;
    //       this.map.setFeatureState(
    //         {
    //           source: "mapbox-streets",
    //           sourceLayer: "building",
    //           id: this.hoveredStateId,
    //         },
    //         { hover: true }
    //       );
    //     }
    //   });

    //   this.map.on("mouseleave", "building", () => {
    //     if (this.hoveredStateId !== null) {
    //       this.map.setFeatureState(
    //         {
    //           source: "mapbox-streets",
    //           sourceLayer: "building",
    //           id: this.hoveredStateId,
    //         },
    //         { hover: false }
    //       );
    //     }
    //     this.hoveredStateId = null;
    //   });

    //   // Add a new layer to visualize the polygon.
    //   // this.map.addLayer({
    //   //   id: "maine",
    //   //   type: "fill",
    //   //   source: "maine", // reference the data source
    //   //   layout: {},
    //   //   paint: {
    //   //     "fill-color": "green", // blue color fill
    //   //     "fill-opacity": 0.5,
    //   //   },
    //   // });
    //   // Add a black outline around the polygon.
    //   //   this.map.addLayer({
    //   //     id: "outline",
    //   //     type: "line",
    //   //     source: "maine",
    //   //     layout: {},
    //   //     paint: {
    //   //       "line-color": "#072E01",
    //   //       "line-width": 3,
    //   //     },
    //   //   });
    // },

    setNewMarker() {
      this.marker = new this.$mapboxgl.Marker({
        color: "red",
        draggable: true,
      })
        .setLngLat(this.coordinates)
        .addTo(this.map);

      this.marker.on("dragend", this.onDragEnd);
    },

    setAutoFill() {
      this.search = this.$search.autofill({
        accessToken: this.access_token,
        options: { country: "us" },
      });
    },

    onDragEnd() {
      this.coordinates = this.marker.getLngLat();
    },

    onAddressChange() {
      this.search.addEventListener("retrieve", (event) => {
        this.coordinates = event.detail.features[0].geometry.coordinates;
        console.log(this.coordinates);
        this.map.easeTo({
          center: this.coordinates,
          zoom: 15,
          speed: 3,
          duration: 2500,
          curve: 2,
        });
        this.addPolygon();
      });
    },

    async getAddress() {
      await this.$store.dispatch("locations/get", this.coordinates);
      this.inputs.address = this.items.features[0].place_name;
      // this.addPolygon();
    },

    filterData() {
      this.geojson.forEach((item) => {
        let itemArray = [item.lng, item.lat];
        this.geojsonArrays.push(itemArray);
      });
    },
  },

  watch: {
    coordinates: {
      deep: true,
      handler(value, old) {
        this.getAddress();
        this.marker.setLngLat(this.coordinates);
        console.log(this.marker.getLngLat());
        this.map.easeTo({
          center: this.coordinates,
          zoom: 16,
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
  },
};
</script>
<style>
#map {
  width: 100%;
  height: 100vh;
}
</style>
