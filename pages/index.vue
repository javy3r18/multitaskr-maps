<template>
  <b-container fluid class="m-0 p-0">
    <b-row>
      <b-col>
        <div class="m-3">
          <form class="d-flex flex-column">
            <input
              class="my-2"
              name="address"
              placeholder="Address"
              type="text"
              autocomplete="address-line1"
            />
            <input
              class="my-2"
              name="apartment"
              placeholder="Apartment number"
              type="text"
              autocomplete="address-line2"
            />
            <input
              class="my-2"
              name="city"
              placeholder="City"
              type="text"
              autocomplete="address-level2"
            />
            <input
              class="my-2"
              name="state"
              placeholder="State"
              type="text"
              autocomplete="address-level1"
            />
            <input
              class="my-2"
              name="country"
              placeholder="Country"
              type="text"
              autocomplete="country"
            />
            <input
              class="my-2"
              name="postcode"
              placeholder="Postcode"
              type="text"
              autocomplete="postal-code"
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
export default {
  data() {
    return {
      access_token:
        "pk.eyJ1IjoiZWxnZXJhcmRvIiwiYSI6ImNsOG90NjFtMzFucG0zeWw1YWRheTV5ZmYifQ.87BCgCSXpjLIHkqGsWUW7g",
      map: {},
      marker: {},
      search: {},
      coordinates: {
        lng: 107.61861,
        lat: -6.90389,
      },
    };
  },

  mounted() {
    this.init();
  },

  methods: {
    init() {
      let successCallback = (location) => {
        this.success = true;
        this.coordinates.lat = location.coords.latitude;
        this.coordinates.lng = location.coords.longitude;
        this.createMap();
      };
      let errorCallback = (location) => {
        console.log("Error Location");
      };
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    },

    createMap() {
      this.$mapboxgl.accessToken = this.access_token;
      this.map = new this.$mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        zoom: 11,
        center: [this.coordinates.lng, this.coordinates.lat],
      });

      this.marker = new this.$mapboxgl.Marker({
        color: "green",
        draggable: true,
      })
        .setLngLat([this.coordinates.lng, this.coordinates.lat])
        .addTo(this.map);

        this.search = this.$search.autofill({
                accessToken: this.access_token,
                options: { country: "us" },
            });

      this.search.addEventListener("retrieve", (event) => {
        console.log(event);
                this.coordinates.lat =
                    event.detail.features[0].geometry.coordinates[1];
                this.coordinates.lng =
                    event.detail.features[0].geometry.coordinates[0];
                this.map.setCenter([
                    this.coordinates.lng,
                    this.coordinates.lat,
                ]);
            });

      // const search = new MapboxSearchBox();
      // search.accessToken = this.access_token;
      // this.map.addControl(search);

      // this.map.addControl(
      //   new this.$mapboxgl.FullscreenControl({
      //     container: document.querySelector("body"),
      //   })
      // );

      // this.map.addControl(
      //   new this.$mapboxgl.GeolocateControl({
      //     positionOptions: {
      //       enableHighAccuracy: true,
      //     },
      //     trackUserLocation: true,
      //     showUserHeading: true,
      //   })
      // );

      // mapboxsearch.autofill({
      //   accessToken: this.access_token,
      // });
    },
  },

  watch: {
        coordinates: {
            deep: true,
            handler(value, old) {
                this.marker.setLngLat([
                    this.coordinates.lng,
                    this.coordinates.lat,
                ]);
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
