<template>
  <div>
    <div class="ui grid">
      <div class="four wide column red" style="position: relative; z-index: 1">
        <form class="ui segment large form" @submit.prevent="">
          <div class="ui message red" v-show="error">
            Please enter your location manually
          </div>
          <div class="ui segment">
            <div class="field">
              <div
                class="ui right icon input large"
                :class="{ loading: spinner }"
              >
                <input
                  type="text"
                  placeholder="Enter your address"
                  v-model="address"
                  id="autocomplete"
                />
                <i
                  class="dot link circle icon"
                  @click="locatorButtonPressed"
                ></i>
              </div>
            </div>
            <div class="field">
              <div class="two fields">
                <div class="field">
                  <select v-model="type">
                    <option value="restaurant">Restaurant</option>
                  </select>
                </div>
                <div class="field">
                  <select v-model="radius">
                    <option value="5">5KM</option>
                    <option value="10">10KM</option>
                    <option value="15">15KM</option>
                    <option value="20">20KM</option>
                  </select>
                </div>
              </div>
            </div>
            <button class="ui button" @click="findCloseBuyButtonPressed">
              Go
            </button>
          </div>
        </form>
        <div
          class="ui segment"
          style="max-height: 400px; overflow: scroll"
          v-show="places.length !== 0"
        >
          <div class="ui divided items">
            <div
              class="item"
              v-for="(place, ind) in places"
              :key="place.id"
              @click="showInfoWindow(ind)"
              :class="{ active: ind === activeIndex }"
              style="cursor: pointer"
            >
              <div class="content">
                <div class="header">{{ place.name }}</div>
                <div class="meta">{{ place.vicinity }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="map"></div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      key: "AIzaSyC4_m7mmLO59skzR9hyYEj1sgxKuHjtzo4",
      address: "",
      error: "",
      spinner: false,
      type: "restaurant",
      radius: "10",
      places: [],
      markers: [],
      map: null,
      activeIndex: -1,
    };
  },
  async mounted() {
    const { latitude, longitude } = await this.currentLatAndLong();
    console.log(latitude, longitude);
    new google.maps.places.Autocomplete(
      document.getElementById("autocomplete"),
      {
        bounds: new google.maps.LatLngBounds(new google.maps.LatLng()),
      }
    );

    this.map = new google.maps.Map(document.getElementById("map"), {
      center: new google.maps.LatLng(latitude, longitude),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    });
  },
  methods: {
    async showPlacesOnMap() {
      const infoWindow = new google.maps.InfoWindow();
      this.places.forEach((place) => {
        const lat = place.geometry.location.lat;
        const lng = place.geometry.location.lng;
        const placeId = place.place_id;
        let imageUrl = "";

        //Place map api
        if (place.photos) {
          imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${place.photos[0].photo_reference}&key=${this.key}`;
        }

        const marker = new google.maps.Marker({
          position: new google.maps.LatLng(lat, lng),
          map: this.map,
        });

        this.markers.push(marker);
        google.maps.event.addListener(marker, "click", async () => {
          //place detail api
          const URL = `http://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?key=${this.key}&place_id=${placeId}`;
          const result = await axios.get(URL);
          const placeDetails = result.data.result;

          //info window allows to pop up a mini window when we click on the marker
          //put your creative like review,rating, image HTML code here
          infoWindow.setContent(
            `<div class="ui header">${placeDetails.name}</div>
            ${placeDetails.formatted_address}
            ${placeDetails.formatted_phone_number}
            ${placeDetails.rating}
            <div style="max-width:400px"><img src="${imageUrl}" style="width:100%"/></div>`
          );
          infoWindow.open(map, marker);
        });
      });
    },
    async findCloseBuyButtonPressed() {
      try {
        const { latitude, longitude } = await this.currentLatAndLong();

        //nearby search api
        const URL = `http://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&type=${
          this.type
        }&radius=${this.radius * 1000}&key=${this.key}`;
        const result = await axios.get(URL);
        this.places = result.data.results;
        this.showPlacesOnMap();
        console.log(result);
      } catch (error) {
        console.error(error.message);
      }
    },
    async locatorButtonPressed() {
      try {
        this.spinner = true;
        //check if the browser is support location
        if (navigator.geolocation) {
          const { latitude, longitude } = await this.currentLatAndLong();
          this.getAddressFrom(latitude, longitude);
          this.showUserLocation(latitude, longitude);

          return;
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        this.spinner = false;
      }
    },
    showUserLocation(latitude, longitude) {
      // Show & center the Map based oon
      var map = new google.maps.Map(this.$refs["map"], {
        zoom: 15,
        center: new google.maps.LatLng(latitude, longitude),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      });

      new google.maps.Marker({
        position: new google.maps.LatLng(latitude, longitude),
        map: map,
      });
    },
    async getAddressFrom(lat, long) {
      try {
        const result = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=AIzaSyC4_m7mmLO59skzR9hyYEj1sgxKuHjtzo4`
        );
        const { formatted_address } = result.data.results[0];

        if (result.data.error_message) throw error_message;
        this.address = formatted_address;
        this.spinner = false;
      } catch (error) {
        console.log(err);
        this.spinner = false;
      }
    },
    currentLatAndLong() {
      return new Promise((resolve, reject) => {
        //Prompt user permission for knowing location
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (position.coords.latitude && position.coords.longitude) {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            }
          },
          (error) => {
            reject(error.message);
          }
        );
      });
    },
    showInfoWindow(index) {
      this.activeIndex = index;
      new google.maps.event.trigger(this.markers[index], "click");
    },
  },
};
</script>
<style>
.ui.button,
.dot.circle.icon {
  background-color: #ff5a5f;
  color: white;
}

.pac-icon {
  display: none !important;
}

.pac-item {
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
}

.pac-item:hover {
  background-color: #ececec;
}

.pac-item-query {
  font-size: 16px;
}

#map {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.active {
  background: #ff5a5f !important;
  padding: 10px;
}
</style>