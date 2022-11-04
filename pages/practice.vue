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
      geojsonArrays: [],
    };
  },

  mounted() {
    this.createMap();
    this.addLayer();
  },

  computed: {
    ...mapGetters({
      items: "locations/items",
    }),
  },

  methods: {
    createMap() {
      this.$mapboxgl.accessToken = this.access_token;
      this.map = new this.$mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        zoom: 11,
        center: this.coordinates,
      });
    },

    addLayer() {
      let hoveredStateId = null;

      this.map.on("load", () => {
        this.map.addSource("states", {
          type: "geojson",
          data: "https://docs.mapbox.com/mapbox-gl-js/assets/us_states.geojson",
        });

        // The feature-state dependent fill-opacity expression will render the hover effect
        // when a feature's hover state is set to true.
        this.map.addLayer({
          id: "state-fills",
          type: "fill",
          source: "states",
          layout: {},
          paint: {
            "fill-color": "#627BC1",
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              1,
              0.5,
            ],
          },
        });

        this.map.addLayer({
          id: "state-borders",
          type: "line",
          source: "states",
          layout: {},
          paint: {
            "line-color": "#627BC1",
            "line-width": 2,
          },
        });

        // When the user moves their mouse over the state-fill layer, we'll update the
        // feature state for the feature under the mouse.
        this.map.on("mousemove", "state-fills", (e) => {
          if (e.features.length > 0) {
            if (hoveredStateId !== null) {
              this.map.setFeatureState(
                { source: "states", id: hoveredStateId },
                { hover: false }
              );
            }
            hoveredStateId = e.features[0].id;
            this.map.setFeatureState(
              { source: "states", id: hoveredStateId },
              { hover: true }
            );
          }
        });

        // When the mouse leaves the state-fill layer, update the feature state of the
        // previously hovered feature.
        this.map.on("mouseleave", "state-fills", () => {
          if (hoveredStateId !== null) {
            this.map.setFeatureState(
              { source: "states", id: hoveredStateId },
              { hover: false }
            );
          }
          hoveredStateId = null;
        });
      });
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
