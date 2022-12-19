<template>
  <div id="map">

  </div>
</template>

<script>
export default{
  mounted(){
    this.$mapboxgl.accessToken = "pk.eyJ1IjoiZWxnZXJhcmRvIiwiYSI6ImNsOG90NjFtMzFucG0zeWw1YWRheTV5ZmYifQ.87BCgCSXpjLIHkqGsWUW7g";
      let map = new this.$mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/javy3r18/cl9fvwqli000p15qskifof42o",
        zoom: 17,
        pitch: 45, //inclination
        bearing: -17, // rotation
        center: [-117.157268, 32.713888],
        antialias: true,
      });
  }
}

</script>

<style>

html {
  height: -webkit-fill-available;
}

body {
  height: 100vh;
  height: -webkit-fill-available;
}

#map{
  width: 100%;
  height: 100vh;
}
</style>