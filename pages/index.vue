<template>
  <b-container fluid class="m-0 p-0">
    <form>
<input name="address" autocomplete="shipping address-line1">
<input name="apartment" autocomplete="shipping address-line2">
<input name="city" autocomplete="shipping address-level2">
<input name="state" autocomplete="shipping address-level1">
<input name="country" autocomplete="shipping country">
</form>
    <div id="map"></div>
  </b-container>
</template>

<script>
export default {
  data() {
    return {
      access_token:
        "pk.eyJ1IjoiamF2eTNyMTgiLCJhIjoiY2w4b3Q3aTdmMDB6djNvbzhycGtmYXF1MSJ9.55Zc-lWR2Oc7YzjBt9S5ow",
      map: {},
    };
  },

  mounted() {
    this.createMap();
  },

  methods: {
    createMap() {
      this.$mapboxgl.accessToken = this.access_token;
      this.map = new this.$mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        zoom: 11,
        center: [107.61861, -6.90389],
      });

      this.$search.autofill({
        accessToken: this.access_token,
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
};
</script>
<style>
#map {
  width: 100%;
  height: 100vh;
}
</style>
